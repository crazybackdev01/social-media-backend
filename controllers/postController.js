const Post = require("../models/Post.model.js");
const { CustomError } = require("../middlewares/error.js");
const User = require("../models/User.model.js");
const { ApiResponse } = require("../middlewares/ApiResponse.js");

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

    user.posts.push(newPost._id);
    await user.save();

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
const generateImageUrl = (filename) => {
  return `${process.env.URL}/uploads/${filename}`;
};

const createPostImageController = async (req, res, next) => {
  const { userId } = req.params;
  const { caption } = req.body;
  const files = req.files;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User cannot find!", 400);
    }

    const imageUrlArray = files.map((file) => generateImageUrl(file.filename));

    const newPost = new Post({
      user: userId,
      caption,
      image: imageUrlArray,
    });

    if (!newPost) {
      throw new CustomError("Please try again!", 500);
    }

    await newPost.save();

    user.posts.push(newPost._id);

    return res.status(200).json({
      success: true,
      message: "Image Post uploaded successfully",
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

//Update Post
const updatePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { caption } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { caption },
      { new: true }
    );

    if (!updatedPost) {
      throw new CustomError("Post not found or Updated", 400);
    }

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

//Get all posts on the Home page of the User in the feed
const getAllPostsController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const blockedUserIds = user.blockList.map((id) => id.toString());

    // Here we have to convert id to string before comparison because We have to compare values not data type
    const posts = await Post.find({ user: { $nin: blockedUserIds } }).populate(
      "user",
      "username fullname profilePicture"
    );

    return res.status(200).json({
      success: true,
      message: "Got all posts",
      posts: posts,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUserPostController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Getting All posts of specific User",
      posts: user.posts,
    });
  } catch (error) {
    next(error);
  }
};

const deletePostController = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const postToDelete = await Post.findById(postId);
    if (!postToDelete) {
      throw new CustomErrorError("Post not found", 404);
    }
    const user = await User.findById(postToDelete.user);

    if (!user) {
      throw new CustomErrorError("User not found", 404);
    }

    user.posts = user.posts.filter((post) => post.id.toString() !== postId);

    await user.save();
    await postToDelete.deleteOne();

    return res.status(200).json(new ApiResponse(postToDelete));
    // We can use deleteOne() on the document also to delete it from the collection
  } catch (error) {
    next(error);
  }
};

const likePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const postToLike = await Post.findById(postId);
    if (!postToLike) {
      throw new CustomError("Post not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (postToLike.likes.includes(userId)) {
      throw new CustomError("User already liked post", 404);
    }

    postToLike.likes.push(user._id);
    await postToLike.save();

    return res.status(200).json(new ApiResponse(postToLike));
  } catch (error) {
    next(error);
  }
};

const unlikePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post not found", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!post.likes.includes(userId)) {
      throw new CustomError("User did not Liked this post", 404);
    }

    post.likes = post.likes.filter((likes) => likes.toString() !== userId);
    const newPost = await post.save();
    if (!newPost) {
      throw new CustomError("Internal error", 500);
    }
    return res.status(200).json(new ApiResponse(newPost));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPostController,
  createPostImageController,
  updatePostController,
  deletePostController,
  getAllPostsController,
  getAllUserPostController,
  likePostController,
  unlikePostController,
};
