import { LocalAudioTrack, LocalVideoTrack, Room, Track } from 'livekit-client';

const wsURL = 'wss://sciencetokyo-kyutech-hackathon-bod15vue.livekit.cloud';
//const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InlvdXItcm9vbSJ9LCJpc3MiOiJBUElodjV3eFdOeXZCbWUiLCJleHAiOjE3NDEyNDI1MjUsIm5iZiI6MCwic3ViIjoieW91ci11c2VybmFtZSJ9.-ShYrdmQJeEWk0PHkLRmZ8qMJA1MO9EucarmVlfWNNM';

(async () => {
  const url = new URL(window.location.href);
  const roomName = url.searchParams.get('room');
  const userName = url.searchParams.get('username');
  const resp = await fetch(`https://livekit-hackathon.cp20.dev/getToken?room=${roomName}&username=${userName}`);
  const token = await resp.text();

  const room = new Room();
  await room.connect(wsURL, token);
  console.log('connected to room', room.name);

  const localParticipant = room.localParticipant;
  const remoteParticipants = room.remoteParticipants;
  // カメラとマイクを有効化
  await localParticipant.enableCameraAndMicrophone();

  // video要素を作成してページに追加（ローカル映像用）
  const videoEl = document.createElement('video');
  videoEl.autoplay = true;
  videoEl.muted = true; // 自分の映像はミュートしておく（エコー防止などの理由から）
  document.body.appendChild(videoEl);

  // localParticipantからvideo trackのPublicationを取得
  const videoPub = localParticipant.getTrackPublication(Track.Source.Camera);
  if (videoPub && videoPub.track) {
    // trackをvideo要素にアタッチして再生
    videoPub.track.attach(videoEl);
  }

  remoteParticipants.forEach((participant) => {
    const videoPub = participant.getTrackPublication(Track.Source.Camera);
    if (videoPub && videoPub.track) {
      const videoEl = document.createElement('video');
      videoEl.autoplay = true;
      document.body.appendChild(videoEl);
      videoPub.track.attach(videoEl);
    }
  })
})();
