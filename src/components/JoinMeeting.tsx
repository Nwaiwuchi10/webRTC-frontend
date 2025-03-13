// import { useEffect, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";

// const socket = io("http://localhost:8000");

// export const useWebRTC = (meetingId: string, userId: string) => {
//   const [peers, setPeers] = useState<{ [key: string]: Peer.Instance }>({});
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);

//   useEffect(() => {
//     socket.emit("join-call", { meetingId, userId });

//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setLocalStream(stream);
//       })
//       .catch((err) => console.error("Error getting user media", err));

//     socket.on("user-joined", ({ userId: _userId, socketId }) => {
//       if (!localStream) return;

//       const peer = new Peer({
//         initiator: true,
//         trickle: false,
//         stream: localStream,
//       });

//       peer.on("signal", (signal) =>
//         socket.emit("offer", { target: socketId, signal })
//       );

//       peer.on("stream", (stream) => {
//         setPeers((prev) => ({
//           ...prev,
//           [socketId]: { ...peer, stream },
//         }));
//       });

//       setPeers((prev) => ({ ...prev, [socketId]: peer }));
//     });

//     socket.on("offer", ({ signal, target }) => {
//       if (!localStream) return;

//       const peer = new Peer({
//         initiator: false,
//         trickle: false,
//         stream: localStream,
//       });

//       peer.signal(signal);
//       peer.on("signal", (answer) => socket.emit("answer", { target, answer }));

//       peer.on("stream", (stream) => {
//         setPeers((prev) => ({
//           ...prev,
//           [target]: { ...peer, stream },
//         }));
//       });

//       setPeers((prev) => ({ ...prev, [target]: peer }));
//     });

//     socket.on("answer", ({ target, answer }) => {
//       peers[target]?.signal(answer);
//     });

//     socket.on("ice-candidate", ({ target, candidate }) => {
//       peers[target]?.signal(candidate);
//     });

//     socket.on("user-left", (socketId) => {
//       if (peers[socketId]) {
//         peers[socketId].destroy();
//       }

//       setPeers((prev) => {
//         const newPeers = { ...prev };
//         delete newPeers[socketId];
//         return newPeers;
//       });
//     });

//     return () => {
//       socket.emit("leave-call", { meetingId });
//       localStream?.getTracks().forEach((track) => track.stop());
//       Object.values(peers).forEach((peer) => peer.destroy());
//     };
//   }, [localStream]); // Depend on `localStream` to ensure it's available before using

//   return { peers, localStream };
// };
import React from "react";

const JoinMeeting = () => {
  return <div>JoinMeeting</div>;
};

export default JoinMeeting;
