require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/Post");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Simple script to test the delete functionality
async function run() {
  try {
    // 1. Get all posts from the database
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts in the database`);

    // 2. Print each post's ID and content
    posts.forEach((post) => {
      console.log(`Post ID: ${post._id} (${typeof post._id})`);
      console.log(`Content: ${post.content.substring(0, 50)}...`);
      console.log("-----------------------------------");
    });

    // 3. Test if a specific endpoint works
    console.log("\nTesting routes:");

    // Create a simple Express app
    const app = express();

    // Add a simple delete route
    app.delete("/test-delete/:id", async (req, res) => {
      try {
        const postId = req.params.id;
        console.log(`Delete request received for post ID: ${postId}`);

        // Find the post first to see if it exists
        const post = await Post.findById(postId);
        if (!post) {
          console.log(`Post not found with ID: ${postId}`);
          return res.status(404).json({ message: "Post not found" });
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);
        console.log(`Post deleted successfully: ${postId}`);

        return res.json({ message: "Post deleted successfully" });
      } catch (error) {
        console.error("Error in test-delete route:", error);
        return res
          .status(500)
          .json({ message: "Server error", error: error.message });
      }
    });

    // Start a test server
    const PORT = 3001;
    const server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log(
        `To test deletion, send a DELETE request to: http://localhost:${PORT}/test-delete/POST_ID`
      );
      console.log("Replace POST_ID with one of the IDs above");
      console.log("\nPress Ctrl+C to exit");
    });
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

run();
