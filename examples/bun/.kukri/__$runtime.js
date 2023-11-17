import { Fragment, jsx, jsxs } from "kukri/jsx-runtime";
import { Router } from "kukri/router";
const $instance = Router.get_instance();
import { example_4 as $$dep_2rbnni4zufs6x } from "./lib/actions.js";
const $$act_2rbnni4zufs6x = $instance.register_action($$dep_2rbnni4zufs6x, false, false, "2rbnni4zufs6x");
const $$act_1mnyc4lfnjjcp = $instance.register_action(({
  test,
  foo,
  Foo
}) => function Bar() {
  const result = test();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { children: foo }),
    /* @__PURE__ */ jsx(Foo, {}),
    /* @__PURE__ */ jsx("h1", { children: "Bar" })
  ] });
}, true, false, "1mnyc4lfnjjcp");
const $$act_3t8f7191a4350 = $instance.register_action(({
  foo
}) => ({
  inner_val
}) => function inner_fn() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h1", { children: inner_val }),
    /* @__PURE__ */ jsx("h1", { children: foo })
  ] });
}, true, true, "3t8f7191a4350");
const $$act_3a55l8dco1s2m = $instance.register_action(({
  slug
}) => async function example_slug() {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 1",
    slug
  ] });
}, false, true, "3a55l8dco1s2m");
const $$act_1fga8b1imntm2 = $instance.register_action(({
  slug
}) => async function example_1() {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 1 overwrite in different scope",
    slug
  ] });
}, false, true, "1fga8b1imntm2");
const $$act_1wkbk604romw2 = $instance.register_action(({
  variable
}) => async function example_1() {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 1",
    variable
  ] });
}, false, true, "1wkbk604romw2");
const $$act_pf5iwqs9rvif = $instance.register_action(function example_2() {
  return /* @__PURE__ */ jsx("h1", { children: "Example 2" });
}, false, false, "pf5iwqs9rvif");
const $$act_w04dn0z5bajk = $instance.register_action(function example_3(eek) {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 3",
    eek
  ] });
}, false, false, "w04dn0z5bajk");
const $$act_341g6e3ntsmzv = $instance.register_action(() => {
  return /* @__PURE__ */ jsx("h1", { children: "Example 5" });
}, false, false, "341g6e3ntsmzv");
const $$act_3g59rucpjpt0x = $instance.register_action(({
  test_2
}) => () => {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 6",
    test_2
  ] });
}, false, true, "3g59rucpjpt0x");
const $$act_2kvomphevb07g = $instance.register_action(function example_7(arg) {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Example 7",
    arg
  ] });
}, false, false, "2kvomphevb07g");
const $$act_1h8096fwwd1f9 = $instance.register_action(() => /* @__PURE__ */ jsx("h1", { children: "Example 8" }), false, false, "1h8096fwwd1f9");
const $$act_20e2bu5iyia1t = $instance.register_action(({
  test_2
}) => () => /* @__PURE__ */ jsxs("h1", { children: [
  "Example 10",
  test_2
] }), false, true, "20e2bu5iyia1t");
const $$act_y5t6i6crl8bd = $instance.register_action(() => /* @__PURE__ */ jsx("h1", { children: "Example 11" }), false, false, "y5t6i6crl8bd");
const $$act_2asmfurgbnyr5 = $instance.register_action(() => /* @__PURE__ */ jsx("h1", { children: "Example 12" }), false, false, "2asmfurgbnyr5");
const $$act_xek81f00i015 = $instance.register_action(() => /* @__PURE__ */ jsx("h1", { children: "Example 13" }), false, false, "xek81f00i015");
const $$act_30knwqba81pb6 = $instance.register_action(() => /* @__PURE__ */ jsx("h1", { children: "Arrow Example" }), false, false, "30knwqba81pb6");
const $$act_2o6ck848zvswh = $instance.register_action(({
  variable
}) => () => /* @__PURE__ */ jsxs("h1", { children: [
  "Arrow Example",
  variable
] }), false, true, "2o6ck848zvswh");
const $$act_1gpy3bs51x5o5 = $instance.register_action(({
  variable
}) => function() {
  return /* @__PURE__ */ jsxs("h1", { children: [
    "Function Example",
    variable
  ] });
}, false, true, "1gpy3bs51x5o5");
var stdin_default = $instance;
export {
  $$act_1fga8b1imntm2,
  $$act_1gpy3bs51x5o5,
  $$act_1h8096fwwd1f9,
  $$act_1mnyc4lfnjjcp,
  $$act_1wkbk604romw2,
  $$act_20e2bu5iyia1t,
  $$act_2asmfurgbnyr5,
  $$act_2kvomphevb07g,
  $$act_2o6ck848zvswh,
  $$act_2rbnni4zufs6x,
  $$act_30knwqba81pb6,
  $$act_341g6e3ntsmzv,
  $$act_3a55l8dco1s2m,
  $$act_3g59rucpjpt0x,
  $$act_3t8f7191a4350,
  $$act_pf5iwqs9rvif,
  $$act_w04dn0z5bajk,
  $$act_xek81f00i015,
  $$act_y5t6i6crl8bd,
  stdin_default as default
};
