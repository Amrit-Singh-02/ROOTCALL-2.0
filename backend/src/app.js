import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from './routes/users.routes.js'
import cookieParser from 'cookie-parser';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cookieParser())
app.use(cors({
    origin: [
        'https://rootcall-frontend.onrender.com',
        'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended:true}));

app.use("/api/v1/users", userRoutes)

const start = async () => {
  const connectionDB = await mongoose.connect(
    "mongodb+srv://diather1234_db_user:t7R20n3hfGvRQmlu@cluster0.nmsvpdr.mongodb.net/videoLogs?retryWrites=true&w=majority&appName=Cluster0"
  );
  console.log(`Mongo Connected DB Host : ${mongoose.connection.host}`)

  server.listen(app.get("port"), (err) => {
    if (err) console.log(err);
    console.log("Listening on port 8000...");
  });
};
start();
