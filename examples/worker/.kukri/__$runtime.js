import { jsxs } from "kukri/jsx-runtime";
import { Router } from "kukri/router";
const $instance = Router.get_instance();
const $$act_3l0zdgagl2gvm = $instance.register_action(({
  bar,
  foo,
  request
}) => () => {
  const b = bar;
  const result = foo();
  console.log(request);
  const eek = "eek";
  return /* @__PURE__ */ jsxs("h1", { children: [
    result,
    "+",
    eek
  ] });
}, false, true, "3l0zdgagl2gvm");
var stdin_default = $instance;
export {
  $$act_3l0zdgagl2gvm,
  stdin_default as default
};
