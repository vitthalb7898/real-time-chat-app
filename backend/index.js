import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import {PrismaClient} from "@prisma/client";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();

const app = express();

const Port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use("/uploads/profiles" , express.static("uploads/profiles"));
app.use("/uploads/files" , express.static("uploads/files"));


app.use(cookieParser());
app.use(express.json());




const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

connectDB();


app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);


const server = app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});

setupSocket(server);
