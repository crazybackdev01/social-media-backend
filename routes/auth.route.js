const express = require("express");
const router = express.Router(); // a function
const {
  registerController,
  loginController,
  logoutController,
  refetchUserController,
} = require("../controllers/authController.js");

//REGISTER route
router.post("/register", registerController);

//LOGIN route
router.post("/login", loginController);

//LOGOUT route
router.post("/logout", logoutController);

//FETCH current User
router.get("/refetch", refetchUserController);

module.exports = router;
