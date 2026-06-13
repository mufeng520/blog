import type { APIConfig, RequestLogEntry } from '../types';
import { addRequestLog, getAPISettings } from './apiKeyStore';

type ServerOperation =
    | 'gemini-text'
    | 'openai-text'
    | 'gemini-image'
    | 'openai-image'
    | 'openai-chat-image';

interface TextAPIOptions {
    prompt: string;
    images?: (string | File)[];
    responseSchema?: any;
    responseMimeType?: string;
}

interface ImageAPIOptions {
    prompt: string;
    aspectRatio?: string;
    preferredApiId?: string;
    images?: {
        colorImageBase64?: string;
        styleImageBase64?: string;
        layoutImageBase64?: string | null;
        editImageBase64?: string;
        maskImageBase64?: string;
        contentImageBase64s?: string[];
    };
}

const AI_PROXY_ENDPOINT = '/api/onepaper/ai';

const now = () => Date.now();

const logRequest = (entry: Omit<RequestLogEntry, 'id' | 'timestamp'>) => {
    addRequestLog({ id: crypto.randomUUID(), timestamp: now(), ...entry });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const normalizeTextImages = async (images?: (string | File)[]): Promise<string[] | undefined> => {
    if (!images?.length) return undefined;
    return Promise.all(images.map((img) => (typeof img === 'string' ? img : fileToBase64(img))));
};

const callAIProxy = async <T,>(operation: ServerOperation, api: APIConfig, opts: unknown): Promise<T> => {
    const res = await fetch(AI_PROXY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, api, opts }),
    });

    const data = await res.json().catch(() => null) as ({ error?: string } & Partial<T>) | null;
    if (!res.ok || data?.error) {
        throw new Error(data?.error || `AI proxy request failed: ${res.status}`);
    }

    return data as T;
};

const isChatCompletionsEndpoint = (baseUrl: string): boolean => {
    const normalized = baseUrl.toLowerCase();
    return normalized.includes('chat.completions') || normalized.includes('chat/completions');
};

export async function callGeminiTextAPI(api: APIConfig, opts: TextAPIOptions): Promise<string> {
    const data = await callAIProxy<{ text: string }>('gemini-text', api, {
        ...opts,
        images: await normalizeTextImages(opts.images),
    });
    return data.text || '';
}

export async function callOpenAITextAPI(api: APIConfig, opts: TextAPIOptions): Promise<string> {
    const data = await callAIProxy<{ text: string }>('openai-text', api, {
        ...opts,
        images: await normalizeTextImages(opts.images),
    });
    return data.text || '';
}

export async function callTextAPI(opts: TextAPIOptions): Promise<{ text: string; usedAPI: APIConfig }> {
    const settings = getAPISettings();
    const enabled = settings.textAPIs.filter((a) => a.enabled);
    if (enabled.length === 0) throw new Error('NO_TEXT_API_CONFIGURED');

    let lastError: Error | null = null;

    for (const api of enabled) {
        const start = now();
        try {
            const text = api.provider === 'gemini'
                ? await callGeminiTextAPI(api, opts)
                : await callOpenAITextAPI(api, opts);

            logRequest({
                type: 'text',
                provider: api.provider,
                model: api.textModel || '',
                baseUrl: api.baseUrl,
                success: true,
                latencyMs: now() - start,
            });
            return { text, usedAPI: api };
        } catch (e: any) {
            lastError = e;
            logRequest({
                type: 'text',
                provider: api.provider,
                model: api.textModel || '',
                baseUrl: api.baseUrl,
                success: false,
                latencyMs: now() - start,
                error: e.message || String(e),
            });
        }
    }

    throw lastError || new Error('All text APIs failed');
}

export async function callGeminiImageAPI(api: APIConfig, opts: ImageAPIOptions): Promise<string> {
    const data = await callAIProxy<{ image: string }>('gemini-image', api, opts);
    return data.image;
}

export async function callOpenAIImageAPI(api: APIConfig, opts: ImageAPIOptions): Promise<string> {
    const data = await callAIProxy<{ image: string }>('openai-image', api, opts);
    return data.image;
}

export async function callOpenAIChatImageAPI(api: APIConfig, opts: ImageAPIOptions): Promise<string> {
    const data = await callAIProxy<{ image: string }>('openai-chat-image', api, opts);
    return data.image;
}

export async function callImageAPI(opts: ImageAPIOptions): Promise<{ url: string; usedAPI: APIConfig }> {
    const settings = getAPISettings();
    let enabled = settings.imageAPIs.filter((a) => a.enabled);
    if (enabled.length === 0) throw new Error('NO_IMAGE_API_CONFIGURED');

    if (opts.preferredApiId) {
        const preferred = enabled.find((a) => a.id === opts.preferredApiId);
        if (preferred) enabled = [preferred];
    }

    let lastError: Error | null = null;

    for (const api of enabled) {
        const start = now();
        try {
            const url = api.provider === 'gemini'
                ? await callGeminiImageAPI(api, opts)
                : isChatCompletionsEndpoint(api.baseUrl)
                    ? await callOpenAIChatImageAPI(api, opts)
                    : await callOpenAIImageAPI(api, opts);

            logRequest({
                type: 'image',
                provider: api.provider,
                model: api.imageModel || '',
                baseUrl: api.baseUrl,
                success: true,
                latencyMs: now() - start,
            });
            return { url, usedAPI: api };
        } catch (e: any) {
            lastError = e;
            logRequest({
                type: 'image',
                provider: api.provider,
                model: api.imageModel || '',
                baseUrl: api.baseUrl,
                success: false,
                latencyMs: now() - start,
                error: e.message || String(e),
            });
        }
    }

    throw lastError || new Error('All image APIs failed');
}
