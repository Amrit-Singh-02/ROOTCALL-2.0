import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "axios";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";

// ✅ Get backend URL from environment variable
const server = process.env.BACKEND_URL || "http://localhost:8000";

const Home = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const logout = async () => {
    try {
      await axios.post(`${server}/api/v1/users/logout`, {}, {
        withCredentials: true
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/auth');
    }
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/logoR.png"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            alt="Root Call Logo"
            className="navLogo"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
      <div className="meetContainer">
        <div className="leftPannel">
          <div>
            <h2 style={{ marginBottom: "25px" }}>
              Providing Quality video call{" "}
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                value={meetingCode}
                placeholder="Enter meeting code"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPannel">
          <img src="/VCimage.png" alt="vc image" />
        </div>
      </div>
    </>
  );
};

export default withAuth(Home);
