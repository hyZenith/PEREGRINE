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

module.exports = {
  getPosts,
  likedPost,
  commentPost,
  sharePost,
  getPostSummary,
};
