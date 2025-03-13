// import React, { useEffect, useRef, useState } from "react";

// const iceServers: RTCIceServer[] = [
//   {
//     urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
//   },
// ];

// const PeerComponent: React.FC = () => {
//   const peerRef = useRef<RTCPeerConnection | null>(null);
//   const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
//   const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);

//   useEffect(() => {
//     peerRef.current = new RTCPeerConnection({ iceServers });
//   }, []);

//   const createOffer = async () => {
//     if (peerRef.current) {
//       const offer = await peerRef.current.createOffer();
//       await peerRef.current.setLocalDescription(offer);
//       setOffer(offer);
//     }
//   };

//   const createAnswer = async (
//     remoteOffer: RTCSessionDescriptionInit | null
//   ) => {
//     if (peerRef.current && remoteOffer) {
//       await peerRef.current.setRemoteDescription(
//         new RTCSessionDescription(remoteOffer)
//       );
//       const ans = await peerRef.current.createAnswer();
//       await peerRef.current.setLocalDescription(ans);
//       setAnswer(ans);
//     }
//   };

//   const setRemoteAnswer = async (ans: RTCSessionDescriptionInit | null) => {
//     if (peerRef.current && ans) {
//       await peerRef.current.setRemoteDescription(
//         new RTCSessionDescription(ans)
//       );
//     }
//   };

//   return (
//     <div>
//       <h2>WebRTC Peer Connection</h2>
//       <button onClick={createOffer}>Create Offer</button>
//       {offer && <pre>{JSON.stringify(offer, null, 2)}</pre>}
//       <button onClick={() => createAnswer(offer)}>Create Answer</button>
//       {answer && <pre>{JSON.stringify(answer, null, 2)}</pre>}
//       <button onClick={() => setRemoteAnswer(answer)}>Set Remote Answer</button>
//     </div>
//   );
// };

// export default PeerComponent;
// service/Peer.ts
class PeerService {
  peer: RTCPeerConnection;

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  }

  async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  async setLocalDescription(ans: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
  }
}

export default new PeerService();
