import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const socket = io("http://localhost:5000");

interface OfferPayload {
  offer: RTCSessionDescriptionInit;
  from: string;
}

interface AnswerPayload {
  answer: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
}

interface UserJoinedPayload {
  userId: string;
  socketId: string;
}

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [userRequests, setUserRequests] = useState<
    { userId: string; socketId: string }[]
  >([]);

  useEffect(() => {
    socket.emit("join-room", { meetingId, userId: socket.id });

    socket.on("user-joined", ({ socketId }: UserJoinedPayload) => {
      console.log("User joined:", socketId);
      initiateCall(socketId);
    });

    socket.on("receive-offer", async ({ offer, from }: OfferPayload) => {
      console.log("Received Offer", offer);
      setRemoteSocketId(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { answer, targetSocketId: from });
      }
    });

    socket.on("user-request", (data: { userId: string; socketId: string }) => {
      console.log(`User ${data.userId} is requesting to join`);
      setUserRequests((prev) => [...prev, data]);
    });

    socket.on("admission-granted", () => {
      console.log("You have been admitted to the meeting");
    });

    socket.on("admission-rejected", () => {
      console.log("Your join request was rejected");
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive-offer");
      socket.off("user-request");
    };
  }, [meetingId, peerConnection]);

  const initiateCall = async (targetSocketId: string) => {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(userStream);

    if (localVideoRef.current) localVideoRef.current.srcObject = userStream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    userStream.getTracks().forEach((track) => pc.addTrack(track, userStream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = event.streams[0];
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { offer, targetSocketId });

    setPeerConnection(pc);
  };

  const toggleMic = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOn(!isVideoOn);
    }
  };

  const leaveMeeting = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    socket.emit("leave-room", { meetingId, userId: socket.id });
    socket.disconnect();
    navigate("/");
  };

  const requestJoin = () => {
    socket.emit("request-join", { meetingId, userId: socket.id });
  };

  const admitUser = (socketId: string) => {
    socket.emit("admit-user", { meetingId, userId: socket.id, socketId });
    setUserRequests((prev) =>
      prev.filter((user) => user.socketId !== socketId)
    );
  };

  const rejectUser = (socketId: string) => {
    socket.emit("reject-user", { meetingId, socketId });
    setUserRequests((prev) =>
      prev.filter((user) => user.socketId !== socketId)
    );
  };

  return (
    <div>
      <h2>Meeting Room: {meetingId}</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      <div className="controls" style={{ marginTop: "10px" }}>
        <button onClick={toggleMic} style={{ marginRight: "10px" }}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleVideo} style={{ marginRight: "10px" }}>
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button onClick={leaveMeeting} style={{ cursor: "pointer" }}>
          Leave Meeting
        </button>
      </div>

      <h3>Users Requesting to Join:</h3>
      {userRequests.map((user) => (
        <div key={user.socketId}>
          <p>User: {user.userId}</p>
          <button
            onClick={() => admitUser(user.socketId)}
            style={{ marginRight: "10px" }}
          >
            Admit
          </button>
          <button onClick={() => rejectUser(user.socketId)}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default MeetingRoom;

// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import io from "socket.io-client";
// import {
//   FaMicrophone,
//   FaMicrophoneSlash,
//   FaVideo,
//   FaVideoSlash,
// } from "react-icons/fa";

// const socket = io("http://localhost:5000");

// interface OfferPayload {
//   offer: RTCSessionDescriptionInit;
//   from: string;
// }

// interface AnswerPayload {
//   answer: RTCSessionDescriptionInit;
// }

// interface IceCandidatePayload {
//   candidate: RTCIceCandidateInit;
// }

// interface UserJoinedPayload {
//   userId: string;
//   socketId: string;
// }

// const MeetingRoom: React.FC = () => {
//   const { meetingId } = useParams<{ meetingId: string }>();
//   const navigate = useNavigate();
//   const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const [peerConnection, setPeerConnection] =
//     useState<RTCPeerConnection | null>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [isMicOn, setIsMicOn] = useState<boolean>(true);
//   const [isVideoOn, setIsVideoOn] = useState<boolean>(true);

//   useEffect(() => {
//     socket.emit("join-room", { meetingId, userId: socket.id });

//     socket.on("user-joined", ({ socketId }: UserJoinedPayload) => {
//       console.log("User joined:", socketId);
//       initiateCall(socketId);
//     });

//     socket.on("receive-offer", async ({ offer, from }: OfferPayload) => {
//       console.log("Received Offer", offer);
//       setRemoteSocketId(from);
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(
//           new RTCSessionDescription(offer)
//         );
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.emit("answer", { answer, targetSocketId: from });
//       }
//     });

//     return () => {
//       socket.off("user-joined");
//       socket.off("receive-offer");
//     };
//   }, [meetingId, peerConnection]);

//   const initiateCall = async (targetSocketId: string) => {
//     const userStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     setStream(userStream);

//     if (localVideoRef.current) localVideoRef.current.srcObject = userStream;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     userStream.getTracks().forEach((track) => pc.addTrack(track, userStream));

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current)
//         remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit("offer", { offer, targetSocketId });

//     setPeerConnection(pc);
//   };

//   const toggleMic = () => {
//     if (stream) {
//       stream
//         .getAudioTracks()
//         .forEach((track) => (track.enabled = !track.enabled));
//       setIsMicOn(!isMicOn);
//     }
//   };

//   const toggleVideo = () => {
//     if (stream) {
//       stream
//         .getVideoTracks()
//         .forEach((track) => (track.enabled = !track.enabled));
//       setIsVideoOn(!isVideoOn);
//     }
//   };

//   const leaveMeeting = () => {
//     if (localVideoRef.current?.srcObject) {
//       const stream = localVideoRef.current.srcObject as MediaStream;
//       stream.getTracks().forEach((track) => track.stop());
//     }

//     if (peerConnection) {
//       peerConnection.close();
//       setPeerConnection(null);
//     }

//     socket.emit("leave-room", { meetingId, userId: socket.id });

//     socket.disconnect();

//     navigate("/");
//   };
//   const requestJoin = () => {
//     socket.emit("request-join", { meetingId, userId: socket.id });
//   };
//   socket.on(
//     "user-request",
//     ({ userId, socketId }: { userId: string; socketId: string }) => {
//       console.log(`User ${userId} is requesting to join`);
//       // Show accept/reject buttons to the owner
//     }
//   );
//   socket.on(
//     "user-request",
//     ({ userId, socketId }: { userId: string; socketId: string }) => {
//       console.log(`User ${userId} is requesting to join`);
//       // Show accept/reject buttons to the owner
//     }
//   );
//   const admitUser = (socketId: string) => {
//     socket.emit("admit-user", { meetingId,  userId: socket.id, socketId });
//   };
//   const rejectUser = (socketId: string) => {
//     socket.emit("reject-user", { meetingId, socketId });
//   };
//   socket.on("admission-granted", () => {
//     console.log("You have been admitted to the meeting");
//   });

//   socket.on("admission-rejected", () => {
//     console.log("Your join request was rejected");
//   });

//   return (
//     <div>
//       <h2>Meeting Room: {meetingId}</h2>
//       <div className="video-container">
//         <video ref={localVideoRef} autoPlay playsInline />
//         <video ref={remoteVideoRef} autoPlay playsInline />
//       </div>

//       <div className="controls" style={{ marginTop: "10px" }}>
//         <button onClick={toggleMic} style={{ marginRight: "10px" }}>
//           {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
//         </button>
//         <button onClick={toggleVideo} style={{ marginRight: "10px" }}>
//           {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
//         </button>
//         <button onClick={leaveMeeting} style={{ cursor: "pointer" }}>
//           Leave Meeting
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MeetingRoom;

// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");
// interface OfferPayload {
//   offer: RTCSessionDescriptionInit;
//   from: string;
// }
// interface AnswerPayload {
//   answer: RTCSessionDescriptionInit;
// }

// interface IceCandidatePayload {
//   candidate: RTCIceCandidateInit;
// }

// interface UserJoinedPayload {
//   userId: string;
//   socketId: string;
// }
// const MeetingRoom: React.FC = () => {
//   const { meetingId } = useParams<{ meetingId: string }>();
//   const navigate = useNavigate();
//   const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const [peerConnection, setPeerConnection] =
//     useState<RTCPeerConnection | null>(null);
//     const [isMicOn, setIsMicOn] = useState<boolean>(true);
//     const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
//   useEffect(() => {
//     socket.emit("join-room", { meetingId, userId: socket.id });

//     socket.on("user-joined", ({ socketId }: UserJoinedPayload) => {
//       console.log("User joined:", socketId);
//       initiateCall(socketId);
//     });

//     socket.on("receive-offer", async ({ offer, from }: OfferPayload) => {
//       console.log("Received Offer", offer);
//       setRemoteSocketId(from);
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(
//           new RTCSessionDescription(offer)
//         );
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.emit("answer", { answer, targetSocketId: from });
//       }
//     });

//     return () => {
//       socket.off("user-joined");
//       socket.off("receive-offer");
//     };
//   }, [meetingId, peerConnection]);

//   const initiateCall = async (targetSocketId: string) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current)
//         remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit("offer", { offer, targetSocketId });

//     setPeerConnection(pc);
//   };

//   const toggleMic = () => {
//     if (stream) {
//       stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsMicOn(!isMicOn);
//     }
//   };

//   const toggleVideo = () => {
//     if (stream) {
//       stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
//       setIsVideoOn(!isVideoOn);
//     }
//   };

//   const leaveMeeting = () => {
//     // Stop local video/audio
//     if (localVideoRef.current?.srcObject) {
//       const stream = localVideoRef.current.srcObject as MediaStream;
//       stream.getTracks().forEach((track) => track.stop());
//     }

//     // Close peer connection
//     if (peerConnection) {
//       peerConnection.close();
//       setPeerConnection(null);
//     }

//     // Notify server
//     socket.emit("leave-room", { meetingId, userId: socket.id });

//     // Disconnect socket (optional)
//     socket.disconnect();

//     // Navigate away (e.g., back to homepage)
//     navigate("/");
//   };

//   return (
//     <div>
//       <h2>Meeting Room: {meetingId}</h2>
//       <div className="video-container">
//         <video ref={localVideoRef} autoPlay playsInline />
//         <video ref={remoteVideoRef} autoPlay playsInline />
//       </div>
//       <button
//         onClick={leaveMeeting}
//         style={{ marginTop: "10px", cursor: "pointer" }}
//       >
//         Leave Meeting
//       </button>
//     </div>
//   );
// };

// export default MeetingRoom;

// import React, { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");
// interface OfferPayload {
//   offer: RTCSessionDescriptionInit;
//   from: string;
// }

// interface AnswerPayload {
//   answer: RTCSessionDescriptionInit;
// }

// interface IceCandidatePayload {
//   candidate: RTCIceCandidateInit;
// }

// interface UserJoinedPayload {
//   userId: string;
//   socketId: string;
// }
// const MeetingRoom: React.FC = () => {
//   const { meetingId } = useParams<{ meetingId: string }>();
//   const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const [peerConnection, setPeerConnection] =
//     useState<RTCPeerConnection | null>(null);

//   useEffect(() => {
//     socket.emit("join-room", { meetingId: meetingId, userId: socket.id });

//     socket.on("user-joined", ({ socketId }: UserJoinedPayload) => {
//       console.log("User joined:", socketId);
//       initiateCall(socketId);
//     });

//     socket.on("receive-offer", async ({ offer, from }: OfferPayload) => {
//       console.log("Received Offer", offer);
//       setRemoteSocketId(from);
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(
//           new RTCSessionDescription(offer)
//         );
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.emit("answer", { answer, targetSocketId: from });
//       }
//     });

//     return () => {
//       socket.off("user-joined");
//       socket.off("receive-offer");
//     };
//   }, [meetingId, peerConnection]);

//   const initiateCall = async (targetSocketId: string) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current)
//         remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit("offer", { offer, targetSocketId });

//     setPeerConnection(pc);
//   };

//   return (
//     <div>
//       <h2>Meeting Room: {meetingId}</h2>
//       <div className="video-container">
//         <video ref={localVideoRef} autoPlay playsInline />
//         <video ref={remoteVideoRef} autoPlay playsInline />
//       </div>
//     </div>
//   );
// };

// export default MeetingRoom;
