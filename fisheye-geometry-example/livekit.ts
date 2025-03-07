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
    const publication = participant.getTrackPublication(Track.Source.Camera);
    if (!publication) return;
    if (!publication.track) return;
    publication.track.detach(videoElement);
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

  setInterval(() => {
    room.remoteParticipants.forEach(handleParticipantConnected);
  }, 1000);
};

let lastAttachedTrack: Track | null = null;

const handleParticipantConnected = (participant: Participant) => {
  console.log("participant connected:", participant.identity);
  if (!isPublisher(participant)) return;

  const publication = participant.getTrackPublication(Track.Source.Camera);
  if (publication === undefined) return;
  if (publication.track === undefined) return;

  console.log(publication.track);

  if (publication.trackSid === lastAttachedTrack?.sid) return;
  if (lastAttachedTrack) {
    lastAttachedTrack.detach(videoElement);
  }
  publication.track.attach(videoElement);
  lastAttachedTrack = publication.track;
  attach();
};
