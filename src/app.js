const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const connectDB = require("./config/db");
const blogRoutes = require("./routes/blog.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // or 5173 if Vite
  credentials: true,
}));

app.use(express.json());

// Connect to DB
connectDB();

app.use("/api/auth", authRoutes);

app.use("/api/blogs", blogRoutes);

module.exports = app;
