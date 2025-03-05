// main.ts
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createFisheyeGeometry } from "./geometry";

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, // 視野角
  window.innerWidth / window.innerHeight, // アスペクト比
  0.1, // 近クリップ面
  1000, // 遠クリップ面
);
// カメラは球の内側に配置するため、中心に極端に近い位置に設定（中身が見えるようにするため）
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls のセットアップ
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // 必要に応じてズーム操作を無効化

// --- パラメータ設定 ---
// 球体のパラメータ
const radius: number = 5; // 球の半径
const widthSegments: number = 64; // 横方向分割数
const heightSegments: number = 32; // 縦方向分割数
const fishEyeFOV: number = 250; // 魚眼カメラの視野角（例：200°）

// --- 球体（または切断球）の生成 ---
// SphereGeometry(半径, 横分割, 縦分割, φ開始, φ範囲, θ開始, θ範囲)
const geometry = createFisheyeGeometry(
  fishEyeFOV,
  widthSegments,
  heightSegments,
  radius,
);
// 内側からテクスチャを見るためにジオメトリを反転
geometry.scale(-1, 1, 1);

// --- テクスチャ読み込みとメッシュ生成 ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load("fisheye.jpg", (texture) => {
  // MeshBasicMaterial はライティング不要のシンプルなマテリアル
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphereMesh = new THREE.Mesh(geometry, material);
  scene.add(sphereMesh);

  // テクスチャ読み込み完了後にレンダリング開始
  animate();
});

// --- アニメーションループ ---
function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// --- ウィンドウリサイズ対応 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
