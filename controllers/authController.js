const User = require("../models/User.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error.js");

const registerController = async (req, res, next) => {
  try {
    //@Inserting data by hard coding:-
    // const newUser = new User({
    //   username: "john",
    //   email: "john@gmail.com",
    //   password: "123",
    //   fullName: "John Doe",
    //   bio: "I am student",
    // });

    // @User auth with encrypting password
    const { password, username, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      // res.status(404).json("Username or email already exists");
      throw new CustomError("User already exists", 400);
    }
    const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    // console.log("Insert Error", error);
    // res.status(500).json(error);
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    let user;
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email });
    } else {
      user = await User.findOne({ username: req.body.username });
    }
    if (!user) {
      // return res.status(404).json("User not found");
      throw new CustomError("User not found", 400);
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      // return res.status(404).json("wrong credentials");
      throw new CustomError("Wrong password", 400);
    }
    // res.status(201).json("Logged in successfully");
    //JWT token :-
    const { password, ...data } = user._doc;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    return res.cookie("token", token).status(200).json(data);
    // res.status(201).json(user);
  } catch (error) {
    // res.status(404).json("Error: " + error);
    next(error);
  }
};
const logoutController = async (req, res, next) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("user logged out");
  } catch (error) {
    // res.status(404).json("Error: " + error);
    next(error);
  }
};

const refetchUserController = async (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
    // console.log(data);
    if (err) {
      // res.status(500).json(err);
      throw new CustomError("Token not verified", 400);
    }
    try {
      const id = data._id;
      const user = await User.findOne({ _id: id });
      res.status(200).json(user);
    } catch (error) {
      // res.status(404).json("Fetching Error", error);
      next(error);
    }
  });
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  refetchUserController,
};
