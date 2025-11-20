import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { ensureDefaultPlans } from "./controllers/membership.controller.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(async () => {
    await ensureDefaultPlans();
    app.listen(process.env.PORT, () => {
      console.log(`the server is running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed at index.js", err);
  });
