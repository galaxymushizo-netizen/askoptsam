import type { APIRoute } from 'astro';
import { apiError } from '../../lib/http/api';

export const prerender = false;

const response = () =>
  apiError(
    'image_disabled',
    'Image explanation is disabled. No image was received, stored, or sent to an AI provider. Describe what you see in the chat instead.',
    503,
  );

export const GET: APIRoute = async () => response();
export const POST: APIRoute = async () => response();
export const PUT: APIRoute = async () => response();
