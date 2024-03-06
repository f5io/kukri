import dedent from 'dedent';
import { dirname, join, relative } from 'node:path';
import { promises as fs } from 'node:fs';

import {
  namedTypes as n,
  builders as b,
} from 'ast-types';
import { transform, CompilationError } from './ast-tools';

import { print } from 'recast';
import { Parser } from 'acorn';
import typescript from 'acorn-typescript';
// @ts-expect-error
const parser = Parser.extend(typescript());

import { resolve } from 'import-meta-resolve';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { PluginBuild, TransformOptions } from 'esbuild';
import { kukri_finaliser } from './finaliser';

export function kukri_builder({
  src,
  cwd,
  outdir,
  external,
  mode,
  target,
}: {
  src: string;
  cwd: string;
  outdir: string;
  external?: string[];
  mode: 'build' | 'dev',
  target: 'node' | 'bun' | 'worker';
}) {
  // global unique action id
  let count = 0;
  function next_id(
    prefix: string,
    hash: string = (count++).toString(16).padStart(2, '0')
  ): n.Identifier {
    return b.identifier(`${prefix}_${hash}`);
  }
  
  let actions: n.ExportNamedDeclaration[] = [];
  let dependencies: Map<string, n.ImportDeclaration> = new Map();

  let build_has_error = false;

  return {
    name: 'kukri:builder',
    setup(build: PluginBuild) {
      const options = build.initialOptions;
      const routes = (options.entryPoints as string[]).filter(
        x => typeof x === 'string' && /\/src\/routes\/(.*)page\.[jt]sx$/.test(x)
      );

      build.onStart(() => {
        count = 0;
        build_has_error = false;
        actions = [];
        dependencies = new Map();
      });

      build.onLoad({ filter: /\.[jt]sx$/ }, async (args) => {
        const code = await fs.readFile(args.path, 'utf8');

        let ast = parser.parse(code, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }) as n.Program;

        const file = relative(
          cwd,
          args.path,
        );

        function convert_error({ message, start, end }: CompilationError) {
          let location
          if (start && end) {
            let lineText = code.split(/\r\n|\r|\n/g)[start.line - 1]
            let lineEnd = start.line === end.line ? end.column : lineText.length
            location = {
              file,
              line: start.line,
              column: start.column,
              length: lineEnd - start.column,
              lineText,
            }
          }
          return { text: message, location }
        }

        const import_path = relative(
          dirname(args.path),
          src,
        );

        try {
          let warnings;
          ({ ast, warnings } = transform(
            ast,
            actions,
            dependencies,
            args.path,
            import_path,
            next_id,
          ));
          
          const contents = print(ast).code;
          return {
            resolveDir: cwd,
            contents,
            warnings: warnings.map(convert_error),
            loader: 'tsx',
          };
        } catch(err) {
          build_has_error = true;
          return { errors: [ convert_error(err as CompilationError) ] };
        }
      });

      build.onEnd(async () => {
        if (build_has_error) return;
        const tmp_outdir = join(cwd, options.outdir!);
        let routes_output = `
          import { iterator_to_stream } from 'kukri/router';
        `;

        let templ: string;
        if (mode === 'dev') {
          routes_output += `
            const url = new URL(import.meta.url);
            const { default: $instance } = await import('./__$runtime.js' + url.search);
          `;

          templ = `
            console.log('adding', '__PATH__', 'at', '__FILE__');
            $instance.get_router().all('__PATH__', async (...args) => {
              const [ request ] = args;
              const { default: route } = await import('__FILE__');
              const response = await route(...args);
              if ('next' in response && typeof response.next === 'function') {
                return new Response(iterator_to_stream(response, new Map()));
              } else {
                return response;
              }
            });
          `;
        } else {
          routes_output += `
            import { default as $instance } from './__$runtime.js';
          `;

          templ = `
            console.log('adding', '__PATH__', 'at', '__FILE__');
            $instance.get_router().all('__PATH__', async (...args) => {
              const [ request ] = args;
              const { default: route } = await import('__FILE__');
              const response = await route(...args);
              if ('next' in response && typeof response.next === 'function') {
                return new Response(iterator_to_stream(response, new Map()));
              } else {
                return response;
              }
            });
          `;
        }

        let actions_output = `
          import { Router } from 'kukri/router'; 
          const $instance = Router.get_instance();
        `;

        for (let route of routes) {
          let [, path] = route.split('/src/routes');
          route = './' + join('routes', path.replace(/\.[jt]sx$/, '.js'));
          path = path.replaceAll(/\[([^\]]+)\]/g, ':$1');

          const pathname = dirname(path);

          routes_output += templ 
            .replaceAll('__PATH__', pathname)
            .replaceAll('__FILE__', route);
        }

        routes_output += `
          export default $instance;
        `;

        const ast = b.program([
          ...[ ...dependencies.values() ],
          ...actions,
          b.exportDefaultDeclaration(
            b.identifier('$instance')
          )
        ]);

        actions_output += print(ast).code;

        const [
          routes_content,
          actions_content,
        ] = await Promise.all([
          build.esbuild.transform(routes_output, {
            loader: 'tsx',
            format: options.format,
            target: options.target,
            platform: options.platform,
            jsxImportSource: options.jsxImportSource,
            jsx: options.jsx,
          }),
          build.esbuild.transform(actions_output, {
            loader: 'tsx',
            format: options.format,
            target: options.target,
            platform: options.platform,
            jsxImportSource: options.jsxImportSource,
            jsx: options.jsx,
          }),
        ]);

        await Promise.all([
          fs.writeFile(join(tmp_outdir, '__$routes.js'), routes_content.code),
          fs.writeFile(join(tmp_outdir, '__$runtime.js'), actions_content.code),
        ]);

        console.log('wrote new runtime');

        if (mode === 'build') {
          const entry = resolve(
            `@kukri/adapter-${target}`,
            pathToFileURL(cwd).href + '/x.js',
          );

          await build.esbuild.build({
            ...options,
            entryPoints: [ fileURLToPath(entry) ],
            ...(
              target === 'node'
              ? {
                banner: {
                  'js': dedent`
                    import { createRequire } from 'node:module';
                    const require = createRequire(import.meta.url);
                  `
                }
              }
              : {}
            ),
            outdir: join(cwd, outdir),
            outbase: void 0,
            outExtension: { '.js': '.mjs' },
            external,
            bundle: true,
            splitting: true,
            treeShaking: true, 
            plugins: [
              kukri_finaliser({
                cwd,
                target,
                tmp_outdir,
              }),
            ],
          });
        }
      });
    }
  };
}
