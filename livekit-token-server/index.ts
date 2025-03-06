import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { AccessToken, Room } from "livekit-server-sdk";
import { z } from "zod";

const createToken = async (room: string, username: string) => {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: username, ttl: "10m" },
  );
  at.addGrant({ roomJoin: true, room });
  return await at.toJwt();
};

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

const getTokenQuerySchema = z.object({
  room: z.string(),
  username: z.string(),
});

app.get("/getToken", zValidator("query", getTokenQuerySchema), async (c) => {
  const { room, username } = c.req.valid("query");
  return c.text(await createToken(room, username));
});

export default {
  fetch: app.fetch,
  port,
};
