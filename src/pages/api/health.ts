import type { APIRoute } from 'astro';
import { getRuntimeAIMode } from '../../lib/ai/config';
import { jsonResponse } from '../../lib/http/api';

export const prerender = false;

export const GET: APIRoute = async () => {
  const mode = getRuntimeAIMode();
  return jsonResponse(
    {
      ok: true,
      status: 'ok',
      service: 'askoptsam',
      mode: mode.mode,
      timestamp: new Date().toISOString(),
    },
    200,
    { 'cache-control': 'no-store' },
  );
};
