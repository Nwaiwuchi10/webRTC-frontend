// import { useState } from "react";

import { Route, Routes } from "react-router-dom";
import VideoCall from "./Videocall/VideoCall";
import MeetingRoom from "./Videocall/MeetingDetailsPage";

const App = () => {
  // const [meetingId, setMeetingId] = useState("1234");
  // const [userId, setUserId] = useState("user_" + Math.floor(Math.random() * 1000));

  return (
    <div>
      {/* <VideoCall /> */}
      <Routes>
        <Route path="/" element={<VideoCall />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </div>
  );
};

export default App;

// // import "./App.css";

// // import { Route, Routes } from "react-router-dom";

// // import LobbyScreen from "./components/Loby";
// // import RoomPage from "./components/RoomPage";
// import VideoChat from "./components/VideoCall";

// function App() {
//   // const meetingId = "LWWjdsXxoh"; // Replace with dynamic meeting ID
//   // const userId = "67c8de76a2b7be5ff0c2f66d";
//   return (
//     <>
//       <div>
//         <VideoChat />
//         {/* <Routes> */}
//         {/* <Route path="/" element={<VideoChat />} /> */}
//         {/* <Route path="/room/:roomId" element={<RoomPage />} /> */}
//         {/* </Routes> */}
//         {/* ki
//         <VideoCall meetingId={meetingId} userId={userId} /> */}
//       </div>
//     </>
//   );
// }

// export default App;
