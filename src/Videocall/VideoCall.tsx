import { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useSocket } from "../context/SocketProvider";

// const socket = io(import.meta.env.VITE_BACKEND_URL);

const VideoCall = () => {
  const socket: any = useSocket();
  const [user] = useState(() => Math.random().toString(36).substr(2, 9));
  const [meetingId, setMeetingId] = useState("");
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId") || user
  );
  const navigate = useNavigate();

  const createRoom = () => {
    socket.emit(
      "create-meeting",
      { userId },
      (response: { meetingId?: string; error?: string }) => {
        if (response?.meetingId) {
          setMeetingId(response.meetingId);
          navigate(`/meeting/${response.meetingId}`);
        } else {
          console.error("Failed to create meeting:", response?.error);
        }
      }
    );
  };

  const handleJoinMeeting = () => {
    if (!meetingId || !userId) {
      alert("Please enter a valid Meeting ID and ensure you are logged in.");
      return;
    }

    socket.emit("room:join", { meetingId, userId }, (response: any) => {
      if (response.success) {
        navigate(`/meeting/${meetingId}`);
      } else {
        alert(response.error || "Failed to join the meeting.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Join a Video meeting</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        style={{ cursor: "pointer" }}
        onClick={createRoom}
      >
        Create Instant meeting
      </button>

      <input
        type="text"
        placeholder="Enter Meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
        className="p-2 border rounded w-80 mb-4"
      />
      <button
        onClick={handleJoinMeeting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        style={{ cursor: "pointer" }}
      >
        Join Meeting
      </button>
    </div>
  );
};

export default VideoCall;
