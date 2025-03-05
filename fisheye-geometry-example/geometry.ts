import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @param {number} fovDeg 魚眼の全視野角 (度数)。例:180,200
 * @param {number} segmentsV 垂直方向の分割数(角度αのステップ)
 * @param {number} segmentsH 水平方向の分割数(角度φのステップ)
 * @param {number} sphereRadius 球の半径
 * @returns {THREE.BufferGeometry} 魚眼用UVが割り当てられた部分球のGeometry
 */
export const createFisheyeGeometry = (
  fovDeg: number,
  segmentsV: number,
  segmentsH: number,
  sphereRadius: number,
) => {
  const fovRad = THREE.MathUtils.degToRad(fovDeg);
  const maxAlpha = fovRad * 0.5; // 魚眼の中心→周辺までの最大角度

  const vertexCount = (segmentsV + 1) * (segmentsH + 1);

  // TypedArrayの確保
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  // 三角形インデックス (各格子が2枚の三角形)
  const indexCount = segmentsV * segmentsH * 6; // 1セル=2三角形=6頂点
  const indices = new Uint32Array(indexCount);

  let idxPos = 0;
  let idxUV = 0;

  // 頂点 (i:0..segmentsV, j:0..segmentsH)
  //   alpha in [0..maxAlpha], phi in [0..2π]
  for (let i = 0; i <= segmentsV; i++) {
    // α (0..maxAlpha)
    const alpha = maxAlpha * (i / segmentsV);

    for (let j = 0; j <= segmentsH; j++) {
      // φ (0..2π)
      const phi = 2 * Math.PI * (j / segmentsH);

      // --- 3D座標を計算 (Y軸を光軸とみなす) ---
      const sinA = Math.sin(alpha);
      const x = sinA * Math.sin(phi);
      const y = Math.cos(alpha);
      const z = sinA * Math.cos(phi);

      positions[idxPos + 0] = x * sphereRadius;
      positions[idxPos + 1] = y * sphereRadius;
      positions[idxPos + 2] = z * sphereRadius;
      idxPos += 3;

      // --- UVを計算 (等距離射影) ---
      // 半径 r_img を [0..0.5] の範囲に対応させる
      const r = (alpha / maxAlpha) * 0.5; // 0..0.5
      const u = 0.5 + r * Math.sin(phi); // sin, cosの向きは好みで調整
      const v = 0.5 + r * Math.cos(phi);

      uvs[idxUV + 0] = u;
      uvs[idxUV + 1] = v;
      idxUV += 2;
    }
  }

  // インデックス生成
  let idxIndex = 0;
  for (let i = 0; i < segmentsV; i++) {
    for (let j = 0; j < segmentsH; j++) {
      // 2三角形
      const row1 = i * (segmentsH + 1);
      const row2 = (i + 1) * (segmentsH + 1);

      const a = row1 + j;
      const b = row1 + j + 1;
      const c = row2 + j;
      const d = row2 + j + 1;

      // 三角形1
      indices[idxIndex++] = a;
      indices[idxIndex++] = c;
      indices[idxIndex++] = b;
      // 三角形2
      indices[idxIndex++] = b;
      indices[idxIndex++] = c;
      indices[idxIndex++] = d;
    }
  }

  // BufferGeometry を組み立て
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // 法線を計算 (外向きになる)
  geometry.computeVertexNormals();

  return geometry;
};

// ---- 使い方例 ----
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableZoom = false;

// 例: FOV=180, 分割 50x100, 半径=5
const fisheyeGeom = createFisheyeGeometry(180, 50, 100, 5);

// 内側から見る場合は geometry.scale(-1,1,1) など
fisheyeGeom.scale(-1, 1, 1);

const textureLoader = new THREE.TextureLoader();
textureLoader.load("fisheye.jpg", (tex) => {
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const mesh = new THREE.Mesh(fisheyeGeom, mat);
  scene.add(mesh);
  animate();
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
