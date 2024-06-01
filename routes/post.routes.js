const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.js");
const {
  createPostController,
  createPostImageController,
  updatePostController,
  getAllPostsController,
  getAllUserPostController,
  unlikePostController,
  likePostController,
  deletePostController,
} = require("../controllers/postController.js");

router.post("/create-post", createPostController);
router.post(
  "/create-post-with-image/:userId",
  upload.array("images", 5),
  createPostImageController
);
router.put("/update/:postId", updatePostController);
router.get("/feed-page/:userId", getAllPostsController);
router.get("/user/:userId", getAllUserPostController);
//DELETE POST
router.delete("/delete/:postId", deletePostController);

//LIKE POST
router.post("/like/:postId", likePostController);

//DISLIKE POST
router.post("/dislike/:postId", unlikePostController);
module.exports = router;
