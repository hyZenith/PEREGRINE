const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [
    {
      username: { type: String, required: true }, // Can be any non-user
      comment: { type: String, required: true },
      sentiment: {
        type: String,
        enum: ["positive", "negative", "neutral"],
        default: "neutral",
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  shares: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
