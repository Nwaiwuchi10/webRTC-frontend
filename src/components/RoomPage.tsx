// import React, { useEffect, useCallback, useState } from "react";
// import ReactPlayer from "react-player";
// import peer from "../service/Peer"
// import { useSocket } from "../socket/SocketProvider";

// const RoomPage = () => {
//   const socket = useSocket();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState();
//   const [remoteStream, setRemoteStream] = useState();

//   const handleUserJoined = useCallback(({ userId, id }) => {
//     console.log(`Email ${userId} joined room`);
//     setRemoteSocketId(id);
//   }, []);

//   const handleCallUser = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer });
//     setMyStream(stream);
//   }, [remoteSocketId, socket]);

//   const handleIncommingCall = useCallback(
//     async ({ from, offer }) => {
//       setRemoteSocketId(from);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setMyStream(stream);
//       console.log(`Incoming Call`, from, offer);
//       const ans = await peer.getAnswer(offer);
//       socket.emit("call:accepted", { to: from, ans });
//     },
//     [socket]
//   );

//   const sendStreams = useCallback(() => {
//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   const handleCallAccepted = useCallback(
//     ({ from, ans }) => {
//       peer.setLocalDescription(ans);
//       console.log("Call Accepted!");
//       sendStreams();
//     },
//     [sendStreams]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   }, [handleNegoNeeded]);

//   const handleNegoNeedIncomming = useCallback(
//     async ({ from, offer }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeedFinal = useCallback(async ({ ans }) => {
//     await peer.setLocalDescription(ans);
//   }, []);

//   useEffect(() => {
//     peer.peer.addEventListener("track", async (ev) => {
//       const remoteStream = ev.streams;
//       console.log("GOT TRACKS!!");
//       setRemoteStream(remoteStream[0]);
//     });
//   }, []);

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined);
//     socket.on("incomming:call", handleIncommingCall);
//     socket.on("call:accepted", handleCallAccepted);
//     socket.on("peer:nego:needed", handleNegoNeedIncomming);
//     socket.on("peer:nego:final", handleNegoNeedFinal);

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incomming:call", handleIncommingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeedIncomming);
//       socket.off("peer:nego:final", handleNegoNeedFinal);
//     };
//   }, [
//     socket,
//     handleUserJoined,
//     handleIncommingCall,
//     handleCallAccepted,
//     handleNegoNeedIncomming,
//     handleNegoNeedFinal,
//   ]);

//   return (
//     <div>
//       <h1>Room Page</h1>
//       <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
//       {myStream && <button onClick={sendStreams}>Send Stream</button>}
//       {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
//       {myStream && (
//         <>
//           <h1>My Stream</h1>
//           <ReactPlayer
//             playing
//             muted
//             height="100px"
//             width="200px"
//             url={myStream}
//           />
//         </>
//       )}
//       {remoteStream && (
//         <>
//           <h1>Remote Stream</h1>
//           <ReactPlayer
//             playing
//             muted
//             height="100px"
//             width="200px"
//             url={remoteStream}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default RoomPage;
// import React, { useEffect, useCallback, useState } from "react";

// import peer from "../service/Peer";

// import { useSocket } from "../socket/SocketProvider";

// const RoomPage: React.FC = () => {
//   const socket = useSocket();
//   const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
//   const [myStream, setMyStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

//   const handleUserJoined = useCallback(
//     ({ userId, id }: { userId: string; id: string }) => {
//       console.log(`Email ${userId} joined room`);
//       setRemoteSocketId(id);
//     },
//     []
//   );

//   const handleCallUser = useCallback(async () => {
//     if (!remoteSocketId) return;
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer });
//     setMyStream(stream);
//   }, [remoteSocketId, socket]);

//   const handleIncomingCall = useCallback(
//     async ({
//       from,
//       offer,
//     }: {
//       from: string;
//       offer: RTCSessionDescriptionInit;
//     }) => {
//       setRemoteSocketId(from);
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       setMyStream(stream);
//       console.log("Incoming Call", from, offer);
//       const ans = await peer.getAnswer(offer);
//       socket.emit("call:accepted", { to: from, ans });
//     },
//     [socket]
//   );

//   const sendStreams = useCallback(() => {
//     if (!myStream) return;
//     myStream
//       .getTracks()
//       .forEach((track) => peer.peer.addTrack(track, myStream));
//   }, [myStream]);

//   const handleCallAccepted = useCallback(
//     ({ from, ans }: { from: string; ans: RTCSessionDescriptionInit }) => {
//       peer.setLocalDescription(ans);
//       console.log("Call Accepted!");
//       sendStreams();
//     },
//     [sendStreams]
//   );

//   const handleNegoNeeded = useCallback(async () => {
//     if (!remoteSocketId) return;
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//   }, [remoteSocketId, socket]);

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//     return () => {
//       peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
//     };
//   }, [handleNegoNeeded]);

//   const handleNegoNeedIncoming = useCallback(
//     async ({
//       from,
//       offer,
//     }: {
//       from: string;
//       offer: RTCSessionDescriptionInit;
//     }) => {
//       const ans = await peer.getAnswer(offer);
//       socket.emit("peer:nego:done", { to: from, ans });
//     },
//     [socket]
//   );

//   const handleNegoNeedFinal = useCallback(
//     async ({ ans }: { ans: RTCSessionDescriptionInit }) => {
//       await peer.setLocalDescription(ans);
//     },
//     []
//   );

//   useEffect(() => {
//     peer.peer.addEventListener("track", (ev: RTCTrackEvent) => {
//       const [stream] = ev.streams;
//       console.log("GOT TRACKS!!");
//       setRemoteStream(stream);
//     });
//   }, []);

//   useEffect(() => {
//     socket.on("user:joined", handleUserJoined);
//     socket.on("incoming:call", handleIncomingCall);
//     socket.on("call:accepted", handleCallAccepted);
//     socket.on("peer:nego:needed", handleNegoNeedIncoming);
//     socket.on("peer:nego:final", handleNegoNeedFinal);

//     return () => {
//       socket.off("user:joined", handleUserJoined);
//       socket.off("incoming:call", handleIncomingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       socket.off("peer:nego:needed", handleNegoNeedIncoming);
//       socket.off("peer:nego:final", handleNegoNeedFinal);
//     };
//   }, [
//     socket,
//     handleUserJoined,
//     handleIncomingCall,
//     handleCallAccepted,
//     handleNegoNeedIncoming,
//     handleNegoNeedFinal,
//   ]);

//   return (
//     <div>
//       <h1>Room Page</h1>
//       <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
//       {myStream && <button onClick={sendStreams}>Send Stream</button>}
//       {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
//       {myStream && (
//         <>
//           <h1>My Stream</h1>
//           <video
//             ref={(video) => video && (video.srcObject = myStream)}
//             autoPlay
//             muted
//             width="200"
//             height="100"
//           />

//           {/* <ReactPlayer playing muted height="100px" width="200px" url={URL.createObjectURL(myStream)} /> */}
//         </>
//       )}
//       {remoteStream && (
//         <>
//           <h1>Remote Stream</h1>
//           <video
//             ref={(video) => video && (video.srcObject = remoteStream)}
//             autoPlay
//             muted
//             width="200"
//             height="100"
//           />

//           {/* <ReactPlayer playing muted height="100px" width="200px" url={URL.createObjectURL(remoteStream)} /> */}
//         </>
//       )}
//     </div>
//   );
// };

// export default RoomPage;
import React from "react";

const RoomPage = () => {
  return <div>RoomPage</div>;
};

export default RoomPage;
