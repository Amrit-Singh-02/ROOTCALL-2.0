import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import io from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import { useNavigate } from "react-router-dom";
import server from "../enviroment";

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoMeet = () => {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState(false);
  let [screen, setScreen] = useState();
  let [showModel, setShowModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

 const getPermissions = async () => {
  try {
    // Request both camera and mic in a single call
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // If success, update both permissions as true
    setVideoAvailable(true);
    setAudioAvailable(true);

    // Check if screen sharing API exists
    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

    // Attach stream to local video element
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  } catch (err) {
    console.error("Permission error:", err);
    setVideoAvailable(false);
    setAudioAvailable(false);
  }
};


  // const getPermissions = async () => {
  //   try {
  //     if (
  //       window.location.protocol !== "https:" &&
  //       window.location.hostname !== "localhost"
  //     ) {
  //       alert("Camera access requires HTTPS on mobile devices");
  //       return;
  //     }

  //     const constraints = {
  //       video: {
  //         facingMode: "user",
  //         width: { min: 640, ideal: 1280, max: 1920 },
  //         height: { min: 480, ideal: 720, max: 1080 },
  //       },
  //       audio: {
  //         echoCancellation: true,
  //         noiseSuppression: true,
  //         autoGainControl: true,
  //       },
  //     };

  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //     if (stream) {
  //       setVideoAvailable(true);
  //       setAudioAvailable(true);
  //       window.localStream = stream;

  //       if (localVideoRef.current) {
  //         localVideoRef.current.srcObject = stream;
  //       }
  //     }

  //     if (navigator.mediaDevices.getDisplayMedia) {
  //       setScreenAvailable(true);
  //     } else {
  //       setScreenAvailable(false);
  //     }
  //   } catch (err) {
  //     console.error("Permission error:", err);

  //     if (err.name === "NotAllowedError") {
  //       alert(
  //         "Camera/microphone access was denied. Please allow permissions and refresh."
  //       );
  //     } else if (err.name === "NotFoundError") {
  //       alert("No camera or microphone found on this device.");
  //     } else if (err.name === "NotSupportedError" || err.name === "TypeError") {
  //       alert("Your browser does not support camera access or requires HTTPS.");
  //     } else {
  //       alert(`Error accessing camera: ${err.message}`);
  //     }

  //     setVideoAvailable(false);
  //     setAudioAvailable(false);
  //   }
  // };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream && window.localStream.getTracks) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      if (connections[id] && connections[id].addStream) {
        connections[id].addStream(window.localStream);
      }

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    if (stream && stream.getTracks) {
      stream.getTracks().forEach(
        (track) =>
          (track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
              if (localVideoRef.current && localVideoRef.current.srcObject) {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              }
            } catch (e) {
              console.log(e);
            }

            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = window.localStream;
            }

            for (let id in connections) {
              if (connections[id] && connections[id].addStream) {
                connections[id].addStream(window.localStream);
              }
              connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                });
              });
            }
          })
      );
    }
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => {
          getUserMediaSuccess(stream);
        })
        .catch((e) => console.log(e));
    } else {
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        console.log("User joined. Id:", id, "Clients:", clients);

        if (clients && Array.isArray(clients)) {
          clients.forEach((socketListId) => {
            console.log("Creating RTCPeerConnection for:", socketListId);
            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections
            );

            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            connections[socketListId].onaddstream = (event) => {
              let videoExists = videoRef.current.find(
                (video) => video.socketId === socketListId
              );
              if (videoExists) {
                setVideos((videos) => {
                  const updatedVideos = videos.map((video) =>
                    video.socketId === socketListId
                      ? { ...video, stream: event.stream }
                      : video
                  );
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoPlay: true,
                  playsinline: true,
                };
                setVideos((videos) => {
                  const updatedVideos = [...videos, newVideo];
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              }
            };

            if (
              window.localStream !== undefined &&
              window.localStream !== null
            ) {
              connections[socketListId].addStream(window.localStream);
            } else {
              let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream);
            }
          });

          if (id === socketIdRef.current) {
            for (let id2 in connections) {
              if (id2 === socketIdRef.current) continue;

              try {
                if (window.localStream) {
                  connections[id2].addStream(window.localStream);
                }
              } catch (err) {
                console.log(err);
              }

              connections[id2].createOffer().then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: connections[id2].localDescription })
                    );
                  })
                  .catch((e) => console.log(e));
              });
            }
          }
        } else {
          console.warn("Clients is not a valid array:", clients);
          if (id) {
            connections[id] = new RTCPeerConnection(peerConfigConnections);
          }
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };
  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            if (localVideoRef.current && localVideoRef.current.srcObject) {
              let tracks = localVideoRef.current.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            }
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = window.localStream;
          }

          getUserMedia();
        })
    );
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {
            {
            }
          })
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}

    routeTo("/home");
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModel ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length > 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div key={index} style={{ marginBottom: "20px" }}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <p>No messages yet</p>
                    </>
                  )}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    id="outlined-basic"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Enter your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={() => setShowModel(!showModel)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {/* <h2>Connected - Room Active</h2> */}
          <div className={styles.videoWrapper}>
            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "300px" }}
            ></video>
          </div>
          <div>
            <div className={styles.conferenceView}>
              {videos.map((video) => (
                <div key={video.socketId}>
                  {/* <h2>{video.socketId}</h2> */}
                  <video
                    data-socket={video.socketId}
                    ref={(ref) => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    style={{ width: "300px" }}
                  ></video>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMeet;
