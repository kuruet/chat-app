import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

app.use(errorHandler);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;