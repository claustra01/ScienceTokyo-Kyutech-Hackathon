import { RemoteParticipant, Track } from "livekit-client";
import { connectToRoom, isPublisher } from "./livekit-common";

export const videoElement = document.createElement("video");
videoElement.autoplay = true;

export const connectToLivekitSource = async (
  roomName: string,
  userName: string,
) => {
  const room = await connectToRoom(roomName, userName);

  // イベントリスナーを設定
  room.on("participantConnected", handleParticipantConnected);

  // 参加者が退出したときのクリーンアップ
  room.on("participantDisconnected", (participant) => {
    if (!isPublisher(participant)) return;
    const publication = [...participant.trackPublications]
      .find(([_, p]) => p.track && p.source === Track.Source.Camera);
    if (!publication) return;
    const [_, pub] = publication;
    pub.track?.detach(videoElement);
  });

  room.remoteParticipants.forEach(handleParticipantConnected);
};

export const getToken = async (roomName: string, userName: string) => {
  const res = await fetch(
    `https://livekit-hackathon.cp20.dev/getToken?room=${roomName}&username=${userName}`,
  );
  const token = await res.text();
  return token;
};

const handleParticipantConnected = (participant: RemoteParticipant) => {
  if (!isPublisher(participant)) return;

  const publication = [...participant.trackPublications]
    .find(([_, p]) => p.track && p.source === Track.Source.Camera);
  if (publication === undefined) return;

  const [_, pub] = publication;
  pub.track?.attach(videoElement);
};
