require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = 3002;
const mongoose = require("mongoose");
const Post = require("./models/Post");
const jwt = require("jsonwebtoken");

// middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// A simpler authentication middleware for testing
const simpleAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Here we're just verifying the token format, not full JWT validation
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get a specific post
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Delete a post
app.delete("/api/posts/:id", simpleAuthMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    console.log(`Received delete request for post ID: ${postId}`);

    // First check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post with ID ${postId} not found`);
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);
    console.log(`Successfully deleted post with ID: ${postId}`);

    res.json({
      message: "Post deleted successfully",
      deletedPostId: postId,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
});

// Serve test HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test-delete.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
