import { type Participant, Room } from "livekit-client";

export const getToken = async (roomName: string, userName: string) => {
  const res = await fetch(
    `https://livekit-hackathon.cp20.dev/getToken?room=${roomName}&username=${userName}`,
  );
  const token = await res.text();
  return token;
};

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
