import axios, { HttpStatusCode } from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const server = process.env.REACT_APP_BACKEND_URL;

console.log("🔗 Backend Server URL:", server); // ✅ Debug log

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users/`,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });

      if (request.status === HttpStatusCode.Created) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      console.log("🔐 Attempting login to:", `${server}/api/v1/users/login`);
      
      let request = await client.post("/login", {
        username: username,
        password: password,
      });
      
      console.log("✅ Login response:", request.status);
      
      if (request.status === HttpStatusCode.Ok) {
        router("/home");
        return request.data; 
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity");
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        meeting_code: meetingCode,
      });
      return request;
    } catch (err) {
      throw err;
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin,
  };
  
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};