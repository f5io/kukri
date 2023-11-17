import { iterate_children } from './jsx-runtime.js';
import type { Props } from './types';

function createProvider<T = any>(key: {}) {
	return async function*({ children, value }: Props<{ value: T }>) {
		const root: Map<{}, T> = yield null;

		const old_value = root.get(key);
		root.set(key, value);

		const child_props = Array().concat(children);
		yield* iterate_children(child_props);

		if (old_value != null) {
			root.set(key, old_value);
		} else {
			root.delete(key);
		}
	}
}

type Context<T = any> = {
	Provider: ReturnType<typeof createProvider<T | void>>;
	key: {};
}

export function createContext<T = any>(): Context<T> {
	const key = {};
	return {
		Provider: createProvider<T | void>(key),
		key,
	}
}

export function* useContext<T = any>(symbol: Context<T>) {
	const root: Map<{}, unknown> = yield null;
	return root.get(symbol.key) as T;
}
