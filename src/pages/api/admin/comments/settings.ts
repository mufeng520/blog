import type { APIRoute } from 'astro';
import {
  getAdminCommentSettings,
  jsonError,
  jsonOk,
  updateAdminCommentSettings,
  validateAdminToken,
} from '../../../../components/lib/native-comments';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    validateAdminToken(request.headers);
    return jsonOk(await getAdminCommentSettings());
  } catch (error) {
    return jsonError(error);
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    validateAdminToken(request.headers);
    const body = await request.json();
    return jsonOk(await updateAdminCommentSettings(body));
  } catch (error) {
    return jsonError(error);
  }
};
