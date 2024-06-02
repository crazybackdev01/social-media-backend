const { CustomError } = require("../middlewares/error.js");
const { ApiResponse } = require("../middlewares/ApiResponse.js");
const User = require("../models/User.model.js");
const Post = require("../models/Post.model.js");
const Comment = require("../models/Comment.model.js");

const createCommentController = async (req, res, next) => {
  const { userId, postId, text } = req.body;
  try {
    let post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // We can directly assign userId and postId to the user and post array
    const comment = new Comment({
      user: userId,
      post: postId,
      text,
    });

    const newComment = await comment.save();
    if (!newComment) {
      throw new CustomError("Internal server error", 500);
    }
    post.comments.push(newComment._id);
    post = await post.save();
    return res.status(200).json(new ApiResponse({ post, newComment }));
  } catch (error) {
    next(error);
  }
};
const createCommentReplyController = async (req, res, next) => {
  const { commentId } = req.params;
  const { text, userId } = req.body;
  try {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not exists", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    comment.replies.push({
      user: userId,
      text,
    });

    comment = await comment.save();
    if (!comment) {
      throw new CustomError("Internal Server Error", 500);
    }

    return res.status(200).json(new ApiResponse(comment));
  } catch (error) {
    next(error);
  }
};
const updateCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );

    if (!updatedComment) {
      throw new CustomError("Internal Server Error", 500);
    }

    return res.status(200).json(new ApiResponse(updatedComment));
  } catch (error) {
    next(error);
  }
};
const updateReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { text, userId } = req.body;
  try {
    /*
    const comment = await Comment.find({
      _id: commentId,
      replies: {_id: replyId, user: userId}
    });
    */
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    /* in One Line
    comment.replies = comment.replies.map((reply) =>
      reply._id.toString() === replyId ? { ...reply, text } : reply
    );
    */

    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (!replyIndex === -1) {
      throw new CustomError("Reply does not exist", 404);
    }
    if (comment.replies[replyIndex].user !== userId) {
      throw new CustomError("You Can only Update Your reply", 404);
    }

    comment.replies[replyIndex].text = text;
    const updatedComment = await comment.save();
    const updatedReply = updatedComment.replies[replyIndex];
    res.status(200).json(new ApiResponse(updatedReply));
  } catch (error) {
    next(error);
  }
};

//Populate comment document function
const populatePostComments = async (comments) => {
  for (const comment of comments) {
    await comment.populate("user", "username fullName profilePicture");
    if (comment.replies.length > 0) {
      await comment.populate(
        "replies.user",
        "username profilePicture fullName"
      );
    }
  }
};
const getCommentsByPostController = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post not exists!", 404);
    }

    const comments = await Comment.find({ post: postId });

    const populatedComments = await populatePostComments(comments);
    if (!populatedComments) {
      throw new CustomError("Internal error", 500);
    }

    return res.status(200).json(new ApiResponse(populatedComments));
  } catch (error) {
    next(error);
  }
};

// QUERY AN ARRAY IN MONGODB
// https://www.mongodb.com/docs/manual/tutorial/query-arrays/#:~:text=To%20query%20if%20the%20array,value%3E%20is%20the%20element%20value.&text=To%20specify%20conditions%20on%20the,%3E%2C%20...%20%7D%20%7D
const deleteCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    /*
    const post = await Post.find({ comments: { $in: [commentId] } });
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    ); */

    // To Query an Array field for a value: here comments is an array
    const post = await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } },
      { new: true }
    );
    await post.save();
    const deletedComment = await comment.deleteOne();
    return res.status(200).json(new ApiResponse(deletedComment));
  } catch (error) {
    next(error);
  }
};

const deleteReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    comment.replies = comment.replies.filter(
      (reply) => reply._id.toString() !== replyId
    );
    /* by Map Method 
    
    comment.replies = comment.replies.map((reply, index) =>
      index !== replyIndex ? reply : undefined
    );
    
    */

    const newComment = await comment.save();
    return res.status(200).json(new ApiResponse(newComment));
  } catch (error) {
    next(error);
  }
};

const likeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not Exists!", 404);
    }

    if (comment.likes.includes(userId)) {
      return res
        .status(200)
        .json(new ApiResponse(comment, "You already liked the comment!"));
    }

    comment.likes.push(userId);
    await comment.save();
    return res.status(200).json(new ApiResponse(comment, "Liked the comment!"));
  } catch (error) {
    next(error);
  }
};

const dislikeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    if (!comment.likes.includes(userId)) {
      throw new CustomError("You have not liked this comment", 404);
    }

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();
    return res
      .status(200)
      .json(new ApiResponse(comment, "Successfully disliked the comment"));
  } catch (error) {
    next(error);
  }
};
const likeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }

    /* 
    MongooseDocumentArray.prototype.id()
    Parameters:
    id «ObjectId|String|Number|Buffer»
    Returns:
    «EmbeddedDocument,null» the subdocument or null if not found.
    Searches array items for the first document with a matching _id.

    Example:
    const embeddedDoc = m.array.id(some_id);
    */
    // Using above Method
    // const replyComment = comment.replies.id(replyId);
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIndex === -1) {
      throw new CustomError("Reply not exists!", 404);
    }

    if (comment.replies[replyIndex].likes.includes(userId)) {
      throw new CustomError("Reply already liked!", 404);
    }

    comment.replies[replyIndex].likes.push(userId);
    await comment.save();
    return res.status(200).json(new ApiResponse("You liked this reply!"));
  } catch (error) {
    next(error);
  }
};
const dislikeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment not found", 404);
    }
    const replyIndex = comment.replies.findIndex(
      (like) => like._id.toString() === replyId
    );
    if (replyIndex === -1) {
      throw new CustomError("Reply not exists!", 404);
    }

    if (!comment.replies[replyIndex].likes.includes(userId)) {
      throw new CustomError("You have not liked this reply yet!", 404);
    }

    comment.replies.likes = comment.replies.likes.filter(
      (id) => id.toString() !== userId
    );
    await comment.save();
    return res.status(200).json(new ApiResponse("You disliked this reply!"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCommentController,
  createCommentReplyController,
  updateCommentController,
  updateReplyCommentController,
  deleteCommentController,
  getCommentsByPostController,
  deleteReplyCommentController,
  likeCommentController,
  dislikeCommentController,
  likeReplyCommentController,
  dislikeReplyCommentController,
};

/*
Remove All Items That Equal a Specified Value
Create the stores collection:

db.stores.insertMany( [
   {
      _id: 1,
      fruits: [ "apples", "pears", "oranges", "grapes", "bananas" ],
      vegetables: [ "carrots", "celery", "squash", "carrots" ]
   },
   {
      _id: 2,
      fruits: [ "plums", "kiwis", "oranges", "bananas", "apples" ],
      vegetables: [ "broccoli", "zucchini", "carrots", "onions" ]
   }
] )

The following operation removes

"apples" and "oranges" from the fruits array

"carrots" from the vegetables array

db.stores.updateMany(
    { },
    { $pull: { fruits: { $in: [ "apples", "oranges" ] }, vegetables: "carrots" } }
)

*/
