import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaSignOutAlt,
} from "react-icons/fa";

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const socket: any = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<any>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  console.log("participants", participants);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    if (meetingId && socket) {
      socket.emit(
        "room:join",
        { meetingId, userId: socket.id },
        (response: any) => {
          if (response.success) {
            setParticipants(response.participants);
          } else {
            console.error("Failed to join meeting:", response.error);
          }
        }
      );
    }
  }, [meetingId, socket]);

  const handleUserJoined = useCallback(
    ({
      meetingId,
      userId,
      participants,
    }: {
      meetingId: string;
      userId: string;
      participants: any[];
    }) => {
      console.log(`User ${userId} joined room ${meetingId}`);
      setParticipants(participants);
      if (!remoteSocketId) {
        setRemoteSocketId(userId);
      }
    },
    []
  );
  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) {
      console.log("No remote socket ID");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("My stream:", stream);
      setMyStream(stream);

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error getting media stream", error);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }: { from: any; offer: any }) => {
      console.log("Incoming call from:", from);
      setRemoteSocketId(from);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        const answer = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans: answer });
      } catch (error) {
        console.error("Error handling incoming call", error);
      }
    },
    [socket]
  );
  useEffect(() => {
    peer.peer.ontrack = (event) => {
      console.log("Remote stream received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };
  }, []);
  const sendStreams = useCallback(() => {
    if (!myStream) return;

    const senders = peer.peer.getSenders(); // Get existing senders
    myStream.getTracks().forEach((track) => {
      const existingSender = senders.find((sender) => sender.track === track);
      if (!existingSender) {
        peer.peer.addTrack(track, myStream);
      }
    });
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }: { from: any; ans: any }) => {
      if (peer.peer.signalingState !== "stable") {
        await peer.setLocalDescription(ans);
      }
      sendStreams();
      peer.peer.ontrack = (event) => {
        console.log("Remote stream received:", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };
    },
    [sendStreams]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);
  useEffect(() => {
    if (myStream) {
      sendStreams();
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteSocketId) {
      handleCallUser();
    }
  }, [remoteSocketId]);

  // Leave Meeting
  const toggleMic = () => {
    if (myStream) {
      const audioTracks = myStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsMicOn(audioTracks[0].enabled); // Update state based on the current state
      }
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      const videoTracks = myStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsVideoOn(videoTracks[0].enabled); // Update state based on the current state
      }
    }
  };
  useEffect(() => {
    if (myStream) {
      if (myStream.getAudioTracks().length > 0) {
        setIsMicOn(myStream.getAudioTracks()[0].enabled);
      }
      if (myStream.getVideoTracks().length > 0) {
        setIsVideoOn(myStream.getVideoTracks()[0].enabled);
      }
    }
  }, [myStream]);

  const leaveMeeting = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    Object.values(peer).forEach((pc) => pc.close());

    socket.emit("leave-room", { meetingId, userId: socket.id });
    socket.disconnect();
    navigate("/");
  };

  const leaveMeetings = () => {
    if (!socket) return; // Ensure socket is defined

    // Make sure userId is defined (fetch it from state, context, or props)
    const userId = socket.id; // If using socket ID as user identifier

    if (myStream) {
      myStream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });

      setMyStream(null);
      setRemoteStream(null);
      setParticipants([]);
    }

    // Emit a custom "leave-meeting" event with meetingId and userId
    if (userId && meetingId) {
      socket.emit("leave-meeting", { meetingId, userId });
    }

    // Navigate away after emitting the event
    navigate("/");
  };

  return (
    <div>
      <h1>Meeting Room</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>} */}
      {/* {participants?.map((participant) => (
        <>
          <h4>{participant.userId} </h4>
        </>
      ))} */}
      <div style={{ display: "flex", paddingBottom: "20px" }}>
        {myStream && (
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            // ref={myStream}
            url={myStream}
            // muted
          />
        )}
        {remoteStream && (
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={remoteStream}
            // muted
          />
        )}
      </div>
      <div
        className="controls"
        style={{ display: "flex", gap: "10px", marginTop: "10px" }}
      >
        {/* <button onClick={toggleMic}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button> */}
        <button onClick={leaveMeeting}>Leave Meeting</button>
      </div>
    </div>
  );
};

export default MeetingRoom;
