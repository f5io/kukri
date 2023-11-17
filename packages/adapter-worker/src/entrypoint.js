import './__$routes';
import { Router } from 'kukri/router';
const router = Router.get_instance().get_router();

// static asset handler
import ASSET_MANIFEST from '__STATIC_CONTENT_MANIFEST';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

router.all('*', async (request, env, ctx) => {
  try {
		return await getAssetFromKV(
			{
				request,
				waitUntil(promise) { return ctx.waitUntil(promise) },
			},
			{
				ASSET_NAMESPACE: env.__STATIC_CONTENT,
				ASSET_MANIFEST: JSON.parse(ASSET_MANIFEST),
			}
		);
	} catch {}
});

export default {
	async fetch(...args) {
		try {
      const response = await router.handle(...args);
			if (response == null) return new Response('not found', { status: 404 });
			return response;
    } catch(err) {
      return new Response(
        err.message ?? 'internal server error',
        { status: 500 }
      );
    }
	},
};
