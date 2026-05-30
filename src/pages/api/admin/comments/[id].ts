import type { APIRoute } from 'astro';
import {
  jsonError,
  jsonOk,
  updateCommentStatus,
  validateAdminToken,
} from '../../../../components/lib/native-comments';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    validateAdminToken(request.headers);
    const body = await request.json();
    const data = await updateCommentStatus(params.id || '', body?.action);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
};
