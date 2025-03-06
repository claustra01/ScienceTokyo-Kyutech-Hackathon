import { Participant, Track } from "livekit-client";
import { connectToRoom, isPublisher } from "./livekit-common";

export const videoElement = document.createElement("video");
videoElement.autoplay = true;
videoElement.width = 1080;
videoElement.height = 1920;

const noAttachedPublisher = document.getElementById("no-attached-publisher");
if (!noAttachedPublisher) {
  throw new Error("no-attached-publisher element not found");
}
const attach = () => {
  noAttachedPublisher.style.display = "none";
};
const detach = () => {
  noAttachedPublisher.style.display = "block";
};

const voiceIndicator = document.getElementById("voice-indicator");
if (!voiceIndicator) throw new Error("voice-indicator element not found");

export const connectToLivekitSource = async (
  roomName: string,
  userName: string,
) => {
  const room = await connectToRoom(roomName, userName);

  room.on("participantConnected", handleParticipantConnected);

  room.on("trackPublished", (_, participant) => {
    handleParticipantConnected(participant);
  });

  room.on("participantDisconnected", (participant) => {
    if (!isPublisher(participant)) return;
    const publication = [...participant.trackPublications]
      .find(([_, p]) => p.track && p.source === Track.Source.Camera);
    if (!publication) return;
    const [_, pub] = publication;
    pub.track?.detach(videoElement);
    detach();
  });

  room.remoteParticipants.forEach(handleParticipantConnected);

  // ローカル映像を表示
  const localParticipant = room.localParticipant;
  await localParticipant.setMicrophoneEnabled(true);

  setInterval(() => {
    if (localParticipant.audioLevel > 0.01) {
      voiceIndicator.classList.add("active");
    } else {
      voiceIndicator.classList.remove("active");
    }
  }, 100);
};

const handleParticipantConnected = (participant: Participant) => {
  console.log("participant connected:", participant.identity);
  if (!isPublisher(participant)) return;
  console.log("participant is a publisher");

  const publication = [...participant.trackPublications]
    .find(([_, p]) => p.track && p.source === Track.Source.Camera);
  if (publication === undefined) return;

  const [_, pub] = publication;
  console.log(pub.track);

  pub.track?.attach(videoElement);
  attach();
};
