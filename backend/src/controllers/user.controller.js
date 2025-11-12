import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // ✅ ADD THIS IMPORT
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "please provide details" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found" });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      // ✅ CHANGED: Don't return token in response
      return res.status(httpStatus.OK).json({ 
        message: "Login successful",
        username: user.username,
        name: user.name
      });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid username or password" });
    }
  } catch (err) {
    return res.status(500).json({ message: `Something went wrong ${err}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashedpassword,
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (err) {
    res.json({ message: `Something went wrong ${err}` });
  }
};

// ✅ CHANGED: Use req.myUser from middleware
const getUserHistory = async (req, res) => {
  try {
    const user = req.myUser; // From verifyToken middleware
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

// ✅ CHANGED: Use req.myUser from middleware
const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;
  try {
    const user = req.myUser; // From verifyToken middleware
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });
    await newMeeting.save();
    res.status(httpStatus.CREATED).json({ message: "Added code to history" });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

// ✅ ADD THIS NEW FUNCTION
const verifyUser = async (req, res) => {
  try {
    return res.status(200).json({ 
      message: "Authenticated",
      user: {
        username: req.myUser.username,
        name: req.myUser.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification failed" });
  }
};

// ✅ ADD THIS NEW FUNCTION
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

// ✅ UPDATED EXPORT
export { login, register, getUserHistory, addToHistory, verifyUser, logout };