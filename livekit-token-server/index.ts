import { Hono } from "hono";
import { AccessToken } from "livekit-server-sdk";

const createToken = async () => {
  const roomName = "quickstart-room";
  const participantName = "quickstart-username";

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: participantName, ttl: "10m" },
  );
  at.addGrant({ roomJoin: true, room: roomName });
  return await at.toJwt();
};

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

app.get("/getToken", async (c) => c.text(await createToken()));

export default {
  fetch: app.fetch,
  port,
};
