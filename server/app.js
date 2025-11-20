// app.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatSocket from "./sockets/chat.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ghotoker-bari.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    // ⬇️ omit methods & allowedHeaders to use defaults
    // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight for all routes (also using defaults)
app.options("*", cors());

app.use(express.json());

// REST routes
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/memberships", membershipRoutes);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

/* ----------------------- HTTP server + Socket.IO ----------------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    // Socket.IO only needs GET/POST; you can omit this and use the default
    // methods: ["GET", "POST"],
  },
});

chatSocket(io);
app.set("io", io);

export { app, server, io };
