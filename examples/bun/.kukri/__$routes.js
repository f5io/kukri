import { iterator_to_stream } from "kukri/router";
import { default as $instance } from "./__$runtime.js";
console.log("adding", "/", "at", "./routes/page.js");
$instance.get_router().all("/", async (...args) => {
  const [request] = args;
  const { default: route, config = {} } = await import("./routes/page.js");
  if (request.method.toLowerCase() === (config.method ?? "get")) {
    const response = await route(...args);
    if ("next" in response && typeof response.next === "function") {
      return new Response(iterator_to_stream(response, /* @__PURE__ */ new Map()));
    } else {
      return response;
    }
  }
});
console.log("adding", "/example", "at", "./routes/example/page.js");
$instance.get_router().all("/example", async (...args) => {
  const [request] = args;
  const { default: route, config = {} } = await import("./routes/example/page.js");
  if (request.method.toLowerCase() === (config.method ?? "get")) {
    const response = await route(...args);
    if ("next" in response && typeof response.next === "function") {
      return new Response(iterator_to_stream(response, /* @__PURE__ */ new Map()));
    } else {
      return response;
    }
  }
});
console.log("adding", "/example2", "at", "./routes/example2/page.js");
$instance.get_router().all("/example2", async (...args) => {
  const [request] = args;
  const { default: route, config = {} } = await import("./routes/example2/page.js");
  if (request.method.toLowerCase() === (config.method ?? "get")) {
    const response = await route(...args);
    if ("next" in response && typeof response.next === "function") {
      return new Response(iterator_to_stream(response, /* @__PURE__ */ new Map()));
    } else {
      return response;
    }
  }
});
var stdin_default = $instance;
export {
  stdin_default as default
};
