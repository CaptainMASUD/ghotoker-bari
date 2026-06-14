import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import contactRoutes from "./routes/contact.route.js";
import membershipPaymentRoutes from "./routes/membershipPayment.route.js";
import matrimonyActionRoutes from "./routes/matrimonyAction.route.js";
import adminOverviewRoutes from "./routes/adminOverview.routes.js";

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
  })
);

app.options("*", cors());

app.use(express.json());

/* =====================================================
   REST ROUTES
===================================================== */

app.use("/api/admin/overview", adminOverviewRoutes);
app.use("/api/membership-payments", membershipPaymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/matrimony-actions", matrimonyActionRoutes);

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export { app };