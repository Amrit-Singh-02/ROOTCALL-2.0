import axios, { HttpStatusCode } from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../enviroment";

export const AuthContext = createContext({});

// ✅ ADD withCredentials to axios client
const client = axios.create({
  baseURL: `${server}/api/v1/users/`,
  withCredentials: true, // ✅ CRITICAL: Send cookies with every request
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
      let request = await client.post("/login", {
        username: username,
        password: password,
      });
      
      if (request.status === HttpStatusCode.Ok) {
        // ✅ REMOVED: Don't store token in localStorage
        // Token is automatically stored in httpOnly cookie
        router("/home");
        return request.data; 
      }
    } catch (err) {
      throw err;
    }
  };

  // ✅ CHANGED: GET request, no token in body
  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity");
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  // ✅ CHANGED: No token in body
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