import {
  Router as IttyRouter,
  type IRequest,
  type Route,
  type RouterType
} from 'itty-router';
import * as devalue from 'devalue';
import dedent from 'dedent';
import { jsx } from './jsx-runtime.js';
import { SUSPENSE_KEY } from './suspense.js';
import { boundary_text } from './head.js';
import type { Context, SuspenseItem, SuspenseItems } from './types';

const ROUTER_KEY = {};

let singleton: any;
export type RouteArgs<Args extends any[] = any[]> = [ IRequest, ...Args ];

type CurriedHandler<Data = any> = (bindings: Data) => (...args: any[]) => Promise<Response | JSX.Node>;
type DoubleCurriedHandler<Globals = any, Data = any> = (globals: Globals) => CurriedHandler;
type RawHandler = (...args: any[]) => Promise<Response | JSX.Node>;
export type Handler<Globals = any, Data = any> =
  | DoubleCurriedHandler<Globals, Data>
  | CurriedHandler<Data>
  | RawHandler;

type RuntimeRef = {
  id: string;
  vals?: string;
};

export class Ref<Args extends any[] = any[]>{
  constructor(
    public $router: Router<Args>,
    public $id: string,
    public $ref: Handler,
    public $args: any[],
    public $globals: Record<string, any> | null,
    public $locals: Record<string, any> | null,
    public $has_globals: boolean,
    public $has_locals: boolean
  ) {}
  bind(_: void, ...args: any[]) {
    return new Ref(
      this.$router,
      this.$id,
      this.$ref,
      this.$args.concat(args),
      this.$globals,
      this.$locals,
      this.$has_globals,
      this.$has_locals,
    );
  }
  bind_globals(globals: any) {
    this.$globals = globals;
    return this;
  }
  bind_locals(locals: Record<string, any>) {
    return new Ref(
      this.$router,
      this.$id,
      this.$ref,
      this.$args,
      this.$globals,
      locals,
      this.$has_globals,
      this.$has_locals,
    );
  }
}

export class Router<Args extends any[] = any[]> {
  #references: WeakMap<Handler, string>;
  #action_refs: Map<string, Ref<Args>>;
  #router: RouterType<Route, Args>;
  #count: number;
  private constructor(key: {}) {
    if (key !== ROUTER_KEY) {
      throw new Error('cannot construct a router, please use Router.get_instance()');
    }
    this.#references = new WeakMap();
    this.#action_refs = new Map();
    this.#count = 0;

    this.#router = this.#instantiate_router(); 
  }
  static get_instance<Args extends any[] = any[]>(): Router<Args> {
    if (singleton == null) {
      singleton = new Router<Args>(ROUTER_KEY);
    }
    return singleton as Router<Args>;
  }
  #instantiate_router(): RouterType<Route, Args> {
    const router =  IttyRouter();
    router.all('*', async (request, ...rest) => {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/$action')) {
        const ref = this.#action_refs.get(url.pathname.slice(1));

        if (ref != null) {
          const method = request.method.toLowerCase();
          let data;
          if (method === 'get') {
            data = url.searchParams;
          } else {
            const cloned = request.clone();
            data = await cloned.formData();
          }

          let fn: Handler = ref.$ref;

          if (ref.$has_globals) {
            fn = fn(ref.$globals) as CurriedHandler | RawHandler;
          }

          if (ref.$has_locals) {
            let bindings = data.get('$action_locals');
            if (bindings != null) {
              bindings = devalue.parse(bindings as string)
            }
            fn = fn(bindings) as RawHandler;
          }

          let args = data.get('$action_args');
          let parsed_args;
          if (args != null) {
            parsed_args = devalue.parse(args as string);
          } else {
            parsed_args = [];
          }

          const response = await (fn as RawHandler)(...parsed_args.concat(request, rest));

          if (
            'next' in response
            && typeof response.next === 'function'
          ) {
            const stream = iterator_to_stream(response, new Map());
            return new Response(stream);
          } else if (response == null) {
            return new Response('internal server error - action did not return response', { status: 500 });
          }
          return response;
        }
      }
    });
    return router;
  }
  flush() {
    this.#router = this.#instantiate_router(); 
  }
  get_router(): RouterType<Route, Args> {
    return this.#router;
  }
  register_action(
    action: any,
    has_globals: boolean,
    has_locals: boolean,
    hash: string = (this.#count++).toString(36).padStart(2, '0')
  ): Ref<Args> | any {
    if (typeof action !== 'function') {
      // if we resolve an action prop to an import specifier, we dont resolve the
      // type, so we check it at runtime and act as identity if its not a function.
      return action;
    }
    let id = this.#references.get(action);


    if (id == null) {
      id = `$action/${hash}`;
      console.log('registering action with id', id);
      this.#references.set(action, id);
      const ref = new Ref<Args>(
        this, id, action,
        [], null, null,
        has_globals, has_locals,
      );
      this.#action_refs.set(id, ref);
      return ref;
    }
    console.log('found existing ref');
    return this.#action_refs.get(id);
  }
  update_action_ref_in_place(id: string, ref: Ref) {
    this.#action_refs.set(id, ref);
  }
  handle_action_render(action: Handler | Ref): RuntimeRef {
    let ref;
    if (action instanceof Ref) {
      ref = action;
    } else {
      console.warn(dedent`
        Warning: An action is being registered at runtime! This is generally the result
        of an unoptimised approach to actions, for example, passing down an action
        handler as a prop to a component.

        You should keep the action handler close to where it's used.
      `);
      ref = this.register_action(action, false, false);
    }

    let vals: Record<string, any> | null = null;
    if (ref.$args.length > 0) {
      vals ??= {};
      vals['$action_args'] = devalue.stringify(ref.$args);
    }

    if (ref.$locals != null) {
      vals ??= {};
      vals['$action_locals'] = devalue.stringify(ref.$locals);
    }

    const output: RuntimeRef = {
      id: ref.$id,
    };

    if (vals != null) {
      output.vals = JSON.stringify(vals);
    }

    return output;
  }
}

export function iterator_to_stream(
  iterator: JSX.Node,
  context: Context,
  prefix?: string
) {
  const encoder = new TextEncoder();
  let started = prefix == null;
  let run_suspense = true;
  let it: JSX.Node | SuspenseItem = iterator;
  return new ReadableStream({
    async pull(controller) {
      if (!started) {
        controller.enqueue(encoder.encode(prefix));
        started = true;
      }

      let done, value;
      // todo: make this better
      try {
        ({ value, done } = await it.next(context));
      } catch(err) {
        run_suspense = false;
        it = jsx('div', {
          'hx-error': true,
          'hx-target': 'body',
          children: 'internal server error',
        });
      }

      if (done) {
        const suspense = context.get(SUSPENSE_KEY) as SuspenseItems;

        if (run_suspense === false || suspense == null || suspense.items.length === 0) {
          controller.close();
        } else {
          // issue a suspense boundary
          controller.enqueue(encoder.encode(`<!--${boundary_text}-->`));

          const [ iterator, index ] = await Promise.race(
            suspense.items.map((item, i) => item.then(it => [it, i] as const)),
          );

          suspense.items.splice(index, 1);

          it = iterator;

          context.set(SUSPENSE_KEY, suspense);
        }
      } else {
        controller.enqueue(encoder.encode(value ?? ''));
      }
    },
  });
}
