// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
// import '../styles/videomeet.css';

// const server_url = process.env.REACT_APP_BACKEND_URL || 'https://rootcall-b.onrender.com';
// let connections = {};

// // const peerConfigConnections = {
// //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
// // };
// const peerConfigConnections = {
//   iceServers: [
//     // ✅ Google STUN servers
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:stun1.l.google.com:19302' },
//     { urls: 'stun:stun2.l.google.com:19302' },
//     { urls: 'stun:stun3.l.google.com:19302' },
//     { urls: 'stun:stun4.l.google.com:19302' },
    
//     // ✅ Free Stunprotocol STUN servers
//     { urls: 'stun:stun.stunprotocol.org:3478' },
    
//     // ✅ Free OpenRelay TURN servers (FREE, NO SIGNUP NEEDED)
//     {
//       urls: [
//         'turn:openrelay.metered.ca:80',
//         'turn:openrelay.metered.ca:443',
//       ],
//       username: 'openrelayproject',
//       credential: 'openrelayproject',
//     },
    
//     // ✅ Alternative free TURN (Metered)
//     {
//       urls: ['turn:relay1.internetcalls.com:443'],
//       username: 'webrtc',
//       credential: 'webrtc',
//     },
//   ],
// };

// const VideoMeet = () => {
//   const socketRef = useRef();
//   const socketIdRef = useRef();
//   const localVideoRef = useRef(null);

//   const [videoAvailable, setVideoAvailable] = useState(true);
//   const [audioAvailable, setAudioAvailable] = useState(true);
//   const [video, setVideo] = useState(false);
//   const [audio, setAudio] = useState(false);
//   const [screen, setScreen] = useState(false);
//   const [showModel, setShowModel] = useState(false);
//   const [screenAvailable, setScreenAvailable] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState('');
//   const [newMessages, setNewMessages] = useState(0);
//   const [askForUsername, setAskForUsername] = useState(true);
//   const [username, setUsername] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [participants, setParticipants] = useState([]);
//   const videoRef = useRef([]);
//   const [videos, setVideos] = useState([]);

//   const getPermissions = async () => {
//     try {
//       const videoPermission = await navigator.mediaDevices.getUserMedia({
//         video: true,
//       });
//       if (videoPermission) {
//         setVideoAvailable(true);
//       } else {
//         setVideoAvailable(false);
//       }

//       const audioPermission = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//       if (audioPermission) {
//         setAudioAvailable(true);
//       } else {
//         setAudioAvailable(false);
//       }

//       if (navigator.mediaDevices.getDisplayMedia) {
//         setScreenAvailable(true);
//       } else {
//         setScreenAvailable(false);
//       }

//       let userMediaStream;
//       if (videoAvailable || audioAvailable) {
//         userMediaStream = await navigator.mediaDevices.getUserMedia({
//           video: videoAvailable,
//           audio: audioAvailable,
//         });
//       }
//       if (userMediaStream) {
//         window.localStream = userMediaStream;
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = userMediaStream;
//         }
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     getPermissions();
//   }, []);

//   const getUserMediaSuccess = (stream) => {
//     try {
//       if (window.localStream && window.localStream.getTracks) {
//         window.localStream.getTracks().forEach((track) => track.stop());
//       }
//     } catch (e) {
//       console.log(e);
//     }
    
//     window.localStream = stream;
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = stream;
//     }

//     for (let id in connections) {
//       if (id === socketIdRef.current) continue;

//       if (connections[id]) {
//         stream.getTracks().forEach((track) => {
//           connections[id].addTrack(track, stream);
//         });
//       }

//       connections[id].createOffer().then((description) => {
//         connections[id]
//           .setLocalDescription(description)
//           .then(() => {
//             socketRef.current.emit(
//               'signal',
//               id,
//               JSON.stringify({ 
//                 sdp: connections[id].localDescription,
//                 username: username
//               })
//             );
//           })
//           .catch((e) => console.log(e));
//       });
//     }

//     if (stream && stream.getTracks) {
//       stream.getTracks().forEach(
//         (track) =>
//           (track.onended = () => {
//             setVideo(false);
//             setAudio(false);
//             try {
//               if (localVideoRef.current && localVideoRef.current.srcObject) {
//                 let tracks = localVideoRef.current.srcObject.getTracks();
//                 tracks.forEach((track) => track.stop());
//               }
//             } catch (e) {
//               console.log(e);
//             }

//             let blackSilence = (...args) =>
//               new MediaStream([black(...args), silence()]);
//             window.localStream = blackSilence();
//             if (localVideoRef.current) {
//               localVideoRef.current.srcObject = window.localStream;
//             }

//             for (let id in connections) {
//               if (connections[id]) {
//                 window.localStream.getTracks().forEach((track) => {
//                   connections[id].addTrack(track, window.localStream);
//                 });
//               }
//               connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description).then(() => {
//                   socketRef.current.emit(
//                     'signal',
//                     id,
//                     JSON.stringify({ 
//                       sdp: connections[id].localDescription,
//                       username: username
//                     })
//                   );
//                 });
//               });
//             }
//           })
//       );
//     }
//   };

//   const silence = () => {
//     let ctx = new AudioContext();
//     let oscillator = ctx.createOscillator();
//     let dst = oscillator.connect(ctx.createMediaStreamDestination());
//     oscillator.start();
//     ctx.resume();
//     return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
//   };

//   const black = ({ width = 640, height = 480 } = {}) => {
//     let canvas = Object.assign(document.createElement('canvas'), {
//       width,
//       height,
//     });
//     canvas.getContext('2d').fillRect(0, 0, width, height);
//     let stream = canvas.captureStream();
//     return Object.assign(stream.getVideoTracks()[0], { enabled: false });
//   };

//   const getUserMedia = () => {
//     if ((video && videoAvailable) || (audio && audioAvailable)) {
//       navigator.mediaDevices
//         .getUserMedia({ video: video, audio: audio })
//         .then((stream) => {
//           getUserMediaSuccess(stream);
//         })
//         .catch((e) => console.log(e));
//     } else {
//       try {
//         if (localVideoRef.current && localVideoRef.current.srcObject) {
//           let tracks = localVideoRef.current.srcObject.getTracks();
//           tracks.forEach((track) => track.stop());
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     }
//   };

//   useEffect(() => {
//     if (video !== undefined && audio !== undefined) {
//       getUserMedia();
//     }
//   }, [audio, video]);

//   const gotMessageFromServer = (fromId, message) => {
//     var signal = JSON.parse(message);

//     if (fromId !== socketIdRef.current) {
//       // Check if message contains username info
//       if (signal.username) {
//         setParticipants((prev) => {
//           const exists = prev.find((p) => p.id === fromId);
//           if (!exists) {
//             return [...prev, { id: fromId, username: signal.username }];
//           }
//           return prev;
//         });
//       }

//       if (signal.sdp) {
//         connections[fromId]
//           .setRemoteDescription(new RTCSessionDescription(signal.sdp))
//           .then(() => {
//             if (signal.sdp.type === 'offer') {
//               connections[fromId]
//                 .createAnswer()
//                 .then((description) => {
//                   connections[fromId]
//                     .setLocalDescription(description)
//                     .then(() => {
//                       socketRef.current.emit(
//                         'signal',
//                         fromId,
//                         JSON.stringify({
//                           sdp: connections[fromId].localDescription,
//                           username: username
//                         })
//                       );
//                     })
//                     .catch((e) => console.log(e));
//                 })
//                 .catch((e) => console.log(e));
//             }
//           })
//           .catch((e) => console.log(e));
//       }
//       if (signal.ice) {
//         connections[fromId]
//           .addIceCandidate(new RTCIceCandidate(signal.ice))
//           .catch((e) => console.log(e));
//       }
//     }
//   };

//   const addMessage = (data, sender, socketIdSender) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { sender: sender, data: data },
//     ]);
//     if (socketIdSender !== socketIdRef.current) {
//       setNewMessages((prevMessages) => prevMessages + 1);
//     }
//   };

//   const connectToSocketServer = () => {
//     socketRef.current = io.connect(server_url, {
//       transports: ['websocket', 'polling'],
//       secure: true
//     });

//     socketRef.current.on('signal', gotMessageFromServer);

//     socketRef.current.on('connect', () => {
//       console.log('Connected to socket server');
//       socketRef.current.emit('join-call', window.location.href);
//       socketIdRef.current = socketRef.current.id;

//       // Add self to participants
//       setParticipants((prev) => [...prev, { id: socketIdRef.current, username: username }]);

//       socketRef.current.on('chat-message', addMessage);

//       socketRef.current.on('user-left', (id) => {
//         console.log('User left:', id);
        
//         // Close and remove the connection
//         if (connections[id]) {
//           connections[id].close();
//           delete connections[id];
//         }
        
//         // Remove video from state
//         setVideos((videos) => {
//           const filtered = videos.filter((video) => video.socketId !== id);
//           videoRef.current = filtered;
//           return filtered;
//         });

//         // Remove from participants
//         setParticipants((prev) => prev.filter((p) => p.id !== id));
//       });

//       socketRef.current.on('user-joined', (id, clients) => {
//         console.log('User joined. Id:', id, 'Clients:', clients);

//         if (clients && Array.isArray(clients)) {
//           clients.forEach((socketListId) => {
//             // Skip if connection already exists
//             if (connections[socketListId]) {
//               console.log('Connection already exists for:', socketListId);
//               return;
//             }

//             console.log('Creating RTCPeerConnection for:', socketListId);
//             connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

//             connections[socketListId].onicecandidate = (event) => {
//               if (event.candidate != null) {
//                 socketRef.current.emit(
//                   'signal',
//                   socketListId,
//                   JSON.stringify({ ice: event.candidate })
//                 );
//               }
//             };

//             connections[socketListId].ontrack = (event) => {
//               console.log('Track received from:', socketListId, event.streams[0]);

//               setVideos((prevVideos) => {
//                 // Check if video already exists
//                 const videoExists = prevVideos.find(
//                   (video) => video.socketId === socketListId
//                 );

//                 if (videoExists) {
//                   // Update existing video
//                   const updatedVideos = prevVideos.map((video) =>
//                     video.socketId === socketListId
//                       ? { ...video, stream: event.streams[0] }
//                       : video
//                   );
//                   videoRef.current = updatedVideos;
//                   return updatedVideos;
//                 } else {
//                   // Add new video
//                   const newVideo = {
//                     socketId: socketListId,
//                     stream: event.streams[0],
//                     autoPlay: true,
//                     playsinline: true,
//                   };
//                   const updatedVideos = [...prevVideos, newVideo];
//                   videoRef.current = updatedVideos;
//                   return updatedVideos;
//                 }
//               });
//             };

//             if (window.localStream !== undefined && window.localStream !== null) {
//               window.localStream.getTracks().forEach((track) => {
//                 connections[socketListId].addTrack(track, window.localStream);
//               });
//             } else {
//               let blackSilence = (...args) =>
//                 new MediaStream([black(...args), silence()]);
//               window.localStream = blackSilence();
//               window.localStream.getTracks().forEach((track) => {
//                 connections[socketListId].addTrack(track, window.localStream);
//               });
//             }
//           });

//           if (id === socketIdRef.current) {
//             for (let id2 in connections) {
//               if (id2 === socketIdRef.current) continue;

//               try {
//                 if (window.localStream) {
//                   window.localStream.getTracks().forEach((track) => {
//                     connections[id2].addTrack(track, window.localStream);
//                   });
//                 }
//               } catch (err) {
//                 console.log(err);
//               }

//               connections[id2].createOffer().then((description) => {
//                 connections[id2]
//                   .setLocalDescription(description)
//                   .then(() => {
//                     socketRef.current.emit(
//                       'signal',
//                       id2,
//                       JSON.stringify({ 
//                         sdp: connections[id2].localDescription,
//                         username: username
//                       })
//                     );
//                   })
//                   .catch((e) => console.log(e));
//               });
//             }
//           }
//         } else {
//           console.warn('Clients is not a valid array:', clients);
//           if (id && !connections[id]) {
//             connections[id] = new RTCPeerConnection(peerConfigConnections);
//           }
//         }
//       });

//       socketRef.current.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//       });
//     });
//   };

//   const getMedia = () => {
//     // Don't override user's media preferences
//     // video and audio states are already set by the lobby toggles
//     connectToSocketServer();
//   };

//   const routeTo = useNavigate();

//   const connect = () => {
//     if (!username.trim()) {
//       setUsernameError('Username is required');
//       return;
//     }
//     setUsernameError('');
//     setAskForUsername(false);
//     getMedia();
//   };

//   const handleVideo = () => {
//     setVideo(!video);
//   };

//   const handleAudio = () => {
//     setAudio(!audio);
//   };

//   const getDisplayMediaSuccess = (stream) => {
//     try {
//       window.localStream.getTracks().forEach((track) => track.stop());
//     } catch (e) {
//       console.log(e);
//     }

//     window.localStream = stream;
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = stream;
//     }

//     for (let id in connections) {
//       if (id === socketIdRef.current) continue;
      
//       stream.getTracks().forEach((track) => {
//         connections[id].addTrack(track, stream);
//       });
      
//       connections[id].createOffer().then((description) => {
//         connections[id]
//           .setLocalDescription(description)
//           .then(() => {
//             socketRef.current.emit(
//               'signal',
//               id,
//               JSON.stringify({ 
//                 sdp: connections[id].localDescription,
//                 username: username
//               })
//             );
//           })
//           .catch((e) => console.log(e));
//       });
//     }
    
//     stream.getTracks().forEach(
//       (track) =>
//         (track.onended = () => {
//           setScreen(false);

//           try {
//             if (localVideoRef.current && localVideoRef.current.srcObject) {
//               let tracks = localVideoRef.current.srcObject.getTracks();
//               tracks.forEach((track) => track.stop());
//             }
//           } catch (e) {
//             console.log(e);
//           }

//           let blackSilence = (...args) =>
//             new MediaStream([black(...args), silence()]);
//           window.localStream = blackSilence();
//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = window.localStream;
//           }

//           getUserMedia();
//         })
//     );
//   };

//   const getDisplayMedia = () => {
//     if (screen) {
//       if (navigator.mediaDevices.getDisplayMedia) {
//         navigator.mediaDevices
//           .getDisplayMedia({ video: true, audio: true })
//           .then(getDisplayMediaSuccess)
//           .catch((e) => console.log(e));
//       }
//     }
//   };

//   useEffect(() => {
//     if (screen !== undefined) {
//       getDisplayMedia();
//     }
//   }, [screen]);

//   const handleScreen = () => {
//     setScreen(!screen);
//   };

//   const sendMessage = () => {
//     if (socketRef.current) {
//       socketRef.current.emit('chat-message', message, username);
//     }
//     setMessage('');
//   };

//   const handleEndCall = () => {
//     try {
//       if (localVideoRef.current && localVideoRef.current.srcObject) {
//         let tracks = localVideoRef.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     } catch (e) {}

//     // Close all peer connections
//     for (let id in connections) {
//       if (connections[id]) {
//         connections[id].close();
//       }
//     }
//     connections = {};

//     // Disconnect socket
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//     }

//     routeTo('/home');
//   };

//   const handleChatToggle = () => {
//     setShowModel(!showModel);
//     if (!showModel) {
//       setNewMessages(0);
//     }
//   };

//   return (
//     <div className="videomeet-wrapper">
//       {askForUsername === true ? (
//         <div className="videomeet-lobby">
//           <div className="lobby-glass-card">
//             <h2 className="lobby-title">Enter into Lobby</h2>
//             <div className="lobby-form">
//               <input
//                 type="text"
//                 className="lobby-input"
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => {
//                   setUsername(e.target.value);
//                   if (usernameError) setUsernameError('');
//                 }}
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter') {
//                     connect();
//                   }
//                 }}
//               />
//               {usernameError && (
//                 <p className="username-error">{usernameError}</p>
//               )}
              
//               {/* Media Controls */}
//               <div className="lobby-media-controls">
//                 <button
//                   className={`lobby-media-btn ${video ? 'active' : 'inactive'}`}
//                   onClick={() => setVideo(!video)}
//                   title={video ? 'Turn off camera' : 'Turn on camera'}
//                 >
//                   <svg
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     {video ? (
//                       <path d="M23 7l-7 5v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1l7-5"></path>
//                     ) : (
//                       <>
//                         <path d="M23 7l-7 5v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1l7-5"></path>
//                         <line x1="1" y1="1" x2="23" y2="23"></line>
//                       </>
//                     )}
//                   </svg>
//                   <span className="lobby-media-label">
//                     {video ? 'Camera On' : 'Camera Off'}
//                   </span>
//                 </button>

//                 <button
//                   className={`lobby-media-btn ${audio ? 'active' : 'inactive'}`}
//                   onClick={() => setAudio(!audio)}
//                   title={audio ? 'Mute microphone' : 'Unmute microphone'}
//                 >
//                   <svg
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     {audio ? (
//                       <>
//                         <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
//                         <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//                       </>
//                     ) : (
//                       <>
//                         <line x1="1" y1="1" x2="23" y2="23"></line>
//                         <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
//                         <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
//                       </>
//                     )}
//                   </svg>
//                   <span className="lobby-media-label">
//                     {audio ? 'Mic On' : 'Mic Off'}
//                   </span>
//                 </button>
//               </div>

//               <button className="lobby-connect-btn" onClick={connect}>
//                 Connect
//               </button>
//             </div>
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="lobby-video"
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="videomeet-container">
//           <div className={`videomeet-conference ${videos.length === 0 ? 'empty' : ''}`}>
//             {videos.length === 0 ? (
//               <div className="no-participants">
//                 <p>Waiting for others to join...</p>
//               </div>
//             ) : (
//               videos.map((video) => (
//                 <div key={video.socketId} className="videomeet-remote-video">
//                   <video
//                     data-socket={video.socketId}
//                     ref={(ref) => {
//                       if (ref && video.stream) {
//                         ref.srcObject = video.stream;
//                       }
//                     }}
//                     autoPlay
//                     playsInline
//                   />
//                 </div>
//               ))
//             )}
//           </div>

//           <div className="videomeet-local-wrapper">
//             <video
//               className="videomeet-local-video"
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//             />
//           </div>

//           <div className="videomeet-controls">
//             <button
//               className={`control-btn video-btn ${video ? 'active' : ''}`}
//               onClick={handleVideo}
//               title={video ? 'Turn off camera' : 'Turn on camera'}
//             >
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 {video ? (
//                   <path d="M23 7l-7 5v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1l7-5"></path>
//                 ) : (
//                   <>
//                     <path d="M23 7l-7 5v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1l7-5"></path>
//                     <line x1="1" y1="1" x2="23" y2="23"></line>
//                   </>
//                 )}
//               </svg>
//             </button>

//             <button
//               className="control-btn end-call-btn"
//               onClick={handleEndCall}
//               title="End call"
//             >
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
//               </svg>
//             </button>

//             <button
//               className={`control-btn audio-btn ${audio ? 'active' : ''}`}
//               onClick={handleAudio}
//               title={audio ? 'Mute microphone' : 'Unmute microphone'}
//             >
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 {audio ? (
//                   <>
//                     <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
//                     <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
//                   </>
//                 ) : (
//                   <>
//                     <line x1="1" y1="1" x2="23" y2="23"></line>
//                     <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
//                     <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
//                   </>
//                 )}
//               </svg>
//             </button>

//             {screenAvailable && (
//               <button
//                 className={`control-btn screen-btn ${screen ? 'active' : ''}`}
//                 onClick={handleScreen}
//                 title={screen ? 'Stop sharing screen' : 'Share screen'}
//               >
//                 <svg
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
//                   <line x1="8" y1="21" x2="16" y2="21"></line>
//                   <line x1="12" y1="17" x2="12" y2="21"></line>
//                 </svg>
//               </button>
//             )}

//             <button
//               className="control-btn chat-btn"
//               onClick={handleChatToggle}
//               title="Toggle chat"
//             >
//               {newMessages > 0 && <span className="chat-badge">{newMessages}</span>}
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
//               </svg>
//             </button>

//             <button
//               className="control-btn participants-btn"
//               onClick={() => setShowParticipants(!showParticipants)}
//               title="Show participants"
//             >
//               <span className="participants-count">{participants.length}</span>
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//                 <circle cx="9" cy="7" r="4"></circle>
//                 <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//                 <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//               </svg>
//             </button>
//           </div>

//           {/* Participants Sidebar */}
//           {showParticipants && (
//             <div className="videomeet-participants-overlay">
//               <div className="videomeet-participants-glass">
//                 <div className="participants-header">
//                   <h3>Participants ({participants.length})</h3>
//                   <button
//                     className="participants-close-btn"
//                     onClick={() => setShowParticipants(false)}
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 <div className="participants-list">
//                   {participants.map((participant, index) => (
//                     <div key={participant.id} className="participant-item">
//                       <div className="participant-avatar">
//                         {participant.username.charAt(0).toUpperCase()}
//                       </div>
//                       <div className="participant-info">
//                         <p className="participant-name">{participant.username}</p>
//                         {participant.id === socketIdRef.current && (
//                           <span className="participant-badge">You</span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {showModel && (
//             <div className="videomeet-chat-overlay">
//               <div className="videomeet-chat-glass">
//                 <div className="chat-header">
//                   <h3>Chat</h3>
//                   <button
//                     className="chat-close-btn"
//                     onClick={() => setShowModel(false)}
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 <div className="chat-messages">
//                   {messages.length > 0 ? (
//                     messages.map((item, index) => (
//                       <div key={index} className="chat-message">
//                         <p className="chat-sender">{item.sender}</p>
//                         <p className="chat-text">{item.data}</p>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="chat-empty">No messages yet</p>
//                   )}
//                 </div>

//                 <div className="chat-input-area">
//                   <input
//                     type="text"
//                     className="chat-input"
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     placeholder="Enter your message..."
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         sendMessage();
//                       }
//                     }}
//                   />
//                   <button className="chat-send-btn" onClick={sendMessage}>
//                     Send
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoMeet;


import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/videomeet.css';

const server_url = process.env.REACT_APP_BACKEND_URL || 'https://rootcall-backend.onrender.com';
let connections = {};

const peerConfigConnections = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Metered TURN (free, reliable)
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e46a77e9726c300d61666f65',
      credential: 'x6VUz8KdK1U5RkY1',
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e46a77e9726c300d61666f65',
      credential: 'x6VUz8KdK1U5RkY1',
    },
  ],
};

const VideoMeet = () => {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      }).catch(() => null);
      setVideoAvailable(!!videoPermission);
      if (videoPermission) videoPermission.getTracks().forEach(t => t.stop());

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      }).catch(() => null);
      setAudioAvailable(!!audioPermission);
      if (audioPermission) audioPermission.getTracks().forEach(t => t.stop());

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').fillRect(0, 0, width, height);
    return Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });
  };

  const getDummyMediaStream = () => {
    return new MediaStream([black(), silence()]);
  };

  const getMedia = async () => {
    try {
      // Stop existing tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      let stream;

      // Get real media if enabled, otherwise use dummy
      if (video || audio) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: video && videoAvailable ? { width: 1280, height: 720 } : false,
          audio: audio && audioAvailable ? true : false,
        });

        // Add dummy tracks if one is missing
        if (video && !audio) {
          stream.addTrack(silence());
        } else if (audio && !video) {
          stream.addTrack(black());
        }
      } else {
        // Use dummy stream if both are off
        stream = getDummyMediaStream();
      }

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('📹 Local stream ready:', stream.getTracks().map(t => t.kind));

      return stream;

    } catch (err) {
      console.error('❌ getMedia error:', err);
      const dummyStream = getDummyMediaStream();
      localStreamRef.current = dummyStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = dummyStream;
      }
      return dummyStream;
    }
  };

  const updateConnectionTracks = async () => {
    if (!localStreamRef.current) return;

    const stream = localStreamRef.current;
    
    Object.keys(connections).forEach((id) => {
      if (id === socketIdRef.current || !connections[id]) return;

      try {
        const pc = connections[id];
        const senders = pc.getSenders();

        // Replace or add video track
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = senders.find(s => s.track?.kind === 'video');
        
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
          console.log('✅ Replaced video track for', id);
        } else if (videoTrack && !videoSender) {
          pc.addTrack(videoTrack, stream);
          console.log('✅ Added video track for', id);
        }

        // Replace or add audio track
        const audioTrack = stream.getAudioTracks()[0];
        const audioSender = senders.find(s => s.track?.kind === 'audio');
        
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack);
          console.log('✅ Replaced audio track for', id);
        } else if (audioTrack && !audioSender) {
          pc.addTrack(audioTrack, stream);
          console.log('✅ Added audio track for', id);
        }

      } catch (err) {
        console.error('❌ Error updating tracks for', id, err);
      }
    });
  };

  useEffect(() => {
    if (!askForUsername && socketRef.current?.connected) {
      getMedia().then(() => {
        updateConnectionTracks();
      });
    }
  }, [video, audio]);

  const gotMessageFromServer = async (fromId, message) => {
    try {
      const signal = JSON.parse(message);

      // Store username if provided
      if (signal.username && fromId !== socketIdRef.current) {
        setParticipants((prev) => {
          const exists = prev.find(p => p.id === fromId);
          if (!exists) {
            return [...prev, { id: fromId, username: signal.username }];
          }
          return prev;
        });
      }

      if (fromId !== socketIdRef.current && connections[fromId]) {
        const pc = connections[fromId];

        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          console.log('✅ Set remote description from', fromId, signal.sdp.type);

          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit('signal', fromId, JSON.stringify({
              sdp: pc.localDescription,
              username: username
            }));
            console.log('✅ Sent answer to', fromId);
          }
        }

        if (signal.ice) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
          console.log('✅ Added ICE candidate from', fromId);
        }
      }
    } catch (err) {
      console.error('❌ gotMessageFromServer error:', err);
    }
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const createPeerConnection = (socketListId) => {
    try {
      const pc = new RTCPeerConnection(peerConfigConnections);
      
      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('signal', socketListId, JSON.stringify({ 
            ice: event.candidate,
            username: username
          }));
          console.log('📡 Sent ICE candidate to', socketListId);
        }
      };

      // Connection state logging
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state with', socketListId, ':', pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state with', socketListId, ':', pc.iceConnectionState);
      };

      // Track received handler
      pc.ontrack = (event) => {
        console.log('📹 Track received from', socketListId, event.track.kind);

        setVideos((prevVideos) => {
          const exists = prevVideos.find((v) => v.socketId === socketListId);

          if (exists) {
            return prevVideos.map((v) =>
              v.socketId === socketListId ? { ...v, stream: event.streams[0] } : v
            );
          } else {
            return [...prevVideos, {
              socketId: socketListId,
              stream: event.streams[0],
              autoPlay: true,
              playsinline: true,
            }];
          }
        });
      };

      // Add local tracks immediately
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
          console.log('✅ Added local track to', socketListId, track.kind);
        });
      }

      return pc;

    } catch (err) {
      console.error('❌ createPeerConnection error:', err);
      return null;
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket server');
      socketIdRef.current = socketRef.current.id;

      // Emit join with username
      socketRef.current.emit('join-call', window.location.href, username);

      // Add self as first participant
      setParticipants([{ id: socketIdRef.current, username: username }]);

      socketRef.current.on('chat-message', addMessage);

      socketRef.current.on('user-left', (id) => {
        console.log('👤 User left:', id);
        
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        setParticipants((prev) => prev.filter((p) => p.id !== id));
      });

      socketRef.current.on('user-joined', async (id, clients, joiningUsername) => {
        console.log('👥 User joined:', id, 'Username:', joiningUsername, 'Total clients:', clients?.length);

        if (!Array.isArray(clients)) {
          console.warn('Clients is not an array:', clients);
          return;
        }

        // Add joining user to participants
        if (id !== socketIdRef.current && joiningUsername) {
          setParticipants((prev) => {
            const exists = prev.find(p => p.id === id);
            if (!exists) {
              return [...prev, { id, username: joiningUsername }];
            }
            return prev;
          });
        }

        // Ensure we have local stream ready
        if (!localStreamRef.current) {
          await getMedia();
        }

        // Create connections for all clients
        for (const socketListId of clients) {
          if (socketListId === socketIdRef.current) continue;
          
          if (!connections[socketListId]) {
            console.log('🔗 Creating connection for:', socketListId);
            connections[socketListId] = createPeerConnection(socketListId);
          }
        }

        // If I'm the new joiner, create offers to everyone
        if (id === socketIdRef.current) {
          for (const socketListId of clients) {
            if (socketListId === socketIdRef.current) continue;

            try {
              const pc = connections[socketListId];
              if (pc) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                socketRef.current?.emit('signal', socketListId, JSON.stringify({ 
                  sdp: pc.localDescription,
                  username: username
                }));
                
                console.log('✅ Sent offer to', socketListId);
              }
            } catch (err) {
              console.error('❌ Error creating offer for', socketListId, err);
            }
          }
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket error:', error);
      });

      socketRef.current.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });
    });
  };

  const routeTo = useNavigate();

  const connect = async () => {
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    setUsernameError('');
    
    // Get initial media stream
    await getMedia();
    
    setAskForUsername(false);
    connectToSocketServer();
  };

  const handleVideo = () => {
    setVideo(!video);
  };

  const handleAudio = () => {
    setAudio(!audio);
  };

  const handleScreen = () => {
    setScreen(!screen);
  };

  const getDisplayMedia = async () => {
    if (!screen) return;
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: false 
      });
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      await updateConnectionTracks();

      stream.getTracks()[0].onended = async () => {
        setScreen(false);
        await getMedia();
      };
    } catch (err) {
      console.error('Screen share error:', err);
      setScreen(false);
    }
  };

  useEffect(() => {
    if (screen) {
      getDisplayMedia();
    }
  }, [screen]);

  const sendMessage = () => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('chat-message', message, username);
      setMessage('');
    }
  };

  const handleEndCall = async () => {
    console.log('🛑 Ending call...');
    
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.error('Track stop error:', e);
    }

    Object.keys(connections).forEach((id) => {
      if (connections[id]) {
        connections[id].close();
        delete connections[id];
      }
    });

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setVideos([]);
    setParticipants([]);
    setMessages([]);
    
    routeTo('/home');
  };

  const handleChatToggle = () => {
    setShowModel(!showModel);
    if (!showModel) {
      setNewMessages(0);
    }
  };

  return (
    <div className="videomeet-wrapper">
      {askForUsername ? (
        <div className="videomeet-lobby">
          <div className="lobby-glass-card">
            <h2 className="lobby-title">Enter into Lobby</h2>
            <div className="lobby-form">
              <input
                type="text"
                className="lobby-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') connect();
                }}
              />
              {usernameError && (
                <p className="username-error">{usernameError}</p>
              )}
              
              <div className="lobby-media-controls">
                <button
                  className={`lobby-media-btn ${video ? 'active' : 'inactive'}`}
                  onClick={() => setVideo(!video)}
                >
                  📹 {video ? 'Camera On' : 'Camera Off'}
                </button>
                <button
                  className={`lobby-media-btn ${audio ? 'active' : 'inactive'}`}
                  onClick={() => setAudio(!audio)}
                >
                  🎤 {audio ? 'Mic On' : 'Mic Off'}
                </button>
              </div>

              <button className="lobby-connect-btn" onClick={connect}>
                Connect
              </button>
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="lobby-video"
            />
          </div>
        </div>
      ) : (
        <div className="videomeet-container">
          <div className={`videomeet-conference ${videos.length === 0 ? 'empty' : ''}`}>
            {videos.length === 0 ? (
              <div className="no-participants">
                <p>Waiting for others to join... ({participants.length} online)</p>
              </div>
            ) : (
              videos.map((video) => (
                <div key={video.socketId} className="videomeet-remote-video">
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                        console.log('🎥 Video element attached for', video.socketId);
                      }
                    }}
                    autoPlay
                    playsInline
                  />
                </div>
              ))
            )}
          </div>

          <div className="videomeet-local-wrapper">
            <video
              className="videomeet-local-video"
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
            />
          </div>

          <div className="videomeet-controls">
            <button className={`control-btn video-btn ${video ? 'active' : ''}`} onClick={handleVideo}>
              📹
            </button>

            <button className="control-btn end-call-btn" onClick={handleEndCall}>
              ☎️
            </button>

            <button className={`control-btn audio-btn ${audio ? 'active' : ''}`} onClick={handleAudio}>
              🎤
            </button>

            {screenAvailable && (
              <button className={`control-btn screen-btn ${screen ? 'active' : ''}`} onClick={handleScreen}>
                🖥️
              </button>
            )}

            <button className="control-btn chat-btn" onClick={handleChatToggle}>
              {newMessages > 0 && <span className="chat-badge">{newMessages}</span>}
              💬
            </button>

            <button className="control-btn participants-btn" onClick={() => setShowParticipants(!showParticipants)}>
              👥 {participants.length}
            </button>
          </div>

          {showParticipants && (
            <div className="videomeet-participants-overlay">
              <div className="videomeet-participants-glass">
                <div className="participants-header">
                  <h3>Participants ({participants.length})</h3>
                  <button className="participants-close-btn" onClick={() => setShowParticipants(false)}>✕</button>
                </div>
                <div className="participants-list">
                  {participants.map((p) => (
                    <div key={p.id} className="participant-item">
                      <div className="participant-avatar">{p.username.charAt(0).toUpperCase()}</div>
                      <div className="participant-info">
                        <p className="participant-name">{p.username}</p>
                        {p.id === socketIdRef.current && <span className="participant-badge">You</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showModel && (
            <div className="videomeet-chat-overlay">
              <div className="videomeet-chat-glass">
                <div className="chat-header">
                  <h3>Chat</h3>
                  <button className="chat-close-btn" onClick={() => setShowModel(false)}>✕</button>
                </div>
                <div className="chat-messages">
                  {messages.length > 0 ? (
                    messages.map((item, i) => (
                      <div key={i} className="chat-message">
                        <p className="chat-sender">{item.sender}</p>
                        <p className="chat-text">{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p className="chat-empty">No messages yet</p>
                  )}
                </div>
                <div className="chat-input-area">
                  <input
                    type="text"
                    className="chat-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') sendMessage();
                    }}
                  />
                  <button className="chat-send-btn" onClick={sendMessage}>Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoMeet;