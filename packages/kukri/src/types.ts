export type Context = Map<{}, unknown>;
export type SuspenseItem = Generator<string | null, void, Context>;
export type SuspenseItems = { count: number; items: Promise<SuspenseItem>[]; key: string; };

export type UnknownProps = { [key: string]: unknown }
export type MaybeList<T> = T | T[];
export type Child = JSX.Node | string | number | boolean | null | void;
export type Children = MaybeList<Child>;
export type ClassName = MaybeList<string | { [k: string]: boolean } | boolean>;
export type Props<T = UnknownProps> = T & { children?: Children };




