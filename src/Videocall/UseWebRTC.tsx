import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

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

export const useWebRTC = (meetingId: string, userId: string) => {
  const socketRef = useRef(io(SOCKET_SERVER_URL));
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    socketRef.current.emit("join-room", { meetingId, userId });

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    socketRef.current.on(
      "user-joined",
      ({ userId, socketId }: UserJoinedPayload) => {
        console.log(`User joined: ${userId} with socket: ${socketId}`);
      }
    );

    socketRef.current.on(
      "receive-offer",
      async ({ offer, from }: OfferPayload) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socketRef.current.emit("answer", { answer, targetSocketId: from });
        }
      }
    );

    socketRef.current.on(
      "receive-answer",
      async ({ answer }: AnswerPayload) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      }
    );

    socketRef.current.on(
      "receive-ice-candidate",
      async ({ candidate }: IceCandidatePayload) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [meetingId, userId]);

  const startLocalStream = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return localStreamRef.current;
  };

  const callUser = async (targetSocketId: string) => {
    if (!peerConnectionRef.current || !localStreamRef.current) return;

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current!.addTrack(track, localStreamRef.current!);
    });

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socketRef.current.emit("offer", { offer, targetSocketId });
  };

  return { startLocalStream, callUser, remoteStream };
};
