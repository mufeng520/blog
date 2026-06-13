export const AI_PROXY_ENDPOINT = '/api/onepaper/ai';

export type AIProxyJson<T> = ({ error?: string } & Partial<T>) | null;

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unknown error');

const compactDetail = (detail?: string) =>
  (detail || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600);

export const getAIProxyNetworkErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();
  const looksClosed =
    lower.includes('failed to fetch') ||
    lower.includes('load failed') ||
    lower.includes('networkerror') ||
    lower.includes('fetch failed') ||
    lower.includes('connection closed') ||
    lower.includes('err_connection_closed') ||
    lower.includes('socket hang up') ||
    lower.includes('terminated') ||
    lower.includes('timeout');

  const hint = looksClosed
    ? '无法连接 AI 代理接口（/api/onepaper/ai）：请求在到达或等待后端时被关闭。请确认当前部署支持服务端函数/API 路由；如果是在生图时发生，请提高 Vercel 函数 maxDuration，或改用 Node 后端部署。'
    : '无法连接 AI 代理接口（/api/onepaper/ai）：请确认后端 API 路由已部署，且当前站点不是纯静态托管。';

  return `${hint} (${message})`;
};

export const getAIProxyStatusErrorMessage = (status: number, detail?: string): string => {
  let hint: string;

  if (status === 404) {
    hint = 'AI 代理接口返回 404：当前部署没有命中 /api/onepaper/ai。请确认不是纯静态托管，并重新部署 Astro server 输出。';
  } else if (status === 405) {
    hint = 'AI 代理接口返回 405：/api/onepaper/ai 已存在，但当前请求方法不被部署环境转发。请确认服务端函数部署完整。';
  } else if (status === 413) {
    hint = 'AI 代理接口返回 413：请求体过大，通常是上传/参考图的 base64 数据超过部署平台限制。请压缩图片或减少参考图。';
  } else if (status === 502 || status === 503 || status === 504) {
    hint = 'AI 代理接口网关中断或超时：后端函数已被调用，但上游模型服务或部署平台提前断开。请稍后重试，或提高函数超时时间。';
  } else if (status >= 500) {
    hint = 'AI 代理接口执行失败：后端函数已响应，但调用上游模型服务时出错。';
  } else {
    hint = `AI proxy request failed: HTTP ${status}`;
  }

  const text = compactDetail(detail);
  return text ? `${hint} (${text})` : hint;
};

export const readAIProxyJson = async <T>(res: Response): Promise<{ data: AIProxyJson<T>; text: string }> => {
  let text = '';
  try {
    text = await res.text();
  } catch (error) {
    return { data: null, text: getErrorMessage(error) };
  }

  if (!text.trim()) return { data: null, text: '' };

  try {
    return { data: JSON.parse(text) as AIProxyJson<T>, text };
  } catch {
    return { data: null, text };
  }
};
