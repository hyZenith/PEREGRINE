require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const port = process.env.PORT || 3000;
const connectDB = require("./db/db");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');

const { registerUser, loginUser } = require("./controllers/authController.js");
const { createPost, uploads } = require("./controllers/adminController.js");


const jwt = require("jsonwebtoken");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

// middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to database
connectDB();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/posts', postRoutes);



// Admin routes
// app.post("/admin/posts",
//   authenticateToken,
//   isAdmin,
//   upload.array("files", 5),
//   createPost
// );

// Serve Python scripts for sentiment analysis
app.use("/utils", express.static(path.join(__dirname, "utils")));

// Serve the frontend for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
  console.log(
    `📁 Serving static files from: ${path.join(__dirname, "public")}`
  );
  console.log(`🌐 Open in browser: http://localhost:${port}`);
});
