import type { APIRoute } from 'astro';
import {
  createComment,
  jsonError,
  jsonOk,
  listPublicComments,
} from '../../../components/lib/native-comments';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const data = await listPublicComments(url.searchParams.get('path'), page, pageSize);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = await createComment(body, request.headers);
    return jsonOk(data, 201);
  } catch (error) {
    return jsonError(error);
  }
};
