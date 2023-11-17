import { join, dirname } from 'node:path';
import type { PluginBuild } from 'esbuild';

export function kukri_finaliser({
  cwd,
  target,
  tmp_outdir,
}: {
  cwd: string;
  target: 'node' | 'bun' | 'worker';
  tmp_outdir: string;
}) {
  return {
    name: 'kukri:finaliser',
    setup(build: PluginBuild) {
      build.onResolve({ filter: /\.\/__\$routes/ }, () => ({
        path: join(tmp_outdir, '__$routes.js'),
      }));

      build.onResolve({ filter: /\.\/__\$runtime/ }, () => ({
        path: join(tmp_outdir, '__$runtime.js'),
      }));

      build.onEnd(() => {
        console.log('finaliser complete');
      });
    }
  };
}
