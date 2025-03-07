import { Participant, Track } from "livekit-client";
import { connectToRoom, PUBLISHER_NAME } from "./livekit-common";

const url = new URL(window.location.href);
const roomName = url.searchParams.get("room");
if (roomName === null) {
  alert("room query parameter is required");
  throw new Error("room query parameter is required");
}
const userName = PUBLISHER_NAME;

const localVideoElement = document.createElement("video");
localVideoElement.autoplay = true;
localVideoElement.id = "video";
localVideoElement.style.position = "fixed";
localVideoElement.style.width = "100vw";
localVideoElement.style.height = "100vh";

const voiceIndicator = document.getElementById(
  "voice-indicator",
) as HTMLDivElement;
if (!voiceIndicator) throw new Error("voice-indicator element not found");

const room = await connectToRoom(roomName, userName);

const handleParticipantConnected = (participant: Participant) => {
  const publication = participant.getTrackPublication(Track.Source.Microphone);
  if (!publication) return;
  if (!publication.track) return;

  if (publication.track.attachedElements.length > 0) return;

  const existing = document.getElementById(`audio-${publication.track?.sid}`);
  if (existing) return;

  const audioElement = document.createElement("audio");
  audioElement.autoplay = true;
  audioElement.id = `audio-${publication.track?.sid}`;
  document.body.appendChild(audioElement);
  publication.track?.attach(audioElement);

  // Audio visualization using AudioContext
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(
    publication.track?.mediaStream as MediaStream,
  );
  source.connect(analyser);
  analyser.fftSize = 256;

  const updateIndicator = () => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((acc, val) => acc + val, 0) /
      dataArray.length;

    // Show/hide indicator based on volume threshold
    if (average > 10) {
      voiceIndicator.classList.add("active");
    } else {
      voiceIndicator.classList.remove("active");
    }

    requestAnimationFrame(updateIndicator);
  };

  updateIndicator();
};

room.on("participantConnected", handleParticipantConnected);

room.on("trackPublished", (_, participant) => {
  handleParticipantConnected(participant);
});

room.on("participantDisconnected", (participant) => {
  const publication = participant.getTrackPublication(Track.Source.Microphone);
  if (!publication) return;
  if (!publication.track) return;
  publication.track.attachedElements.forEach((element) => {
    element.remove();
    publication.track?.detach(element);
  });
});

room.remoteParticipants.forEach(handleParticipantConnected);

setInterval(() => {
  room.remoteParticipants.forEach(handleParticipantConnected);
}, 1000);

const localParticipant = room.localParticipant;

const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter((device) => device.kind === "videoinput");
const deviceId = videoDevices[0].deviceId;
try {
  await localParticipant.setCameraEnabled(true, {
    deviceId,
    resolution: { frameRate: 60, width: 1920, height: 1080 },
  });
} catch (e) {
  console.error(e);
}

localVideoElement.muted = true; // 自分の映像はミュートしておく
document.body.appendChild(localVideoElement);

// ローカル映像を表示
const videoPubTrack = localParticipant.getTrackPublication(Track.Source.Camera)
  ?.track;
videoPubTrack?.attach(localVideoElement);

const cameraDeviceSelect = document.getElementById(
  "camera-device-select",
) as HTMLSelectElement;
if (!cameraDeviceSelect) {
  throw new Error("camera-device-select element not found");
}

cameraDeviceSelect.addEventListener("change", async () => {
  const selectedDeviceId = cameraDeviceSelect.value;
  await videoPubTrack?.setDeviceId(selectedDeviceId);
});

setTimeout(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  cameraDeviceSelect.innerHTML = videoDevices.map((device) =>
    `<option value="${device.deviceId}">${device.label}</option>`
  ).join("\n");
  if (cameraDeviceSelect.value === "") {
    cameraDeviceSelect.value = videoDevices[0].deviceId;
  }
}, 1000);
