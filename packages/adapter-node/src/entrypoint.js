import './__$routes';
import { Router } from 'kukri/router';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { createReadStream, promises } from 'node:fs';
import { Readable } from 'node:stream';
import { arrayBuffer } from 'node:stream/consumers';
import { createServerAdapter, Response } from '@whatwg-node/server';

const router = Router.get_instance().get_router();

const asset_root = join(process.cwd(), 'static');
router.all('*', async (request) => {
  const url = new URL(request.url); 
  try {
    const file = join(asset_root, url.pathname);
    await promises.stat(file);
    const stream = createReadStream(file);
    return new Response(await arrayBuffer(Readable.toWeb(stream)));
  } catch {}
});

const adapter = createServerAdapter(async (request) => {
  try {
    const response = await router.handle(request);
    if (response == null) return new Response('not found', { status: 404 });
    return response;
  } catch(err) {
    return new Response(
      err.message ?? 'internal server error',
      { status: 500 }
    );
  }
});

const server = createServer(adapter);
server.listen(1337);
