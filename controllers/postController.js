const Post = require("../models/Post.js")

const getPosts = async(req, res) => {
    const posts = await Post.find().sort({createdAt: -1});
    res.json(posts);
    if (!posts) return res.send("There is no Post")
}

const likedPost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({message: "post not found"})

    post.likes += 1;
    await post.save();
    res.json({message:"post liked"})
}


const commentPost = async(req, res) => {
    const {username, comment} = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({message: "Post not found"})
    

    post.comments.push({username, comment});
    await post.save();
    res.json({message: "comment added"})
}


const sharePost = async (req,res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({message: "Post not found"})
    
    post.shares += 1;
    await post.save()
    res.json({message: "post shared"})

}

module.exports = { getPosts, likedPost, commentPost, sharePost };
