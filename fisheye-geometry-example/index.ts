import app from "./index.html";

Bun.serve({
  routes: {
    "/": app,
    "/fisheye.jpg": new Response(await Bun.file("./fisheye.jpg").bytes()),
  },
  port: Number(process.env.POR) || 9999,
  hostname: "0.0.0.0",
});
