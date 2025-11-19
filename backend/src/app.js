import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from './routes/users.routes.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorMiddleware } from "./middleware/error.middleware.js";

// ✅ Load .env file
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cookieParser());

// ✅ Use FRONTEND_URL from .env
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));

app.use("/api/v1/users", userRoutes);

app.use(errorMiddleware)

const start = async () => {
  try {
    const connectionDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo Connected: ${mongoose.connection.host}`);

    server.listen(app.get("port"), (err) => {
      if (err) console.log(err);
      console.log(`Server running on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();