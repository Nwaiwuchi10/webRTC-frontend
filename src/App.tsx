import { Route, Routes } from "react-router-dom";

import MeetingRoom from "./Videocall/MeetingDetailsPage";
import VideoCall from "./Videocall/VideoCall";
// import LoginScreen from "./Screen/Login";

const App = () => {
  return (
    <div>
      <Routes>
        {/* <Route path="/" element={<LoginScreen />} /> */}
        <Route path="/" element={<VideoCall />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </div>
  );
};

export default App;
