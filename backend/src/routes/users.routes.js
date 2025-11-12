import { Router } from "express";
import { 
  addToHistory, 
  getUserHistory, 
  login, 
  register,
  verifyUser,  // ✅ ADD THIS
  logout       // ✅ ADD THIS
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// ✅ REMOVED verifyToken middleware from these routes
router.route("/login").post(login);
router.route("/register").post(register);

// ✅ ADD THESE NEW ROUTES
router.route("/verify").get(verifyToken, verifyUser);
router.route("/logout").post(logout);

// ✅ CHANGED: GET instead of POST for get_all_activity
router.route("/add_to_activity").post(verifyToken, addToHistory);
router.route("/get_all_activity").get(verifyToken, getUserHistory);

export default router;