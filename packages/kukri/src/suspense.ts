import { jsx } from './jsx-runtime.js';
import { createContext, useContext } from './context.js';
import type { Props, Children, SuspenseItems } from './types';

const key = {};

type Parent = { parent: Promise<void>; root: Map<{}, unknown> };
const Context = createContext<Parent>();

function random_key() {
	return Math.random().toString(36).slice(4,8);
}

export async function* Suspense({
	children,
	fallback
}: Props<{ fallback: Children }>): JSX.Node {
	const current = yield null;
	const context = yield* useContext<Parent>(Context) ?? {};

	const root = context?.root ?? current;
	const suspense = (root.get(key) ?? { count: 0, items: [], key: random_key() }) as SuspenseItems;

	const id = 's' + (suspense.count++) + '_' + suspense.key;

	let promise = async function() {
		let cache: string[] | null = [];

		let resolve: () => void;
		let inner = new Promise<void>(res => (resolve = res));

		// because suspense boundaries run in parallel, we need to copy
		// the context and provide a new one here, to avoid shared contexts
		let scoped_context;
		scoped_context = new Map([ ...current.entries() ]);

		const it = jsx(Context.Provider, {
			value: { parent: inner, root },
			children: [
				jsx('div', {
					'hx-target': `[hx-suspense-id=${id}]`,
					'hx-swap': 'outerHTML',
					'hx-suspense': true,
					children,
				})
			]
		});

		let done, value;
		while (!done) {
			({ done, value } = await it.next(scoped_context));
			if (done === false) {
				cache.push(value ?? '');
			}
		}

		scoped_context = null;
		resolve!();

		return function*() {
			yield cache.join('');
			cache = null;
		}();
	}();

	if (context?.parent != null) {
		let it = promise;
		promise = context.parent.then(() => it);
	}

	suspense.items.push(promise);
	root.set(key, suspense);

	return yield* jsx('div', {
		'hx-suspense-id': id,
		children: fallback,
	});
}

export { key as SUSPENSE_KEY };
