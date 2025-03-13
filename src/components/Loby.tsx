// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSocket } from "../socket/SocketProvider";
// // import { useSocket } from "../context/SocketProvider";

// const LobbyScreen = () => {
//   const [userId, setUserId] = useState("67c8de76a2b7be5ff0c2f66d");
//   const [meetingId, setMeetingId] = useState("lyxyraS57W");

//   const socket = useSocket();
//   const navigate = useNavigate();

//   const handleSubmitForm = useCallback(
//     (e: any) => {
//       e.preventDefault();
//       socket.emit("room:join", { userId, meetingId });
//       navigate(`/room/${meetingId}`);
//     },

//     [userId, meetingId, socket]
//   );

//   const handleJoinRoom = useCallback(
//     (data: any) => {
//       const { userId, meetingId } = data;
//       navigate(`/room/${meetingId}`);
//     },
//     [navigate]
//   );

//   useEffect(() => {
//     socket.on("room:join", handleJoinRoom);
//     return () => {
//       socket.off("room:join", handleJoinRoom);
//     };
//   }, [socket, handleJoinRoom]);

//   return (
//     <div>
//       <h1>Lobby</h1>
//       <form onSubmit={handleSubmitForm}>
//         <label htmlFor="euserId">UserId ID</label>
//         <input
//           type="text"
//           id="userId"
//           value={userId}
//           onChange={(e) => setUserId(e.target.value)}
//         />
//         <br />
//         <label htmlFor="room">Meeting Id</label>
//         <input
//           type="text"
//           id="roomId"
//           value={meetingId}
//           onChange={(e) => setMeetingId(e.target.value)}
//         />
//         <br />
//         <button type="submit">Join</button>
//       </form>
//     </div>
//   );
// };

// export default LobbyScreen;
import React from "react";

const Loby = () => {
  return <div>Loby</div>;
};

export default Loby;
