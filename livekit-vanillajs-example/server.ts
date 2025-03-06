import { serve } from "bun";

const port = 3000;

serve({
  port,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response(Bun.file("index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    } else if (url.pathname.endsWith(".js")) {
      return new Response(Bun.file("." + url.pathname), {
        headers: { "Content-Type": "application/javascript" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});
