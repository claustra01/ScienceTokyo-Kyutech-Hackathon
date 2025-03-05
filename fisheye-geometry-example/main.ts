import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createFisheyeGeometry } from "./geometry";
import { deviceOrientationControls } from "./controls";
import { camera } from "./camera";

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let orbitControls: OrbitControls = new OrbitControls(
  camera,
  renderer.domElement,
);
orbitControls.enableZoom = false;

// --- パラメータ設定 ---
const radius: number = 5;
const widthSegments: number = 64;
const heightSegments: number = 32;
const fishEyeFOV: number = 250;

// --- 球体の生成 ---
const geometry = createFisheyeGeometry(
  fishEyeFOV,
  widthSegments,
  heightSegments,
  radius,
);
geometry.scale(-1, 1, 1);

// --- テクスチャ読み込みとメッシュ生成 ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load("fisheye.jpg", (texture) => {
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphereMesh = new THREE.Mesh(geometry, material);
  scene.add(sphereMesh);
  animate();
});

// --- アニメーションループ ---
function animate(): void {
  requestAnimationFrame(animate);
  if (deviceOrientationControls !== null) {
    deviceOrientationControls.update();
  } else {
    orbitControls.update();
  }
  renderer.render(scene, camera);
}

// --- ウィンドウリサイズ対応 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
