import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from './routes/users.routes.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// ✅ LOAD ENVIRONMENT VARIABLES
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

// ✅ cookieParser MUST come FIRST
app.use(cookieParser());

// ✅ CORS Configuration using environment variable
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));

app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    const connectionDB = await mongoose.connect(
      process.env.MONGO_URI || "mongodb+srv://diather1234_db_user:t7R20n3hfGvRQmlu@cluster0.nmsvpdr.mongodb.net/videoLogs?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log(`✅ Mongo Connected: ${mongoose.connection.host}`);

    server.listen(app.get("port"), (err) => {
      if (err) console.log(err);
      console.log(`🚀 Server running on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

start();