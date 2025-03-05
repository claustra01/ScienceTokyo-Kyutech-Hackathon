import app from "./index.html";

Bun.serve({
  routes: {
    "/": app,
    "/fisheye.jpg": new Response(await Bun.file("./fisheye.jpg").bytes()),
  },
});
