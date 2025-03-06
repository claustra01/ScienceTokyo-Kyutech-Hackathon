import type { Texture } from "three";

export const canvasElement = document.createElement("canvas");
canvasElement.width = 1080;
canvasElement.height = 1080;

const ctx = canvasElement.getContext("2d");
if (!ctx) throw new Error("Failed to get canvas context");

export const updateTextureFromVideo = (
  videoElement: HTMLVideoElement,
  texture: Texture,
) => {
  if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) return;

  const videoRatio = videoElement.videoWidth / videoElement.videoHeight;

  let sourceX = 0, sourceY = 0;
  let sourceWidth = videoElement.videoWidth;
  let sourceHeight = videoElement.videoHeight;

  if (videoRatio > 1) {
    // Video is wider than canvas
    sourceWidth = videoElement.videoHeight;
    sourceX = (videoElement.videoWidth - sourceWidth) / 2;
  } else {
    // Video is taller than canvas
    sourceHeight = videoElement.videoWidth;
    sourceY = (videoElement.videoHeight - sourceHeight) / 2;
  }

  ctx.drawImage(
    videoElement,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );
  texture.needsUpdate = true;
};
