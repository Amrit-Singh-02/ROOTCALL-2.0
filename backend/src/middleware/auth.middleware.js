import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // ✅ ADD THIS IMPORT

export const verifyToken = async (req, res, next) => {
  // console.log("All cookies:", req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    // ✅ FIXED: Was decodeToken.id, now decoded.userId
    let user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.myUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};