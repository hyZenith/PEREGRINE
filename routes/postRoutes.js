const  authenticateToken  = require('../middlewares/authMiddleware');
const  isAdmin  = require('../middlewares/adminMiddleware');
const express = require('express');
const {
    getPosts,
    likedPost,
    commentPost,
    sharePost,
    getPostSummary,
    deletePost
} = require('../controllers/postController');

const router = express.Router();

router.get("/posts", getPosts);
router.post("/posts/:id/like", authenticateToken, likedPost);
router.post("/posts/:id/comment", authenticateToken, commentPost);
router.post("/posts/:id/share", authenticateToken, sharePost);
router.get("/posts/:id/summary", authenticateToken, getPostSummary);
router.delete("/posts/:id", authenticateToken, isAdmin, deletePost); // Admin only route for deleting posts

module.exports = router;