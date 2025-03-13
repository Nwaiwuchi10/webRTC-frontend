// // import React, { createContext, useMemo, useContext } from "react";
// // import { io } from "socket.io-client";

// // const SocketContext = createContext(null);

// // export const useSocket = () => {
// //   const socket = useContext(SocketContext);
// //   return socket;
// // };

// // export const SocketProvider = (props) => {
// //   const socket = useMemo(() => io("localhost:8000"), []);

// //   return (
// //     <SocketContext.Provider value={socket}>
// //       {props.children}
// //     </SocketContext.Provider>
// //   );
// // };
// import React, { createContext, useMemo, useContext } from "react";
// import { io, Socket } from "socket.io-client";

// type SocketType = Socket | any | null;

// // Create a context with the correct type
// const SocketContext = createContext<SocketType>(null);

// export const useSocket = (): SocketType => {
//   return useContext(SocketContext);
// };

// export const SocketProvider: React.FC<React.PropsWithChildren<{}>> = ({
//   children,
// }) => {
//   const socket = useMemo(() => io("http://localhost:8000"), []);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };
import React from "react";

const SocketProvider = () => {
  return <div>SocketProvider</div>;
};

export default SocketProvider;
