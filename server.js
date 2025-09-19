require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const connectDB = require("./db/db");
const { registerUser, loginUser } = require("./controllers/authController.js");
const { createPost } = require("./controllers/adminController.js");
const {
  getPosts,
  likedPost,
  commentPost,
  sharePost,
  getPostSummary,
} = require("./controllers/postController.js");
const jwt = require("jsonwebtoken");

// middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to database
connectDB();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Auth routes
app.post("/register", registerUser);
app.post("/login", loginUser);

// Post routes
app.get("/posts", getPosts);
app.post("/posts/:id/like", authenticateToken, likedPost);
app.post("/posts/:id/comment", authenticateToken, commentPost);
app.post("/posts/:id/share", authenticateToken, sharePost);
app.get("/posts/:id/summary", authenticateToken, getPostSummary);

// Admin routes
app.post("/admin/posts", authenticateToken, isAdmin, createPost);

// Serve Python scripts for sentiment analysis
app.use("/utils", express.static(path.join(__dirname, "utils")));

// Serve the frontend for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
