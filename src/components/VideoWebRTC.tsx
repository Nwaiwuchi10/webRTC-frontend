import React, { useEffect, useRef } from "react";
import { useWebRTC } from "./JoinMeeting";

interface VideoCallProps {
  meetingId: string;
  userId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ meetingId, userId }) => {
  const { peers, localStream } = useWebRTC(meetingId, userId);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div>
      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "300px", height: "200px", backgroundColor: "black" }}
      />

      {/* Remote video streams */}
      {Object.values(peers).map((peer, index) => {
        const remoteVideoRef = useRef<HTMLVideoElement>(null);

        useEffect(() => {
          if (peer.streams[0] && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = peer.streams[0];
          }
        }, [peer.streams]);

        return (
          <video
            key={index}
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "300px",
              height: "200px",
              margin: "10px",
              backgroundColor: "black",
            }}
          />
        );
      })}
    </div>
  );
};

export default VideoCall;
