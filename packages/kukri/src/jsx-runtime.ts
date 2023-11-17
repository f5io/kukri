const jsxFragment = 'jsx.Fragment'

import { Router, Ref, type Handler } from './router.js';
import type { Child, ClassName, Context, Props, UnknownProps } from './types';

declare global {
  namespace JSX {
    type Node = AsyncGenerator<string | null, void, Context>;
    type PromiseLike<T> = Promise<T> | T;
    type ServerAction = (...args: any[]) => PromiseLike<Response | Node> | string; 

    interface FormElementAttributes {
      action?: ServerAction
    }

    interface ButtonElementAttributes {
      formaction?: ServerAction
    }

    type InputElementAttributes = 
      | {
        type: 'submit'
        formaction?: ServerAction
        [key: string]: any
      }
      | {
        type: string
        [key: string]: any
      }

    interface IntrinsicAttributes {
      class?: ClassName
      className?: ClassName
      ['hx-get']?: ServerAction 
      ['hx-post']?: ServerAction 
      ['hx-put']?: ServerAction 
      ['hx-patch']?: ServerAction 
      ['hx-delete']?: ServerAction 
      [key: string]: any
    }

    interface IntrinsicElements {
      form: IntrinsicAttributes & FormElementAttributes
      button: IntrinsicAttributes & ButtonElementAttributes
      input: IntrinsicAttributes & InputElementAttributes
      [key: string]: IntrinsicAttributes
    }
  }
}

const self_closing_tags = [
  'area', 'base', 'br', 'col', 'embed',
  'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
];

export async function* iterate_children(children: Child[]): JSX.Node {
  const current = yield null;
  const concurrent: Promise<string>[] = [];

  // concurrent
  for (const child of children) {
    if (child == null || typeof child === 'boolean') continue;
    concurrent.push(async function() {
      if (typeof child === 'number' || typeof child === 'string') {
        return child.toString(); 
      }

      let it;
      if (Array.isArray(child)) {
        it = iterate_children(child);
      } else {
        it = child;
      }
      
      let done, value, output = '';
      while (!done) {
        ({ done, value } = await it.next(current));
        if (done === false) {
          output += (value ?? '');
        }
      }
      return output;
    }());
  }

  for (const result of concurrent) {
    yield await result;
  }

  // waterfall
  //for (const child of children) {
    //if (child == null || typeof child === 'boolean') continue;

    //if (Array.isArray(child)) {
      //yield *iterate_children(child);
    //} else if (typeof child === 'string' || typeof child === 'number') {
      //yield child.toString();
    //} else {
      //yield* child;
    //}
  //}
}

function* iterate_class_names(cn: ClassName): Iterable<string> {
  if (typeof cn === 'string') {
    yield cn;
  }
  if (typeof cn === 'object') {
    if (Array.isArray(cn)) {
      for (const c of cn) {
        if (typeof c !== 'boolean') {
          yield ' ';
          yield* iterate_class_names(c);
        }
      }
    } else {
      for (const k in cn) {
        if (cn[k]) {
          yield ` ${k}`;
        }
      }
    }
  }
}

function* iterate_props(props: UnknownProps) {
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'boolean' && value === true) {
      yield ` ${key}`;
      continue;
    }

    let val = value;
    if (key === 'class' || key === 'className') {
      yield ` class="`;
      yield* iterate_class_names(value as ClassName);
      yield '"';
    } else {
      const delim = typeof val === 'string' && val.includes('"') ? "'" : '"';
      yield ` ${key}=${delim}${val}${delim}`;
    }
  }
}

function* handle_actions(
  type: string,
  config: Props,
): Iterable<null> {
  for (const method of methods) {
    const hx = `hx-${method}`;
    if (
      typeof config[hx] === 'function'
      || config[hx] instanceof Ref
    ) {
      const { id, vals } = Router
        .get_instance()
        .handle_action_render(config[hx] as Handler | Ref);

      config[hx] = '/' + id;
      if (vals != null) {
        let res = vals;
        if (config['hx-vals'] != null) {
          res = (config['hx-vals'] as string).replace(/,?\}$/, `,${vals.slice(1, -1)}}`);
        }
        config['hx-vals'] = res;
      }
    }
  }

  if (
    type === 'form'
    && typeof config['action'] === 'function'
    && config['method'] !== 'dialog'
  ) {
    const { id, vals } = Router
      .get_instance()
      .handle_action_render(config['action'] as Handler | Ref);

    config['action'] = '/' + id;

    if (vals != null) {
      let res = vals;
      if (config['hx-vals'] != null) {
        res = (config['hx-vals'] as string).replace(/,?\}$/, `,${vals.slice(1, -1)}}`);
      }
      config['hx-vals'] = res;
    }
  }

  if (
    (
      type === 'button'
      || (
        type === 'input'
        && (config['type'] === 'submit' || config['type'] === 'image')
      )
    )
    && typeof config['formaction'] === 'function'
  ) {
    const { id, vals } = Router
      .get_instance()
      .handle_action_render(config['formaction'] as Handler | Ref);

    config['formaction'] = '/' + id;
    if (vals != null) {
      let res = vals;
      if (config['hx-vals'] != null) {
        res = (config['hx-vals'] as string).replace(/,?\}$/, `,${vals.slice(1, -1)}}`);
      }
      config['hx-vals'] = res;
    }
  }
}

const methods = ['get', 'post', 'patch', 'put', 'delete'] as const;

export function jsx(
  type: string | Function,
  config: Props,
): JSX.Node {
  return async function*() {
    if (typeof type === 'function') {
      return yield* await type(config);
    }

    yield* handle_actions(type, config);

    const { children = [], ...props } = config;
    const child_props = Array().concat(children);

    if (type === jsxFragment) {
      yield* iterate_children(child_props);
    } else {
      yield `<${type}`;
      yield* iterate_props(props);
      if (self_closing_tags.includes(type)) {
        yield '/>';
      } else {
        yield '>';
        yield* iterate_children(child_props);
        yield `</${type}>`;
      }
    }
  }();
}

jsx.Fragment = jsxFragment
jsx.customAttributes = ['children', 'props']

export { jsx as jsxs, jsxFragment as Fragment, Props };
