import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createFisheyeGeometry } from "./geometry";
import { deviceOrientationControls } from "./controls";
import { camera } from "./camera";
import { canvasElement, updateTextureFromVideo } from "./video";
import { connectToLivekitSource, videoElement } from "./livekit";

const url = new URL(window.location.href);
const roomName = url.searchParams.get("room");
if (roomName === null) {
  alert("room query parameter is required");
  throw new Error("room query parameter is required");
}
const userName = "viewer-" + Math.random().toString(36).slice(-8);
await connectToLivekitSource(roomName, userName);

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
document.body.appendChild(renderer.domElement);

const orbitControls: OrbitControls = new OrbitControls(
  camera,
  renderer.domElement,
);
orbitControls.enableZoom = false;

// --- パラメータ設定 ---
const radius: number = 5;
const widthSegments: number = 64;
const heightSegments: number = 32;
const fishEyeFOV: number = 180;

// --- 球体の生成 ---
const geometry = createFisheyeGeometry(
  fishEyeFOV,
  widthSegments,
  heightSegments,
  radius,
);
geometry.scale(-1, 1, 1);

const animate = () => {
  requestAnimationFrame(animate);
  if (deviceOrientationControls !== null) {
    deviceOrientationControls.update();
  } else {
    orbitControls.update();
  }
  renderer.render(scene, camera);
  updateTextureFromVideo(videoElement, texture);
};

const texture = new THREE.CanvasTexture(canvasElement);
const material = new THREE.MeshBasicMaterial({ map: texture });
const sphereMesh = new THREE.Mesh(geometry, material);
scene.add(sphereMesh);
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
