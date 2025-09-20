const Post = require("../models/Post.js");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed!"), false);
    }
  },
});

const createPost = async (req, res) => {
  try {
    console.log("=== CREATE POST REQUEST RECEIVED ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("Request body type:", typeof req.body);
    console.log("Request body keys:", Object.keys(req.body || {}));

    const { title, content, embedLink, isDraft } = req.body;

    console.log("Extracted values:");
    console.log("- title:", `"${title}"`);
    console.log("- content:", `"${content}"`);
    console.log("- embedLink:", `"${embedLink}"`);
    console.log("- isDraft:", `"${isDraft}"`);

    // More lenient validation
    if (!content || content.trim() === "") {
      // Check if we have files as alternative content
      if (!req.files || req.files.length === 0) {
        console.log("Content validation failed - no content and no files");
        return res
          .status(400)
          .json({ message: "Content is required, or please upload files" });
      } else {
        console.log("No text content but files present - allowing post");
        // Set default content for file-only posts
        req.body.content = `Shared ${req.files.length} file(s)`;
      }
    }

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} files`);
      req.files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
        attachments.push({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
        });
      });
    }

    const postData = {
      title: title || "",
      content: req.body.content || content,
      embedLink: embedLink || "",
      attachments,
      isDraft: isDraft === "true" || isDraft === true,
    };

    console.log("Creating post with final data:", postData);

    const post = await Post.create(postData);

    console.log("Post created successfully with ID:", post._id);

    const message = postData.isDraft
      ? "Post saved as draft"
      : "Post created successfully";
    res.status(201).json({ message, post });
  } catch (error) {
    console.error("=== ERROR CREATING POST ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

module.exports = { createPost, upload };
