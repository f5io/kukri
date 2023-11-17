import { jsx, jsxs } from "kukri/jsx-runtime";
import { $$act_2rbnni4zufs6x, $$act_1mnyc4lfnjjcp, $$act_3t8f7191a4350 } from "../../__$runtime.js";
import { Head } from "kukri/head";
function test() {
  return "foo";
}
function Foo() {
  return /* @__PURE__ */ jsx("h1", { children: "Foo" });
}
const foo = "bar/baz";
function Page() {
  const inner_val = "bar";
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsx(Head, {}),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Page Example 2" }),
      /* @__PURE__ */ jsx("p", { children: "I like it you see" }),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_2rbnni4zufs6x, children: "Another hoisted example" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_1mnyc4lfnjjcp.bind_globals({
            test,
            foo,
            Foo
          }),
          children: "A different one"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_3t8f7191a4350.bind_globals({
            foo
          }).bind_locals({
            inner_val
          }),
          children: "Another different one"
        }
      )
    ] }) })
  ] });
}
export {
  Page as default
};
