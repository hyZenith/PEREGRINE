const Post = require("../models/Post.js");
const { analyzeSentiment } = require("../utils/sentimentAnalysis.js");
const { summarizeComments } = require("../utils/commentSummarization.js");

const getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
  if (!posts) return res.send("There is no Post");
};

const likedPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "post not found" });

  post.likes += 1;
  await post.save();
  res.json({ message: "post liked" });
};

const commentPost = async (req, res) => {
  try {
    const { username, comment } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Analyze sentiment of the comment
    let sentiment = "neutral";
    try {
      sentiment = await analyzeSentiment(comment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      // Continue with neutral sentiment if analysis fails
    }

    // Add comment with sentiment analysis
    post.comments.push({ username, comment, sentiment });
    await post.save();
    res.json({ message: "comment added", sentiment });
  } catch (error) {
    console.error("Error in commentPost:", error);
    res.status(500).json({ message: "Server error processing comment" });
  }
};

const sharePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.shares += 1;
  await post.save();
  res.json({ message: "post shared" });
};

// Get summary of comments for a post
const getPostSummary = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if post has comments
    if (!post.comments || post.comments.length === 0) {
      return res.json({ summary: "No comments to summarize." });
    }

    // Check for valid comments
    const validComments = post.comments.filter(
      (comment) =>
        comment &&
        comment.comment &&
        typeof comment.comment === "string" &&
        comment.comment.trim()
    );

    if (validComments.length === 0) {
      return res.json({ summary: "No valid comments to summarize." });
    }

    // Get summary of comments
    const summary = await summarizeComments(validComments);

    res.json({ summary });
  } catch (error) {
    console.error("Error generating comment summary:", error);
    // Return a more descriptive error message
    let errorMessage = "Failed to generate summary. Please try again later.";
    if (error.message && error.message.includes("API key")) {
      errorMessage =
        "API key error. Please check the Gemini API key configuration.";
    }
    res.status(500).json({ message: errorMessage, error: error.message });
  }
};

// Delete a post (admin only)
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Log the request details
    console.log(`Attempting to delete post with ID: ${postId}`);
    console.log("Request headers:", req.headers);
    console.log("Auth user:", req.user);

    // More lenient validation - just make sure we have an ID
    if (!postId) {
      console.log(`Missing post ID in request`);
      return res.status(400).json({
        success: false,
        message: "Missing post ID",
      });
    }

    // Check if this is a valid MongoDB ObjectId
    let isValidObjectId = /^[0-9a-fA-F]{24}$/.test(postId);
    console.log(`Is valid MongoDB ObjectId: ${isValidObjectId}`);

    // Try to find the post first to confirm it exists
    const post = await Post.findById(postId);
    if (!post) {
      console.log(`Post not found with ID: ${postId}`);

      // Try a more general query to see if we can find the post by other means
      const allPosts = await Post.find({});
      console.log(`Total posts in database: ${allPosts.length}`);
      console.log(`Available post IDs: ${allPosts.map((p) => p._id)}`);

      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Post exists, proceed with deletion
    console.log(`Found post to delete:`, post);
    const deletedPost = await Post.findByIdAndDelete(postId);

    console.log(`Successfully deleted post: ${postId}`);
    return res.json({
      success: true,
      message: "Post deleted successfully",
      postId: postId,
    });
  } catch (error) {
    console.error("Error deleting post:", error);

    // More detailed error response
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  getPosts,
  likedPost,
  commentPost,
  sharePost,
  getPostSummary,
  deletePost,
};
