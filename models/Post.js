const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  content: { type: String, required: true },
  embedLink: { type: String, default: "" },
  attachments: [
    {
      filename: String,
      originalname: String,
      mimetype: String,
      size: Number,
      path: String,
    },
  ],
  isDraft: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // store user IDs
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
