import { jsx } from './jsx-runtime.js';
import type { Children, Props, UnknownProps } from './types';

export { createContext, useContext } from './context.js';
export { Suspense } from './suspense.js';
export { ErrorBoundary } from './error.js';

export function createElement(
	type: string | Function,
	config: UnknownProps,
	children?: Children
) {
	return jsx(type, Object.assign(config, { children }));
}

export { Props };
