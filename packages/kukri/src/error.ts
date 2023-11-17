import { jsx, Fragment } from './jsx-runtime.js';
import type { Props, Children } from './types';

export async function* ErrorBoundary({
	children,
	fallback
}: Props<{ fallback: Children }>): JSX.Node {
	const current = yield null;

	let cache: string[] | null = [];
	try {
		await (async function() {
			const it = jsx(Fragment, { children });

			let done, value;
			while (!done) {
				({ done, value } = await it.next(current));
				if (done === false) {
					cache.push(value ?? '');
				}
			}
		})();

		yield cache.join('');
		cache = null;
	} catch(err) {
		return yield* jsx(Fragment, { children: fallback });
	}
};
