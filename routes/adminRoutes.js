const express = require('express');
const { createPost, upload} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');
const router = express.Router();

router.post('/admin/posts', authMiddleware, adminMiddleware,isAdmin, upload.array("files", 5),createPost);

module.exports = router;
