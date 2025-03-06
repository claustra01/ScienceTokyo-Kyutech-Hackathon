import { camera } from "./camera";
import { DeviceOrientationControls } from "./DeviceOrientationControls";

declare global {
  interface Window {
    DeviceOrientationEvent: {
      requestPermission?: () => Promise<string>;
    };
  }
}
export let deviceOrientationControls: DeviceOrientationControls | null = null;

window.addEventListener("DOMContentLoaded", async () => {
  if (window.DeviceOrientationEvent === undefined) {
    console.log("このデバイスはジャイロセンサーに対応していません");
    return;
  }

  // 現在のデバイスがモバイルデバイス（Android/iOS）かを判定
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    console.log("このデバイスはモバイルデバイスではありません");
    return;
  }
  if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
    const state = await window.DeviceOrientationEvent.requestPermission();
    if (state === "granted") {
      enableDeviceOrientation();
    }
  } else {
    // Android など他のデバイスでは直接有効化
    enableDeviceOrientation();
  }
});

function enableDeviceOrientation() {
  deviceOrientationControls = new DeviceOrientationControls(camera);
}

/**
 * スクリーンが垂直になるようにスマホを持っているときの、スクリーン裏面が向いている方角 (-180 〜 180) を計算する
 */
function calcDeviceDirection(e: DeviceOrientationEvent): number {
  const ry = ((e.gamma || 0) * Math.PI) / 180;
  const rx = ((e.beta || 0) * Math.PI) / 180;
  const rz = ((e.alpha || 0) * Math.PI) / 180;
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);
  const x = -(sy * cz + cy * sx * sz);
  const y = -(sy * sz - cy * sx * cz);
  const z = -(cy * cx);

  const angle = Math.atan2(-x, y) * (180.0 / Math.PI);
  return angle;
}

window.addEventListener(
  "deviceorientation",
  (event: DeviceOrientationEvent) => {
    const deg = calcDeviceDirection(event);
    const rad = deg * (Math.PI / 180); // deg2rad (-π 〜 π)
    if (deviceOrientationControls) deviceOrientationControls.alphaOffset -= rad;
  },
  { once: true },
);
