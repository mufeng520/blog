import type { APIRoute } from 'astro';
import {
  jsonError,
  jsonOk,
  listAdminComments,
  validateAdminToken,
} from '../../../../components/lib/native-comments';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    validateAdminToken(request.headers);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const data = await listAdminComments(url.searchParams.get('status'), page, pageSize);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
};
