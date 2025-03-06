import { type Participant, Room } from "livekit-client";
import { getToken } from "./livekit";

export const livekitWsUrl =
  "wss://sciencetokyo-kyutech-hackathon-bod15vue.livekit.cloud";

export const PUBLISHER_NAME = "publisher";
export const isPublisher = (p: Participant) => p.identity === PUBLISHER_NAME;

export const connectToRoom = async (roomName: string, userName: string) => {
  const room = new Room();
  const token = await getToken(roomName, userName);
  await room.connect(livekitWsUrl, token);
  return room;
};
