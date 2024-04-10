const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/userController.js");
const upload = require("../middlewares/upload.js");

//GET A USER
router.get("/:userId", getUserController);

//UPDATE A USER
router.put("/update/:userId", updateUserController);

//FOLLOW A USER
router.post("/follow/:userId", followUserController);

//UNFOLLOW A USER
router.post("/unfollow/:userId", unfollowUserController);

//BLOCK A USER
router.post("/block/:userId", blockUserController);

//UNBLOCK A USER
router.post("/unblock/:userId", unblockUserController);

//GET BLOCKED USERS
router.get("/blocked/:userId", getBlockedUsersController);

//DELETE USER
router.delete("/delete/:userId", deleteUserController);

//SEARCH USER
router.get("/search/:query", searchUserController);

//UPDATE PROFILE PICTURE
router.put(
  "/update-profile-picture/:userId",
  upload.single("profilePicture"),
  updateProfilePictureController
);
//UPDATE COVER PICTURE
// router.put();

module.exports = router;
