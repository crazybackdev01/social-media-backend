const User = require("../models/User.model.js");
const Story = require("../models/Story.model.js");
const Comment = require("../models/Comment.model.js");
const Post = require("../models/Post.model.js");
const { CustomError } = require("../middlewares/error.js");
const mongoose = require("mongoose");

const getUserController = async (req, res, next) => {
  const { userId } = req.params;
  // console.log(userId);
  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    const { password, ...data } = user._doc;
    // return res.status(200).json(data);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const updateUserController = async (req, res, next) => {
  const { userId } = req.params;
  const updatedData = req.body;
  try {
    const userToUpdate = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    Object.assign(userToUpdate, updatedData);
    await userToUpdate.save();
    // return res.status(200).json({
    //   message: "Updated User successfully",
    //   updatedUser: userToUpdate,
    // });
    res.status(200).json({
      message: "Updated User successfully",
      updatedUser: userToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

const followUserController = async (req, res, next) => {
  const { userId } = req.params;
  // console.log(userId);
  const { _id } = req.body;
  // console.log(_id);
  // console.log(userId === _id);
  try {
    if (userId === _id) {
      throw new CustomError("You cannot follow yourself", 404);
    }
    const loggedInUser = await User.findById(_id);
    // const loggedInUser = await User.findOne({ id: _id });
    const userToFollow = await User.findById(userId);
    console.log(!loggedInUser);
    // console.log(`${userToFollow}, ${loggedInUser}`);
    if (!loggedInUser || !userToFollow) {
      throw new CustomError("User not found", 404);
    }
    if (loggedInUser.following.includes(userId)) {
      throw new CustomError("User already following", 404);
    }
    loggedInUser.following.push(userId);
    userToFollow.followers.push(_id);
    await loggedInUser.save();
    await userToFollow.save();
    res
      .status(200)
      .json({ message: "Followed User successfully", userId: userId });
  } catch (error) {
    next(error);
  }
};

const unfollowUserController = async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.body;
  if (!userId) {
    throw new CustomError("Enter user to unfollow", 404);
  }
  try {
    if (userId === _id) {
      throw new CustomError("You cannot unfollow Yourself", 404);
    }
    const userToUnfollow = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToUnfollow || !loggedInUser) {
      throw new CustomError("User not found", 404);
    }
    if (!loggedInUser.following.includes(userId)) {
      throw new CustomError(
        "User to unfollow is not in your Following list",
        404
      );
    }

    //DEFINE UNFOLLOWING IMPLEMENTATION:-
    // The array of following contain only the Object ID of the documents of the Users collection in the ....
    loggedInUser.following = loggedInUser.following.filter((id) => {
      id.toString() !== userId;
    });
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => {
      id.toString() !== _id;
    });
    await loggedInUser.save();
    await userToUnfollow.save();
    res.status(200).json("Successfully unfollowed");
  } catch (error) {
    next(error);
  }
};
const blockUserController = async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.body;

  try {
    if (userId === _id) {
      throw new CustomError("You cannot block yourself", 404);
    }
    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToBlock || !loggedInUser) {
      throw new CustomError("User not found", 404);
    }
    if (loggedInUser.blockList.includes(userId)) {
      throw new CustomError("User already in block list", 404);
    }

    loggedInUser.blockList.push(userId);

    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToBlock.followers = userToBlock.followers.filter(
      (id) => id.toString() !== _id
    );

    await loggedInUser.save();
    await userToBlock.save();
    res.status(200).json({
      message: "User Blocked successfully!",
      blockedUser: userToBlock,
    });
  } catch (error) {
    next(error);
  }
};

const unblockUserController = async (req, res, next) => {
  const { userId } = req.params;
  const { _id } = req.body;

  try {
    if (userId === _id) {
      throw new CustomError("You cannot unblock yourself", 404);
    }
    const userToBlock = await User.findById(userId);
    const loggedInUser = await User.findById(_id);
    if (!userToBlock || !loggedInUser) {
      throw new CustomError("User not found", 404);
    }
    if (!loggedInUser.blockList.includes(userId)) {
      throw new CustomError("User already is unblocked", 404);
    }

    loggedInUser.blockList = loggedInUser.blockList.filter(
      (id) => id.toString() !== userId
    );
    await loggedInUser.save();
    res.status(200).json({
      message: "User unblocked successfully!",
      blockedUser: userToBlock,
    });
  } catch (error) {
    next(error);
  }
};
const getBlockedUsersController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userToNavigate = await User.findById(userId).populate(
      "blockList",
      "username fullName profilePicture"
    );
    if (!userToNavigate) {
      throw new CustomError("User not found", 404);
    }
    const { blockList, ...data } = userToNavigate;
    //const { blockList, ...data } = userToNavigate._doc;
    res.status(200).json(blockList);
  } catch (error) {
    next(error);
  }
};
const deleteUserController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      throw new CustomError("User not found", 404);
    }

    await Post.deleteMany({ user: userId });
    await Post.deleteMany({ "comments.user": userId });
    await Post.deleteMany({ "comments.replies.user": userId });

    await Comment.deleteMany({ user: userId });
    await Story.deleteMany({ user: userId });

    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
    await User.updateMany(
      { _id: { $in: userToDelete.following } },
      { $pull: { followers: userId } }
    );
    await Comment.updateMany({}, { $pull: { likes: userId } });
    await Comment.updateMany(
      { "replies.likes.user": userId },
      { $pull: { "replies.likes": userId } }
    );
    await Post.updateMany({}, { likes: userId });

    const replyComments = await Comment.find({ "replies.user": userId });
    await Promise.all(
      replyComments.map(async (comment) => {
        comment.replies = comment.replies.filter(
          (reply) => reply.user.toString() !== userId
        );
        await Comment.save();
        await comment.save();
      })
    );

    await userToDelete.deleteOne();
    res.status(200).json({
      message:
        "User deleted and also the Data associated with the user is also deleted",
    });
  } catch (error) {
    next(error);
  }
};
const searchUserController = async (req, res, next) => {
  const { query } = req.params;
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: new RegExp("query", "i") } },
        { fullName: { $regex: new RegExp("query", "i") } },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const generateFileUrl = (filename) => {
  return process.env.URL + `/uploads/${filename}`;
};

const updateProfilePictureController = async (req, res, next) => {
  const { userId } = req.params;
  const { filename } = req.file;
  // if multiple files existed then :-
  // middleware : upload.array('form-fieldname',<array-length>);
  // to access them in controller :-
  // use const filenamesArray = req.files.map(file => file.filename);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: generateFileUrl(filename) },
      { new: true }
    );
    if (!user) {
      throw new CustomError("User not found!", 404);
    }
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserController,
  updateUserController,
  followUserController,
  unfollowUserController,
  blockUserController,
  unblockUserController,
  getBlockedUsersController,
  deleteUserController,
  searchUserController,
  updateProfilePictureController,
};
