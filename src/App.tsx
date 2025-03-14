import { Route, Routes } from "react-router-dom";
import VideoCall from "./Videocall/VideoCall";
import MeetingRoom from "./Videocall/MeetingDetailsPage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<VideoCall />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </div>
  );
};

export default App;
