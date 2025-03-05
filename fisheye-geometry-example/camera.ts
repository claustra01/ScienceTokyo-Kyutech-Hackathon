import { PerspectiveCamera } from "three";

export const camera = new PerspectiveCamera(
  75, // 視野角
  window.innerWidth / window.innerHeight, // アスペクト比
  0.1, // 近クリップ面
  1000, // 遠クリップ面
);
camera.position.set(0, 0, 0.1);
