import { jsx, jsxs } from "kukri/jsx-runtime";
import { $$act_2rbnni4zufs6x } from "../../__$runtime.js";
import { Head } from "kukri/head";
function Page() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsx(Head, {}),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Page 2" }),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_2rbnni4zufs6x, children: "Another hoisted example" })
    ] }) })
  ] });
}
export {
  Page as default
};
