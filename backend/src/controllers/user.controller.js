import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

      // ✅ Simple cookie settings - works for both local and production
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,              // Always true
        sameSite: "none",          // Always none for cross-origin
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

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

const getUserHistory = async (req, res) => {
  try {
    const user = req.myUser;
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;
  try {
    const user = req.myUser;
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

const logout = async (req, res) => {
  // ✅ Simple cookie clearing - same settings as login
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

export { login, register, getUserHistory, addToHistory, verifyUser, logout };