import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { GoogleGenAI } from '@google/genai';
import type { APIConfig } from '../../../lib/onepaper/types';

export const prerender = false;

type ServerOperation =
  | 'gemini-text'
  | 'openai-text'
  | 'gemini-image'
  | 'openai-image'
  | 'openai-chat-image'
  | 'models';

interface TextAPIOptions {
  prompt: string;
  images?: string[];
  responseSchema?: unknown;
  responseMimeType?: string;
}

interface ImageAPIOptions {
  prompt: string;
  aspectRatio?: string;
  images?: {
    colorImageBase64?: string;
    styleImageBase64?: string;
    layoutImageBase64?: string | null;
    editImageBase64?: string;
    maskImageBase64?: string;
    contentImageBase64s?: string[];
  };
}

const clientCache = new Map<string, GoogleGenAI>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unknown error');

const isPrivateIpv4 = (host: string): boolean => {
  const parts = host.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

const assertExternalHttpsUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS API URLs are allowed.');
  }

  if (
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost') ||
    hostname === 'metadata.google.internal' ||
    isPrivateIpv4(hostname)
  ) {
    throw new Error('Local or private network URLs are not allowed.');
  }

  return url.toString();
};

const fetchExternal = async (rawUrl: string, init?: RequestInit): Promise<Response> => {
  const url = assertExternalHttpsUrl(rawUrl);
  return fetch(url, init);
};

const getOpenAIEndpoint = (baseUrl: string, endpoint: 'chat' | 'image'): string => {
  const fallback =
    endpoint === 'chat'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.openai.com/v1/images/generations';
  const rawUrl = (baseUrl || fallback).trim() || fallback;
  const url = new URL(rawUrl);
  const cleanPath = url.pathname.replace(/\/+$/, '');

  if (cleanPath === '' || cleanPath === '/' || cleanPath.endsWith('/v1')) {
    url.pathname = `${cleanPath === '' || cleanPath === '/' ? '/v1' : cleanPath}/${
      endpoint === 'chat' ? 'chat/completions' : 'images/generations'
    }`;
  }

  return assertExternalHttpsUrl(url.toString());
};

const getGeminiClient = (apiConfig: APIConfig): GoogleGenAI => {
  const baseUrl = apiConfig.baseUrl.trim();
  if (baseUrl) assertExternalHttpsUrl(baseUrl);

  const key = `${apiConfig.provider}-${baseUrl}-${apiConfig.apiKey}`;
  if (!clientCache.has(key)) {
    const opts: any = { apiKey: apiConfig.apiKey };
    if (baseUrl) opts.httpOptions = { baseUrl };
    clientCache.set(key, new GoogleGenAI(opts));
  }
  return clientCache.get(key)!;
};

const base64ToPart = (base64String: string) => {
  const mimeMatch = base64String.match(/^data:(.*?);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const base64Data = base64String.replace(/^data:(.*?);base64,/, '');
  return { inlineData: { mimeType, data: base64Data } };
};

const responseToDataUrl = async (res: Response, fallbackMimeType = 'image/png') => {
  const arrayBuffer = await res.arrayBuffer();
  const mimeType = res.headers.get('content-type') || fallbackMimeType;
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
};

const processImageInput = async (input: string | undefined | null) => {
  if (!input) return null;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetchExternal(input);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/png';
    return {
      inlineData: {
        mimeType,
        data: Buffer.from(arrayBuffer).toString('base64'),
      },
    };
  }
  return base64ToPart(input);
};

const readErrorText = async (res: Response) => {
  const text = await res.text().catch(() => '');
  return text || res.statusText || 'Request failed';
};

const aspectToSize = (aspect?: string): string => {
  switch (aspect) {
    case '16:9':
      return '1792x1024';
    case '4:3':
      return '1024x1024';
    case '3:4':
    case '9:16':
      return '1024x1792';
    case '1:1':
    default:
      return '1024x1024';
  }
};

const callGeminiTextAPI = async (api: APIConfig, opts: TextAPIOptions): Promise<string> => {
  const ai = getGeminiClient(api);
  const parts: any[] = [{ text: opts.prompt }];

  if (opts.images) {
    for (const img of opts.images) {
      const p = await processImageInput(img);
      if (p) parts.push(p);
    }
  }

  const config: any = {};
  if (opts.responseMimeType) config.responseMimeType = opts.responseMimeType;
  if (opts.responseSchema) config.responseSchema = opts.responseSchema;

  const response = await ai.models.generateContent({
    model: api.textModel || 'gemini-2.5-flash',
    contents: { parts },
    config,
  });

  return response.text?.trim() || '';
};

const callOpenAITextAPI = async (api: APIConfig, opts: TextAPIOptions): Promise<string> => {
  const messages: any[] = [];

  if (opts.images && opts.images.length > 0) {
    const content: any[] = [{ type: 'text', text: opts.prompt }];
    for (const img of opts.images) {
      content.push({ type: 'image_url', image_url: { url: img } });
    }
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: opts.prompt });
  }

  const res = await fetchExternal(getOpenAIEndpoint(api.baseUrl, 'chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.apiKey}`,
    },
    body: JSON.stringify({
      model: api.textModel || 'gpt-4o',
      messages,
      ...(opts.responseSchema || opts.responseMimeType === 'application/json'
        ? { response_format: { type: 'json_object' } }
        : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}: ${await readErrorText(res)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
};

const callGeminiImageAPI = async (api: APIConfig, opts: ImageAPIOptions): Promise<string> => {
  const ai = getGeminiClient(api);
  const parts: any[] = [{ text: opts.prompt }];

  if (opts.images) {
    const refs = [
      { key: opts.images.colorImageBase64, label: 'REFERENCE 1: COLOR PALETTE SOURCE.' },
      { key: opts.images.styleImageBase64, label: 'REFERENCE 2: VISUAL STYLE SOURCE.' },
      { key: opts.images.layoutImageBase64, label: 'REFERENCE 3: LAYOUT STRUCTURE.' },
      { key: opts.images.editImageBase64, label: '**INPUT IMAGE FOR EDITING**' },
      { key: opts.images.maskImageBase64, label: 'Reference Image: Inpainting Mask' },
    ];

    for (const ref of refs) {
      if (ref.key) {
        const p = await processImageInput(ref.key);
        if (p) {
          parts.push({ text: ref.label });
          parts.push(p);
        }
      }
    }

    if (opts.images.contentImageBase64s) {
      parts.push({ text: 'Reference Images: Content Assets' });
      for (const img of opts.images.contentImageBase64s) {
        const p = await processImageInput(img);
        if (p) parts.push(p);
      }
    }
  }

  const generateConfig: any = { imageConfig: { aspectRatio: opts.aspectRatio || '1:1' } };
  if ((api.imageModel || '').includes('gemini-3-pro')) generateConfig.imageConfig.imageSize = '1K';

  const response = await ai.models.generateContent({
    model: api.imageModel || 'nado-banana-2',
    contents: { parts },
    config: generateConfig,
  });

  const finishReason = response.candidates?.[0]?.finishReason;
  const responseParts = response.candidates?.[0]?.content?.parts || [];

  for (const part of responseParts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  if (finishReason === 'PROHIBITED_CONTENT' || finishReason === 'SAFETY') {
    throw new Error('Content blocked by safety filters. Please revise and try again.');
  }

  if (finishReason === 'RECITATION') {
    throw new Error('Content blocked due to recitation policy. Please revise your description.');
  }

  const textContent = responseParts[0]?.text;
  if (textContent) throw new Error(`AI refused: ${textContent}`);
  throw new Error(`No image generated. FinishReason: ${finishReason || 'UNKNOWN'}`);
};

const callOpenAIImageAPI = async (api: APIConfig, opts: ImageAPIOptions): Promise<string> => {
  const res = await fetchExternal(getOpenAIEndpoint(api.baseUrl, 'image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.apiKey}`,
    },
    body: JSON.stringify({
      model: api.imageModel || 'gpt-image-2',
      prompt: opts.prompt,
      size: aspectToSize(opts.aspectRatio),
      quality: 'standard',
      n: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI image error ${res.status}: ${await readErrorText(res)}`);
  }

  const data = await res.json();
  const imageData = data.data?.[0];
  if (imageData?.b64_json) return `data:image/png;base64,${imageData.b64_json}`;
  if (!imageData?.url) throw new Error('No image URL returned from OpenAI');

  const imgRes = await fetchExternal(imageData.url);
  if (!imgRes.ok) throw new Error(`Failed to fetch generated image: ${imgRes.status}`);
  return responseToDataUrl(imgRes);
};

const callOpenAIChatImageAPI = async (api: APIConfig, opts: ImageAPIOptions): Promise<string> => {
  const res = await fetchExternal(getOpenAIEndpoint(api.baseUrl, 'chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.apiKey}`,
    },
    body: JSON.stringify({
      model: api.imageModel || 'gpt-image-2',
      messages: [{ role: 'user', content: opts.prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI chat image error ${res.status}: ${await readErrorText(res)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned from chat image API');

  const markdownMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  const plainUrlMatch = content.trim().match(/^(https?:\/\/\S+)$/);
  const imageUrl = markdownMatch?.[1] || plainUrlMatch?.[1];

  if (imageUrl) {
    const imgRes = await fetchExternal(imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch generated image: ${imgRes.status}`);
    return responseToDataUrl(imgRes);
  }

  const base64Match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
  if (base64Match) return `data:image/png;base64,${base64Match[1]}`;

  throw new Error(`Could not extract image from response: ${content.substring(0, 200)}`);
};

const getModelsEndpoint = (baseUrl: string, provider: APIConfig['provider']): string => {
  const rawUrl = baseUrl.trim();
  if (provider === 'gemini') {
    const root = rawUrl || 'https://generativelanguage.googleapis.com';
    const url = new URL(root);
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/v1beta/models`;
    return assertExternalHttpsUrl(url.toString());
  }

  const fallback = 'https://api.openai.com/v1';
  const url = new URL(rawUrl || fallback);
  const cleanPath = url.pathname.replace(/\/+$/, '');

  if (cleanPath.endsWith('/chat/completions')) {
    url.pathname = `${cleanPath.slice(0, -'/chat/completions'.length)}/models`;
  } else if (cleanPath.endsWith('/images/generations')) {
    url.pathname = `${cleanPath.slice(0, -'/images/generations'.length)}/models`;
  } else if (cleanPath === '' || cleanPath === '/') {
    url.pathname = '/v1/models';
  } else {
    url.pathname = `${cleanPath}/models`;
  }

  return assertExternalHttpsUrl(url.toString());
};

const listModels = async (api: APIConfig): Promise<string[]> => {
  const endpoint = getModelsEndpoint(api.baseUrl, api.provider);

  if (api.provider === 'gemini') {
    const url = new URL(endpoint);
    url.searchParams.set('key', api.apiKey);
    const res = await fetchExternal(url.toString());
    if (!res.ok) throw new Error(`Models error ${res.status}: ${await readErrorText(res)}`);
    const data = await res.json();
    return (data.models || [])
      .map((m: any) => m.name?.replace(/^models\//, '') || m.name)
      .filter(Boolean);
  }

  const res = await fetchExternal(endpoint, {
    headers: { Authorization: `Bearer ${api.apiKey}` },
  });
  if (!res.ok) throw new Error(`Models error ${res.status}: ${await readErrorText(res)}`);
  const data = await res.json();
  return (data.data || []).map((m: any) => m.id).filter(Boolean);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const operation = body?.operation as ServerOperation;
    const api = body?.api as APIConfig | undefined;

    if (!api || !api.provider || !api.apiKey?.trim()) {
      return json({ error: 'Missing API provider or API key.' }, 400);
    }

    switch (operation) {
      case 'gemini-text':
        return json({ text: await callGeminiTextAPI(api, body.opts as TextAPIOptions) });
      case 'openai-text':
        return json({ text: await callOpenAITextAPI(api, body.opts as TextAPIOptions) });
      case 'gemini-image':
        return json({ image: await callGeminiImageAPI(api, body.opts as ImageAPIOptions) });
      case 'openai-image': {
        try {
          return json({ image: await callOpenAIImageAPI(api, body.opts as ImageAPIOptions) });
        } catch (error) {
          if (getErrorMessage(error).includes('messages is required')) {
            return json({ image: await callOpenAIChatImageAPI(api, body.opts as ImageAPIOptions) });
          }
          throw error;
        }
      }
      case 'openai-chat-image':
        return json({ image: await callOpenAIChatImageAPI(api, body.opts as ImageAPIOptions) });
      case 'models':
        return json({ models: await listModels(api) });
      default:
        return json({ error: 'Unknown AI operation.' }, 400);
    }
  } catch (error) {
    return json({ error: getErrorMessage(error) }, 500);
  }
};
