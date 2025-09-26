import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin:  "https://ghotoker-bari-api.vercel.app" || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Import routes
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import membershipRoutes from "./routes/membership.routes.js";


app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use("/api/memberships", membershipRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

export { app };
