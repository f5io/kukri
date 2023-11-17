import { jsx, jsxs } from "kukri/jsx-runtime";
import { $$act_3l0zdgagl2gvm } from "../__$runtime.js";
async function DelayedChild({
  time,
  children
}) {
  console.log("before time", time, "ms");
  await new Promise((resolve) => setTimeout(resolve, time));
  console.log("after time", time, "ms");
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h1", { children: [
      "I was delayed by",
      time,
      "ms"
    ] }),
    children
  ] });
}
function Page(request) {
  const bar = "bar";
  const foo = () => {
    return bar;
  };
  const action = $$act_3l0zdgagl2gvm.bind_locals({
    bar,
    foo,
    request
  });
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx("button", { "hx-get": action, children: "Test me" }),
    /* @__PURE__ */ jsx(DelayedChild, { time: 3e3 }),
    /* @__PURE__ */ jsx(DelayedChild, { time: 4500 })
  ] });
}
export {
  Page as default
};
