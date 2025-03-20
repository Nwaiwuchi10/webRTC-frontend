import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust for your backend URL

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [participants, setParticipants] = useState<any[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [socketId: string]: RTCPeerConnection }>(
    {}
  );
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

  useEffect(() => {
    const initMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }
        socket.emit("join-room", { meetingId, userId: socket.id });
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initMedia();

    socket.on("participants-list", (participantsList: any) => {
      setParticipants(participantsList);
    });

    socket.on("user-joined", async (newParticipant: any) => {
      setParticipants((prev) => [...prev, newParticipant]);
      const peerConnection = new RTCPeerConnection();
      stream
        ?.getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));
      peersRef.current[newParticipant.socketId] = peerConnection;
      setPeers(peersRef.current);
    });

    socket.on("user-left", ({ userId }: { userId: any }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setPeers(peersRef.current);
      }
    });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      socket.emit("leave-room", { meetingId, userId: socket.id });
      socket.disconnect();
    };
  }, [meetingId]);

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = micMuted;
      setMicMuted(!micMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = videoOff;
      setVideoOff(!videoOff);
    }
  };

  const leaveMeeting = () => {
    socket.emit("leave-room", { meetingId, userId: socket.id });
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Meeting Room: {meetingId}</h1>
      <div className="grid grid-cols-2 gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className="w-64 h-48 bg-black"
          muted
        />
        {participants.map((participant) => (
          <div key={participant.userId}>
            <video autoPlay playsInline className="w-64 h-48 bg-black" />
            <p>{participant.userId}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={toggleMic}
          className="p-2 bg-gray-700 text-white rounded-lg"
        >
          {micMuted ? "Unmute Mic" : "Mute Mic"}
        </button>
        <button
          onClick={toggleVideo}
          className="p-2 bg-gray-700 text-white rounded-lg"
        >
          {videoOff ? "Turn On Video" : "Turn Off Video"}
        </button>
        <button
          onClick={leaveMeeting}
          className="p-2 bg-red-500 text-white rounded-lg"
        >
          Leave Meeting
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;
