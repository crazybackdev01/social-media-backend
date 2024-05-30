const Post = require("../models/Post.model.js");
const { CustomError } = require("../middlewares/error.js");
const User = require("../models/User.model.js");

//Create Post with only caption
const createPostController = async (req, res, next) => {
  const { userId, caption } = req.params;
  if (!userId || !caption) {
    throw new CustomError("Provide caption or userId not detected", 400);
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 400);
    }
    const newPost = new Post({
      user: userId,
      caption,
    });

    if (!newPost) {
      throw new CustomError("Please try again!", 500);
    }

    await newPost.save();
    user.posts.push(newPost);

    return res.status(200).json({
      success: true,
      message: "Post uploaded successfully",
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

//Create post with images and caption
