const express = require("express");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { createServer } = require("http");


const app = express();
const server = createServer(app);


app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    }),
);


// Rate limiting
const limiter = rateLimit({
    windowsMs: 15 * 60 * 1000, // 15 minutes
    max: 700,
    message: "Too many requests from this IP",
});
app.use("/api", limiter);


// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});


const PORT = process.env.PORT || 5000;

































