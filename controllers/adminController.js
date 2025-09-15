const Post = require('../models/Post.js')

const createPost = async (req, res) => {
    const {content} = req.body;

    if (!content) return res.status(400).json({message: "content required"});

    const post  = await Post.create({content});
    res.status(201).json({message: "Post created", post});

}

module.exports = {createPost};
