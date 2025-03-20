import React, { createContext, useMemo, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props: any) => {
  const socket: any = useMemo(
    () =>
      io(
        "localhost:5000"
        // "https://appmosphere-backend-task.onrender.com"
        // "https://webrtc-xxgm.onrender.com/"
      ),
    []
  );

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
