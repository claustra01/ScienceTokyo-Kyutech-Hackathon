import { Track } from "livekit-client";
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
localVideoElement.style.inset = "0";

const room = await connectToRoom(roomName, userName);
const localParticipant = room.localParticipant;

// カメラとマイクを有効化
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter((device) => device.kind === "videoinput");
const deviceId = videoDevices[0].deviceId;
await localParticipant.setCameraEnabled(true, { deviceId });
await localParticipant.setMicrophoneEnabled(true);

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
