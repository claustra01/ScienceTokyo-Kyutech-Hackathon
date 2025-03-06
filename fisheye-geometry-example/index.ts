import app from "./index.html";
import publisherApp from "./publisher.html";

Bun.serve({
  routes: {
    "/manifest.json": new Response(await Bun.file("./manifest.json").text()),
    "/": app,
    "/publisher": publisherApp,
    "/public/*": async (c) => {
      const url = new URL(c.url);
      const filePath = url.pathname.replace(/^\/public/, "./public");
      return new Response(await Bun.file(filePath).bytes());
    },
    "/node_modules/*": async (c) => {
      const url = new URL(c.url);
      const modulePath = url.pathname.replace(
        /^\/node_modules/,
        "./node_modules",
      );
      return new Response(await Bun.file(modulePath).bytes(), {
        headers: { "Content-Type": "application/javascript" },
      });
    },
  },
  port: Number(process.env.POR) || 9999,
  hostname: "0.0.0.0",
});
