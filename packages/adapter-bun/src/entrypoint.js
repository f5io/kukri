import './__$routes';
import { join } from 'node:path';
import { Router } from 'kukri/router';

const router = Router.get_instance().get_router();

const asset_root = join(process.cwd(), 'static');
router.all('*', async (request) => {
  const url = new URL(request.url); 
  const file = join(asset_root, url.pathname);
  const actual = Bun.file(file);
  if (actual.size !== 0) {
    return new Response(actual);
  }
});

Bun.serve({
  port: 1337,
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
});
