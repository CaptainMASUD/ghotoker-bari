import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ghotoker-bari-api.vercel.app",
];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools (no origin) and allowed web origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // only keep this if you actually send cookies/auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Explicitly respond to preflight for all routes
app.options("*", cors());

app.use(express.json());

// Routes
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import membershipRoutes from "./routes/membership.routes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/memberships", membershipRoutes);

// Error handler (kept as-is)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

export { app };
