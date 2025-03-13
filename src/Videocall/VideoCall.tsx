import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust based on your backend URL
// const socket = io("https://appmosphere-backend-task.onrender.com");
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

const VideoCall: React.FC = () => {
  const navigate = useNavigate();

  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [meetingId, setMeetingId] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    socket.on("user-joined", ({ userId, socketId }: UserJoinedPayload) => {
      console.log(`User ${userId} joined. Socket: ${socketId}`);
      setRemoteSocketId(socketId);
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

    socket.on("receive-answer", async ({ answer }: AnswerPayload) => {
      console.log("Received Answer", answer);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("receive-ice-candidate", ({ candidate }: IceCandidatePayload) => {
      console.log("Received ICE Candidate", candidate);
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
    };
  }, [peerConnection]);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          targetSocketId: remoteSocketId,
        });
      }
    };

    setPeerConnection(pc);
  };

  const createOffer = async () => {
    if (!peerConnection || !remoteSocketId) return;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { offer, targetSocketId: remoteSocketId });
  };

  // const createRoom = () => {
  //   socket.emit("create-meeting", { userId });
  //   navigate(`/meeting/${meetingId}`);
  // };
  const createRoom = () => {
    socket.emit(
      "create-meeting",
      { userId },
      (response: { meetingId?: string; error?: string }) => {
        console.log("Server response:", response); // Debugging log

        if (response?.meetingId) {
          setMeetingId(response.meetingId); // Store meetingId in state
          navigate(`/meeting/${response.meetingId}`); // Navigate with valid meetingId
        } else {
          console.error("Failed to create meeting:", response?.error);
        }
      }
    );
  };

  const joinRoom = () => {
    socket.emit("join-room", { meetingId, userId });
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold">WebRTC Video Call</h2>
      <button
        style={{ cursor: "pointer" }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={createRoom}
      >
        Create Instant meeting
      </button>
      <input
        type="text"
        placeholder="Enter Meeting ID to join"
        className="border p-2 my-2"
        onChange={(e) => setMeetingId(e.target.value)}
      />
      <button
        style={{ cursor: "pointer" }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={joinRoom}
      >
        Join Room
      </button>

      <div className="flex space-x-4 mt-5">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className="w-1/2 border rounded"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 border rounded"
        />
      </div>
    </div>
  );
};

export default VideoCall;
