import {
  visit,
  namedTypes as n,
  builders as b,
} from 'ast-types';
import dedent from 'dedent';
import type { Context } from 'ast-types/lib/path-visitor';
import type { NodePath } from 'ast-types/lib/node-path';
import type { Scope } from 'ast-types/lib/scope';

import { join } from 'node:path';
import { resolve } from 'import-meta-resolve';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { xxh64 } from '@node-rs/xxhash';

const ROUTER_EXPR = b.memberExpression(
  b.identifier('$instance'),
  b.identifier('register_action'),
);

const identifiers = [
  'hx-get', 'hx-post', 'hx-put', 'hx-patch', 'hx-delete',
  'action', 'formaction',
];

export class CompilationError {
  constructor(
    public message: string,
    public start: { line: number; column: number; },
    public end: { line: number, column: number; },
  ) {
  }
}

export function transform(
  ast: n.Program,
  actions: n.ExportNamedDeclaration[],
  dependencies: Map<string, n.ImportDeclaration>,
  file_path: string,
  import_path: string,
  next_id: (prefix: string, hash?:string) => n.Identifier,
): {
  ast: n.Program;
  warnings: CompilationError[]
} {
  const action_ids: n.Identifier[] = [];
  const hoisted_for_scope = new Map<Scope, Map<string, any>>();
  const warnings: CompilationError[] = [];

  visit(ast, {
    visitJSXIdentifier(path) {
      if (
        identifiers.includes(path.node.name.toLowerCase())
        && n.JSXExpressionContainer.check(path.parent.value.value)
      ) {
        this.traverse(path.parent.get('value'), {
          // inline functions
          visitFunctionExpression(this: Context, path: NodePath<n.FunctionExpression>) {
            const { id, action } = hoist_function_expression.call(this, path, next_id, file_path, warnings);
            action_ids.push(id);
            actions.push(action);
          },
          visitArrowFunctionExpression(this: Context, path: NodePath<n.ArrowFunctionExpression>) {
            const { id, action } = hoist_function_expression.call(this, path, next_id, file_path, warnings);
            action_ids.push(id);
            actions.push(action);
          },
          // identifiers
          visitIdentifier(this: Context, path: NodePath<n.Identifier>) {
            const found = resolve_identifier.call(this, path, hoisted_for_scope, next_id, file_path, warnings); 
            if (found != null) {
              action_ids.push(found.id);
              if (!dependencies.has(found.id.name)) {
                actions.push(found.action);
                if (found.import != null) {
                  dependencies.set(found.id.name, found.import);
                }
              }
            }
            return false;
          }
        });
      }
      return false;
    }
  });

  if (action_ids.length > 0) {
    ast.body.unshift(
      b.importDeclaration(
        action_ids.map(id =>
          b.importSpecifier(id)
        ),
        b.literal(join(import_path, '__$runtime.js'))
      )
    );
  }

  return {
    ast,
    warnings,
  };
}

function resolve_identifier(
  this: Context,
  path: NodePath<n.Identifier>,
  hoisted_for_scope: Map<Scope, Map<string, n.Identifier>>,
  next_id: (prefix: string, hash?: string) => n.Identifier,
  file_path: string,
  warnings: CompilationError[],
): {
  id: n.Identifier;
  action: n.ExportNamedDeclaration;
  import?: n.ImportDeclaration;
} | null {
  const root_id = path;
  const name = path.value.name;

  const scope = path.scope.lookup(name);
  if (scope == null) return null;

  let hoisted: Map<string, n.Identifier>;
  if (hoisted_for_scope.has(scope)) {
    hoisted = hoisted_for_scope.get(scope)!;
    if (hoisted.has(name)) {
      path.replace(hoisted.get(name));
      return null;
    }
  } else {
    hoisted = new Map();
    hoisted_for_scope.set(scope, hoisted);
  }

  let found = null;
  this.traverse(scope.path, {
    visitImportSpecifier(this: Context, path: NodePath<n.ImportSpecifier>) {
      const lookup = wrap_import_specifier(path, name, hoisted, root_id, next_id, file_path, warnings);
      if (lookup != null) {
        found = lookup;
      }
      return false;
    },
    visitFunctionDeclaration(this: Context, path: NodePath<n.FunctionDeclaration>) {
      const lookup = hoist_function_declaration.call(this, path, name, hoisted, root_id, next_id, file_path, warnings);
      if (lookup != null) {
        found = lookup;
      }
      return false;
    },
    visitVariableDeclarator(this: Context, path: NodePath<n.VariableDeclarator>) {
      let is_match = false;
      let prop_lookup: string;

      if (!n.Identifier.check(path.node.id)) {
        visit(path.get('id'), {
          visitIdentifier(this: Context, path: NodePath<n.Identifier>) {
            if (path.node.name === name) {
              is_match = true; 
              if (n.Property.check(path.parent.node)) {
                prop_lookup = path.parent.node.key.name;
              }
              this.abort();
            }
            return false;
          }
        });
      } else if (path.node.id.name === name) { 
        is_match = true; 
      }

      if (is_match) {
        visit(path.get('init'), {
          visitFunctionExpression(this: Context, path: NodePath<n.FunctionExpression>) {
            let lookup;
            if (
              prop_lookup != null
              && n.Property.check(path.parent.node)
              && path.parent.node.key.name === prop_lookup
            ) {
              lookup = hoist_function_expression.call(this, path, next_id, file_path, warnings, name);
            } else if (
              prop_lookup == null 
            ) {
              lookup = hoist_function_expression.call(this, path, next_id, file_path, warnings, name);
            }
            if (lookup != null) {
              found = lookup;
              this.abort();
            }
            return false;
          },
          visitArrowFunctionExpression(this: Context, path: NodePath<n.ArrowFunctionExpression>) {
            let lookup;
            if (
              prop_lookup != null
              && n.Property.check(path.parent.node)
              && path.parent.node.key.name === prop_lookup
            ) {
              lookup = hoist_function_expression.call(this, path, next_id, file_path, warnings, name);
            } else if (
              prop_lookup == null 
            ) {
              lookup = hoist_function_expression.call(this, path, next_id, file_path, warnings, name);
            }
            if (lookup != null) {
              found = lookup;
              this.abort();
            }
            return false;
          },
          visitProperty(this: Context, path: NodePath<n.Property>) {
            if (
              n.Identifier.check(path.node.key)
              && path.node.key.name === prop_lookup
            ) {
              this.visit(path.get('value'));
            }
            return false;
          },
          visitIdentifier(this: Context, path: NodePath<n.Identifier>) {
            const lookup = resolve_identifier.call(this, path, hoisted_for_scope, next_id, file_path, warnings) 
            if (lookup != null) {
              found = lookup;
              this.abort();
            }
            return false;
          }
        });
      }
      return false;
    },
  });
  return found;
}

function wrap_import_specifier(
  path: NodePath<n.ImportSpecifier>,
  name: string,
  hoisted: Map<string, n.Identifier>,
  root_id: NodePath<n.Identifier>,
  next_id: (prefix: string, hash?:string) => n.Identifier,
  file_path: string,
  warnings: CompilationError[],
): {
  id: n.Identifier;
  action: n.ExportNamedDeclaration;
  import: n.ImportDeclaration;
} | null {
  const node = path.node;
  if (node.local?.name === name) {
    let clean = path.parent.node.source.value;
    
    try {
      const url = resolve(
        path.parent.node.source.value,
        pathToFileURL(file_path).href
      );

      const [, p] = fileURLToPath(url).split('/src');
      clean = '.' + p.replace(/\.[jt]sx?$/, '') + '.js';
    } catch {
      // being unable to resolve this path is likely
      // due to it using a typescript path alias...
    }

    const key = 'is+' + clean + '+' + node.imported.name;
    const hash = xxh64(key).toString(36);
    //console.log('is > key.>>', key);
    //console.log('is > hash.>>', hash);
    const id = next_id('$$act', hash);
    const dependency_id = next_id('$$dep', hash);

    const action = b.exportNamedDeclaration(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          id,
          b.callExpression(
            ROUTER_EXPR,
            [
              dependency_id,
              b.literal(false),
              b.literal(false),
              b.literal(hash),
            ]
          )
        )
      ])
    );
    root_id.replace(id);
    path.get('local').replace(dependency_id);

    const declaration = b.importDeclaration(
      [ path.node ],
      b.literal(clean),
    );

    if (path.parent.node.specifiers.length > 1) {
      path.replace();
    } else {
      path.parent.replace();
    }
    hoisted.set(name, root_id.node);
    return { id, action, import: declaration };
  }
  return null;
}

function collect_bindings(
  this: Context,
  path: NodePath<n.FunctionExpression | n.ArrowFunctionExpression | n.FunctionDeclaration>,
  warnings: CompilationError[],
): {
  locals: Set<string>;
  globals: Set<string>;
} {
  const locals = new Set<string>();
  const globals = new Set<string>();

  this.traverse(path.get('body'), {
    visitIdentifier(path: NodePath<n.Identifier>) {
      const node = path.node;
      if (locals.has(node.name) || globals.has(node.name)) return false;
      const scope = path.scope.lookup(node.name);
      if (scope != null && scope !== path.scope) {
        if (scope.isGlobal) {
          globals.add(node.name);
        } else {
          const loc = path.node.loc!;
          warnings.push(new CompilationError(
            dedent`
              Due to not being available on the global scope, the following closured
              binding is assumed to be request-specific and will be serialised over the wire
              and embedded into the client.

              Please see https://github.com/Rich-Harris/devalue for values that can
              be serialied. Any other types will cause an error.
            `,
            loc.start,
            loc.end,
          ));
          locals.add(node.name);
        }
      }
      return false;
    }
  });
  return {
    locals,
    globals,
  };
}

function get_location_area(path: NodePath): string {
  const { start, end } = path.node.loc!;
  return JSON.stringify({ start, end })
}

function hoist_function_expression(
  this: Context,
  path: NodePath<n.FunctionExpression | n.ArrowFunctionExpression>,
  next_id: (prefix: string, hash?: string) => n.Identifier,
  file_path: string,
  warnings: CompilationError[],
  name?: string,
): {
  id: n.Identifier;
  action: n.ExportNamedDeclaration;
} {
  const { locals, globals } = collect_bindings.call(this, path, warnings);
  if (name == null) {
    name = get_location_area(path);
  }
  const key = 'fe+' + file_path + '+' + name;
  const hash = xxh64(key).toString(36);
  //console.log('fe > key.>>', key);
  //console.log('fe > hash.>>', hash);

  const id: n.Identifier = next_id('$$act', hash);

  const local_props = keys_to_props(locals);
  const global_props = keys_to_props(globals);

  let has_globals = false;
  let has_locals = false;

  let fn: n.FunctionExpression | n.ArrowFunctionExpression = path.node;

  let replacement: n.Identifier | n.CallExpression = id;

  if (globals.size > 0) {
    has_globals = true;
    replacement = b.callExpression(
      b.memberExpression(replacement, b.identifier('bind_globals')),
      [ b.objectExpression(global_props) ],
    );
  }

  if (locals.size > 0) {
    has_locals = true;
    fn = b.arrowFunctionExpression(
      [ b.objectPattern(local_props) ],
      fn,
    );
    replacement = b.callExpression(
      b.memberExpression(replacement, b.identifier('bind_locals')),
      [ b.objectExpression(local_props) ],
    );
  }

  if (has_globals) {
    fn = b.arrowFunctionExpression(
      [ b.objectPattern(global_props) ],
      fn,
    );
  }
  
  path.replace(replacement);

  const action = b.exportNamedDeclaration(
    b.variableDeclaration('const', [
      b.variableDeclarator(
        id,
        b.callExpression(ROUTER_EXPR, [
          fn,
          b.literal(has_globals),
          b.literal(has_locals),
          b.literal(hash),
        ])
      )
    ])
  );
  
  return { id, action };
}

function keys_to_props(set: Set<string>): n.Property[] {
  return [ ...set ].map(x =>
    b.property.from({
      kind: 'init',
      key: b.identifier(x),
      value: b.identifier(x),
      shorthand: true
    })
  );
}

function hoist_function_declaration(
  this: Context,
  path: NodePath<n.FunctionDeclaration>,
  name: string,
  hoisted: Map<string, n.Identifier>,
  root_id: NodePath<n.Identifier>,
  next_id: (prefix: string, hash?:string) => n.Identifier,
  file_path: string,
  warnings: CompilationError[],
): {
  id: n.Identifier;
  action: n.ExportNamedDeclaration;
} | null {
  if (path.node.id!.name === name) {
     
    const { locals, globals } = collect_bindings.call(this, path, warnings);
    const area = get_location_area(path);
    const key = 'fd+' + file_path + '+' + name + '+' + area;
    const hash = xxh64(key).toString(36);
    //console.log('fd > key.>>', key);
    //console.log('fd > hash.>>', hash);

    const id: n.Identifier = next_id('$$act', hash);

    const local_props = keys_to_props(locals);
    const global_props = keys_to_props(globals);

    let has_globals = false;
    let has_locals = false;

    let fn: n.FunctionExpression | n.ArrowFunctionExpression = {
      ...path.node,
      type: 'FunctionExpression',
    };

    let replacement: n.Identifier | n.CallExpression = id;

    if (globals.size > 0) {
      has_globals = true;
      replacement = b.callExpression(
        b.memberExpression(replacement, b.identifier('bind_globals')),
        [ b.objectExpression(global_props) ],
      );
    }

    if (locals.size > 0) {
      has_locals = true;
      fn = b.arrowFunctionExpression(
        [ b.objectPattern(local_props) ],
        fn,
      );
      replacement = b.callExpression(
        b.memberExpression(replacement, b.identifier('bind_locals')),
        [ b.objectExpression(local_props) ],
      );
    }

    if (has_globals) {
      fn = b.arrowFunctionExpression(
        [ b.objectPattern(global_props) ],
        fn,
      );
    }

    root_id.replace(replacement);

    const action = b.exportNamedDeclaration(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          id,
          b.callExpression(ROUTER_EXPR, [
            fn,
            b.literal(has_globals),
            b.literal(has_locals),
            b.literal(hash),
          ])
        )
      ])
    );

    path.replace();
    hoisted.set(name, root_id.node);
    return { id, action };
  }
  return null;
}
