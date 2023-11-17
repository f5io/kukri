#!/usr/bin/env node
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { program, Option } from 'commander';
import { kukri_builder } from '../cli/plugins/builder';
import { build, type BuildOptions } from 'esbuild';
import glob from 'fast-glob';
import { join } from 'node:path';
import { register } from 'node:module';
import watch from 'node-watch';
import pkg from '../../package.json';
import { createReadStream, promises } from 'node:fs';
import { Readable } from 'node:stream';
import { arrayBuffer } from 'node:stream/consumers';

import { createServer } from 'node:http';
import { createServerAdapter, Response } from '@whatwg-node/server';

const cwd = process.cwd();
const src = join(cwd, 'src');
const files = await glob(join(src, '/{,**/}*'));

const options: BuildOptions = {
  format: 'esm' as const,
  target: 'esnext',
  platform: 'node' as const,
  outdir: './.kukri',
  outbase: 'src',
  jsxImportSource: 'kukri',
  jsx: 'automatic' as const,
  entryPoints: files,
};

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version);

program.command('build')
  .description('build static output for a specific deployment target')
  .option('-o, --outdir <string>', 'the output directory', './dist')
  .addOption(new Option('-t, --target <string>', 'the build output target').choices([ 'node', 'worker', 'bun' ]).default('node'))
  .action(async ({ outdir, target }) => {
    options.plugins = [
      kukri_builder({
        src,
        cwd,
        mode: 'build',
        target,
        outdir: outdir ?? './dist',
        external: [ '__STATIC_CONTENT_MANIFEST' ],
      })
    ];

    try {
      await build(options);
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  });

program.command('dev')
  .description('run a dev server that watches for any file changes')
  .addOption(new Option('-p, --port <number>', 'port number').env('PORT').default(1337))
  .action(async ({ port }) => {
    options.plugins = [
      kukri_builder({
        src,
        cwd,
        mode: 'dev',
        target: 'node',
        outdir: './dist',
        external: [ '__STATIC_CONTENT_MANIFEST' ],
      })
    ];

    try {
      console.log('running build');
      await build(options);
      register('hot-esm', import.meta.url);      

      let { default: $instance } = await import(join(cwd, `.kukri/__$routes.js`));

      $instance.get_router().all('*', async (request: Request) => {
        const url = new URL(request.url); 
        try {
          const file = join(cwd, 'static', url.pathname);
          await promises.stat(file);
          const stream = createReadStream(file);
          return new Response(await arrayBuffer(Readable.toWeb(stream)));
        } catch {}
      });

      const adapter = createServerAdapter(async (request: Request) => {
        try {
          const response = await $instance.get_router().handle(request);
          if (response == null) return new Response('not found', { status: 404 });
          return response;
        } catch(err: any) {
          console.log(err);
          return new Response(
            err.message ?? 'internal server error',
            { status: 500 }
          );
        }
      });

      const server = createServer(adapter);
      server.listen(port, () => {
        console.log('dev server running on port', port);
      });

      const watcher = watch(src, { recursive: true });
      watcher.on('change', debounce_trailing_edge(async (evt, filename) => {
        console.log('change detected');
        if (filename.includes('src/routes')) {
          const files = await glob(join(src, '/{,**/}*'));
          options.entryPoints = files;
        }
        //$instance.flush();
        await build(options);
      }, 250));
      watcher.on('ready', () => {
        console.log('dev mode ready');
      });
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  });

program.parse();

function debounce_trailing_edge<T extends (...args: any[]) => any>(callback: T, delay = 0) {
  let timeout_id: number;
  return function(...args: Parameters<T>) {
    if (timeout_id !== null) clearTimeout(timeout_id); 
    timeout_id = setTimeout(callback, delay, ...args);
  }
}
