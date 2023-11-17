import { jsx, jsxs } from "kukri/jsx-runtime";
import {
  $$act_3a55l8dco1s2m,
  $$act_1fga8b1imntm2,
  $$act_1wkbk604romw2,
  $$act_pf5iwqs9rvif,
  $$act_w04dn0z5bajk,
  $$act_2rbnni4zufs6x,
  $$act_341g6e3ntsmzv,
  $$act_3g59rucpjpt0x,
  $$act_2kvomphevb07g,
  $$act_1h8096fwwd1f9,
  $$act_20e2bu5iyia1t,
  $$act_y5t6i6crl8bd,
  $$act_2asmfurgbnyr5,
  $$act_xek81f00i015,
  $$act_30knwqba81pb6,
  $$act_2o6ck848zvswh,
  $$act_1gpy3bs51x5o5
} from "../__$runtime.js";
import { Head } from "kukri/head";
const foo = "bar";
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
function Child({
  slug,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        "hx-get": $$act_3a55l8dco1s2m.bind_locals({
          slug
        }),
        children
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        "hx-get": $$act_1fga8b1imntm2.bind_locals({
          slug
        }),
        children: "Click me (Example 1 diff scope)"
      }
    )
  ] });
}
function Page() {
  const variable = "foo bar baz";
  const test_2 = "/a/b/c";
  const example_5 = $$act_341g6e3ntsmzv;
  const example_6 = $$act_3g59rucpjpt0x.bind_locals({
    test_2
  });
  const ex_7 = $$act_2kvomphevb07g.bind(null, "eek");
  const {
    example_8,
    example_9: rebound_9,
    example_10
  } = {
    example_8: $$act_1h8096fwwd1f9,
    example_9: $$act_2kvomphevb07g.bind(null, "foo"),
    example_10: $$act_20e2bu5iyia1t.bind_locals({
      test_2
    })
  };
  const example_11 = $$act_y5t6i6crl8bd;
  const example_12 = $$act_2asmfurgbnyr5;
  const example_13 = $$act_xek81f00i015;
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsx(Head, {}),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_1wkbk604romw2.bind_locals({
            variable
          }),
          children: "Click me (Example 1)!"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_1wkbk604romw2.bind_locals({
            variable
          }),
          children: "Click me (Example 1 again)!"
        }
      ),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_pf5iwqs9rvif, children: "Click me (Example 2)!" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-vals": `{"a":1,"b":"two"}`,
          "hx-get": $$act_w04dn0z5bajk.bind(null, "beam"),
          children: "Click me (Example 3)"
        }
      ),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_w04dn0z5bajk.bind(null, "boom"), children: "Click me (Example 3 with a different bind)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_2rbnni4zufs6x, children: "Click me (Example 4)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_5, children: "Click me (Example 5)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_6, children: "Click me (Example 6)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_6, children: "Click me (Example 6 again)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": ex_7, children: "Click me (Example 7)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_8, children: "Click me (Example 8)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": rebound_9, children: "Click me (Example 9)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_10, children: "Click me (Example 10)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_11, children: "Click me (Example 11)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_11, children: "Click me (Example 11 again)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_12, children: "Click me (Example 12)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": example_13, children: "Click me (Example 13)" }),
      /* @__PURE__ */ jsx("button", { "hx-get": $$act_30knwqba81pb6, children: "Click me (Arrow Example)" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_2o6ck848zvswh.bind_locals({
            variable
          }),
          children: "Click me (Arrow Example with closure)"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          "hx-get": $$act_1gpy3bs51x5o5.bind_locals({
            variable
          }),
          children: "Click me (Function Example with closure)"
        }
      ),
      /* @__PURE__ */ jsx("button", { "hx-get": test_2, children: "This one is just a string" }),
      /* @__PURE__ */ jsx(Child, { slug: "foo", children: "Click me for a slug example of foo" }),
      /* @__PURE__ */ jsx(Child, { slug: "bar", children: "Click me for a slug example of bar" })
    ] }) })
  ] });
}
export {
  Page as default
};
