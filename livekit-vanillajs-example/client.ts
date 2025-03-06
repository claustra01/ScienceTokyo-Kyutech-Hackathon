import { RemoteParticipant, Room, Track } from "livekit-client";

const wsURL = "wss://sciencetokyo-kyutech-hackathon-bod15vue.livekit.cloud";

const url = new URL(window.location.href);
const roomName = url.searchParams.get("room");
const userName = url.searchParams.get("username");
const resp = await fetch(
  `https://livekit-hackathon.cp20.dev/getToken?room=${roomName}&username=${userName}`,
);
const token = await resp.text();

const room = new Room();

// リモート参加者の映像を表示する関数
function handleParticipantConnected(participant: RemoteParticipant) {
  console.log("participant connected:", participant.identity);

  // 既存のトラックに対応
  participant.trackPublications.forEach((publication) => {
    if (publication.track && publication.source === Track.Source.Camera) {
      addVideoElement(publication.track, participant.identity);
    }
  });

  // 新しいトラックが公開された時に対応
  participant.on("trackSubscribed", (track, publication) => {
    if (track.source === Track.Source.Camera) {
      addVideoElement(track, participant.identity);
    }
  });
}

// ビデオ要素を追加する関数
function addVideoElement(track: Track, identity: string) {
  const videoEl = document.createElement("video");
  videoEl.autoplay = true;
  videoEl.id = `video-${identity}`;
  document.body.appendChild(videoEl);
  track.attach(videoEl);
}

// イベントリスナーを設定
room.on("participantConnected", handleParticipantConnected);

// 参加者が退出したときのクリーンアップ
room.on("participantDisconnected", (participant) => {
  console.log("participant disconnected:", participant.identity);
  const videoEl = document.getElementById(`video-${participant.identity}`);
  if (videoEl) {
    videoEl.remove();
  }
});

await room.connect(wsURL, token);
console.log("connected to room", room.name);

const localParticipant = room.localParticipant;

// カメラとマイクを有効化
await localParticipant.enableCameraAndMicrophone();

// ローカル映像用のvideo要素を作成
const localVideoEl = document.createElement("video");
localVideoEl.autoplay = true;
localVideoEl.muted = true; // 自分の映像はミュートしておく
localVideoEl.id = "local-video";
document.body.appendChild(localVideoEl);

// ローカル映像を表示
const videoPub = localParticipant.getTrackPublication(Track.Source.Camera);
if (videoPub && videoPub.track) {
  videoPub.track.attach(localVideoEl);
}

// 既に接続している参加者の処理
room.remoteParticipants.forEach(handleParticipantConnected);
