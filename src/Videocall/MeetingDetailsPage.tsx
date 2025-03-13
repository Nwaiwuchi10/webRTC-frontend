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
// const socket = io("https://appmosphere-backend-task.onrender.com");
interface Participant {
  userId: string;
  stream?: MediaStream;
}

interface OfferPayload {
  offer: RTCSessionDescriptionInit;
  from: string;
}

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: RTCPeerConnection;
  }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);

  useEffect(() => {
    socket.emit("join-room", { meetingId, userId: socket.id });

    socket.on("update-participants", (userIds: string[]) => {
      const newParticipants = userIds.map((userId) => ({ userId }));
      setParticipants(newParticipants);
    });

    socket.on("receive-offer", async ({ offer, from }: OfferPayload) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { answer, targetSocketId: from });
    });

    socket.on(
      "receive-answer",
      async ({
        answer,
        from,
      }: {
        answer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        const pc = peerConnections[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      }
    );

    socket.on(
      "receive-ice-candidate",
      async ({
        candidate,
        from,
      }: {
        candidate: RTCIceCandidateInit;
        from: string;
      }) => {
        const pc = peerConnections[from];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [meetingId, peerConnections]);

  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          targetSocketId: userId,
        });
      }
    };

    pc.ontrack = (event) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    setPeerConnections((prev) => ({ ...prev, [userId]: pc }));

    return pc;
  };

  const handleStartStream = async () => {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(userStream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = userStream;
    }

    participants.forEach(({ userId }) => {
      const pc = createPeerConnection(userId);
      userStream.getTracks().forEach((track) => pc.addTrack(track, userStream));

      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit("offer", { offer, targetSocketId: userId });
      });
    });
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

    Object.values(peerConnections).forEach((pc) => pc.close());

    socket.emit("leave-room", { meetingId, userId: socket.id });
    socket.disconnect();
    navigate("/");
  };

  useEffect(() => {
    handleStartStream();
  }, []);

  return (
    <div>
      <h2>Meeting Room: {meetingId}</h2>
      <video ref={localVideoRef} autoPlay playsInline />

      <div className="participants">
        {participants.map((participant) => (
          <div key={participant.userId}>
            <h4>User: {participant.userId}</h4>
            <video
              autoPlay
              playsInline
              ref={(ref) => {
                if (ref && participant.stream) {
                  ref.srcObject = participant.stream;
                }
              }}
            />
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={toggleMic}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button onClick={leaveMeeting}>Leave Meeting</button>
      </div>
    </div>
  );
};

export default MeetingRoom;
