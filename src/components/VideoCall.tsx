import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const socket = io("http://localhost:5000");

const VideoChat: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [peers, setPeers] = useState<{ [key: string]: SimplePeer.Instance }>(
    {}
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [meetingId, setMeetingId] = useState("");
  const [userId, setUserId] = useState(() =>
    Math.random().toString(36).substring(7)
  );

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    getMedia();
  }, []);

  useEffect(() => {
    socket.on(
      "user-joined",
      ({ userId, socketId }: { userId: string; socketId: string }) => {
        if (!peers[socketId] && stream) {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
          });
          peer.on("signal", (signal) =>
            socket.emit("offer", { offer: signal, targetSocketId: socketId })
          );
          setPeers((prevPeers) => ({ ...prevPeers, [socketId]: peer }));
        }
      }
    );

    socket.on(
      "receive-offer",
      ({ offer, from }: { offer: SimplePeer.SignalData; from: string }) => {
        if (!stream) return;

        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream,
        });
        peer.signal(offer);
        peer.on("signal", (signal) =>
          socket.emit("answer", { answer: signal, targetSocketId: from })
        );
        setPeers((prevPeers) => ({ ...prevPeers, [from]: peer }));
      }
    );

    socket.on(
      "receive-answer",
      ({ answer, from }: { answer: SimplePeer.SignalData; from: string }) => {
        peers[from]?.signal(answer);
      }
    );

    socket.on(
      "receive-ice-candidate",
      ({
        candidate,
        from,
      }: {
        candidate: SimplePeer.SignalData;
        from: string;
      }) => {
        peers[from]?.signal(candidate);
      }
    );

    return () => {
      socket.off("user-joined");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
    };
  }, [peers, stream]);

  const joinMeeting = () => {
    if (meetingId) {
      socket.emit("join-room", { meetingId, userId });
    }
  };

  return (
    <div>
      <h2>WebRTC Video Chat</h2>
      <input
        type="text"
        placeholder="Enter Meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />
      <button onClick={joinMeeting}>Join Meeting</button>
      <div>
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
    </div>
  );
};

export default VideoChat;
