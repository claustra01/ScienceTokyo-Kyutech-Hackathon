import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

const origin = window.location.origin;

export const trimVideo = async (file: string) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL: `${origin}/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js`,
      classWorkerURL:
        `${origin}/node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js`,
      wasmURL: `${origin}/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm`,
      workerURL: `${origin}/node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js`,
    });
  }

  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vf",
    "crop=1080:1080:0:420",
    "-c:a",
    "copy",
    "output.mp4",
  ]);

  // 出力ファイルを取得
  const data = await ffmpeg.readFile("output.mp4");
  const videoURL = URL.createObjectURL(
    new Blob([data], { type: "video/mp4" }),
  );

  return videoURL;
};
