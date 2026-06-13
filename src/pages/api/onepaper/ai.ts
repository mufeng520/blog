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
  const lowerPath = cleanPath.toLowerCase();

  if (endpoint === 'image' && lowerPath.endsWith('/chat/completions')) {
    url.pathname = `${cleanPath.slice(0, -'/chat/completions'.length)}/images/generations`;
  } else if (endpoint === 'chat' && lowerPath.endsWith('/images/generations')) {
    url.pathname = `${cleanPath.slice(0, -'/images/generations'.length)}/chat/completions`;
  }

  const normalizedPath = url.pathname.replace(/\/+$/, '');
  if (normalizedPath === '' || normalizedPath === '/' || normalizedPath.endsWith('/v1')) {
    url.pathname = `${normalizedPath === '' || normalizedPath === '/' ? '/v1' : normalizedPath}/${
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

const readableHost = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).host;
  } catch {
    return 'unknown host';
  }
};

const normalizeProviderErrorText = (status: number, text: string, statusText?: string) => {
  const cleaned = text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const fallback = cleaned || statusText || 'Request failed';
  const lower = fallback.toLowerCase();

  if (status === 502 && (lower.includes('bad gateway') || lower.includes('cloudflare'))) {
    return '\u4e0a\u6e38\u7f51\u5173 502\uff1a\u56fe\u7247\u4e2d\u8f6c\u7ad9\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u6216\u5207\u6362\u5176\u4ed6\u56fe\u7247 API\u3002';
  }

  if (status === 503 && lower.includes('no available compatible accounts')) {
    return '\u4e2d\u8f6c\u7ad9\u8d26\u53f7\u6c60 503\uff1a\u6ca1\u6709\u53ef\u7528\u7684\u517c\u5bb9\u8d26\u53f7\uff0c\u8bf7\u5207\u6362\u6a21\u578b/API\uff0c\u6216\u7b49\u4e2d\u8f6c\u7ad9\u6062\u590d\u3002';
  }

  if (status === 403 && lower.includes('forbidden')) {
    return '\u63a5\u53e3\u8fd4\u56de 403 Forbidden\uff1a\u4e2d\u8f6c\u7ad9\u62d2\u7edd\u8bbf\u95ee\uff0c\u8bf7\u68c0\u67e5 Base URL\u3001API Key\u3001\u767d\u540d\u5355\u6216\u8be5\u6a21\u578b\u6743\u9650\u3002';
  }

  if ((lower.includes('quality') && lower.includes('\u4e0d\u5408\u6cd5')) || lower.includes('invalid quality')) {
    return '\u56fe\u7247\u63a5\u53e3\u62d2\u7edd quality \u53c2\u6570\u3002\u5f53\u524d\u7248\u672c\u5df2\u9ed8\u8ba4\u4e0d\u53d1\u9001 quality\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u540e\u91cd\u8bd5\uff1b\u5982\u679c\u4ecd\u51fa\u73b0\uff0c\u8bf7\u68c0\u67e5\u7ebf\u4e0a\u4ee3\u7801\u662f\u5426\u5df2\u66f4\u65b0\u3002';
  }

  return fallback.length > 700 ? `${fallback.slice(0, 700)}...` : fallback;
};

const readErrorText = async (res: Response) => {
  const text = await res.text().catch(() => '');
  return normalizeProviderErrorText(res.status, text, res.statusText);
};

const looksOpenAICompatible = (api: APIConfig): boolean => {
  const apiKey = api.apiKey.trim();
  const baseUrl = api.baseUrl.trim().toLowerCase();
  const model = `${api.textModel || ''} ${api.imageModel || ''}`.toLowerCase();

  return (
    api.provider === 'openai' ||
    apiKey.startsWith('sk-') ||
    model.includes('gpt-') ||
    model.includes('dall-e') ||
    baseUrl.includes('/v1/')
  );
};

const aspectToSize = (aspect?: string, model = ''): string => {
  const normalizedModel = model.toLowerCase();
  if (normalizedModel.includes('gpt-image')) {
    switch (aspect) {
      case '16:9':
      case '4:3':
      case '3:2':
        return '1536x1024';
      case '3:4':
      case '9:16':
      case '2:3':
        return '1024x1536';
      case '1:1':
      default:
        return '1024x1024';
    }
  }

  if (normalizedModel.includes('dall-e-2')) {
    return '1024x1024';
  }

  switch (aspect) {
    case '16:9':
    case '3:2':
      return '1792x1024';
    case '4:3':
      return '1024x1024';
    case '3:4':
    case '9:16':
    case '2:3':
      return '1024x1792';
    case '1:1':
    default:
      return '1024x1024';
  }
};

const describeOpenAIImageTarget = (api: APIConfig) => {
  const endpoint = getOpenAIEndpoint(api.baseUrl, 'image');
  return `${api.imageModel || 'gpt-image-2'} @ ${readableHost(endpoint)}`;
};

const isNetworkFetchFailure = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    error instanceof TypeError ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    message.includes('network')
  );
};

const fetchGeneratedImage = async (imageUrl: string): Promise<string> => {
  const safeUrl = assertExternalHttpsUrl(imageUrl);
  let imgRes: Response;

  try {
    imgRes = await fetchExternal(safeUrl, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8' },
    });
  } catch (error) {
    if (isNetworkFetchFailure(error)) {
      return safeUrl;
    }
    throw error;
  }

  if (!imgRes.ok) {
    throw new Error(`\u751f\u6210\u56fe\u7247\u5df2\u8fd4\u56de\u94fe\u63a5\uff0c\u4f46\u4ee3\u7406\u4e0b\u8f7d\u5931\u8d25 ${imgRes.status}\uff1a${await readErrorText(imgRes)}`);
  }

  return responseToDataUrl(imgRes);
};

const shouldTryChatImageFallback = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  const status = typeof (error as { status?: unknown })?.status === 'number'
    ? (error as { status: number }).status
    : null;

  return (
    message.includes('messages is required') ||
    message.includes('not found') ||
    message.includes('cannot post') ||
    message.includes('unsupported endpoint') ||
    status === 404 ||
    status === 405
  );
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
  const model = api.imageModel || 'gpt-image-2';
  const body: Record<string, unknown> = {
    model,
    prompt: opts.prompt,
    size: aspectToSize(opts.aspectRatio, model),
    n: 1,
  };

  const res = await fetchExternal(getOpenAIEndpoint(api.baseUrl, 'image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error(`OpenAI image error ${res.status} (${describeOpenAIImageTarget(api)}): ${await readErrorText(res)}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  const data = await res.json();
  const imageData = data.data?.[0];
  if (imageData?.b64_json) return `data:image/png;base64,${imageData.b64_json}`;
  if (!imageData?.url) throw new Error('No image URL returned from OpenAI');
  return fetchGeneratedImage(imageData.url);
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
    const error = new Error(`OpenAI chat image error ${res.status} (${api.imageModel || 'gpt-image-2'} @ ${readableHost(getOpenAIEndpoint(api.baseUrl, 'chat'))}): ${await readErrorText(res)}`);
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned from chat image API');

  const markdownMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  const plainUrlMatch = content.trim().match(/^(https?:\/\/\S+)$/);
  const imageUrl = markdownMatch?.[1] || plainUrlMatch?.[1];

  if (imageUrl) {
    return fetchGeneratedImage(imageUrl);
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

const listOpenAIModels = async (api: APIConfig): Promise<string[]> => {
  const endpoint = getModelsEndpoint(api.baseUrl, 'openai');
  const res = await fetchExternal(endpoint, {
    headers: { Authorization: `Bearer ${api.apiKey}` },
  });
  if (!res.ok) throw new Error(`Models error ${res.status}: ${await readErrorText(res)}`);
  const data = await res.json();
  return (data.data || []).map((m: any) => m.id).filter(Boolean);
};

const listGeminiModels = async (api: APIConfig): Promise<string[]> => {
  const endpoint = getModelsEndpoint(api.baseUrl, 'gemini');
  const url = new URL(endpoint);
  url.searchParams.set('key', api.apiKey);
  const res = await fetchExternal(url.toString());
  if (!res.ok) throw new Error(`Models error ${res.status}: ${await readErrorText(res)}`);
  const data = await res.json();
  return (data.models || [])
    .map((m: any) => m.name?.replace(/^models\//, '') || m.name)
    .filter(Boolean);
};

const listModels = async (api: APIConfig): Promise<string[]> => {
  const useOpenAICompat = looksOpenAICompatible(api);

  try {
    return useOpenAICompat ? await listOpenAIModels(api) : await listGeminiModels(api);
  } catch (primaryError) {
    if (!useOpenAICompat) {
      try {
        return await listOpenAIModels(api);
      } catch {
        // Surface the primary Gemini-style failure below.
      }
    }

    throw new Error(
      `${getErrorMessage(primaryError)}. If this gateway does not expose a models endpoint, type the model name manually.`
    );
  }
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
        return json({
          text: looksOpenAICompatible(api)
            ? await callOpenAITextAPI(api, body.opts as TextAPIOptions)
            : await callGeminiTextAPI(api, body.opts as TextAPIOptions),
        });
      case 'openai-text':
        return json({ text: await callOpenAITextAPI(api, body.opts as TextAPIOptions) });
      case 'gemini-image':
        return json({
          image: looksOpenAICompatible(api)
            ? await callOpenAIImageAPI(api, body.opts as ImageAPIOptions)
            : await callGeminiImageAPI(api, body.opts as ImageAPIOptions),
        });
      case 'openai-image': {
        try {
          return json({ image: await callOpenAIImageAPI(api, body.opts as ImageAPIOptions) });
        } catch (error) {
          if (shouldTryChatImageFallback(error)) {
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
