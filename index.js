const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route.js");
const userRoute = require("./routes/user.route.js");
const postRoute = require("./routes/post.routes.js");
const commentRoute = require("./routes/comment.routes.js");
const storyRoute = require("./routes/story.routes.js");
const dotenv = require("dotenv");
const { errorHandler } = require("./middlewares/error.js");
const path = require("path");

//Middlewares-stack of execution
dotenv.config();
app.use(express.json());
app.use(cookieParser());

//Routes handlers for routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/story", storyRoute);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log("Listening on port 5000");
});

//==========================================================================================================================================
/*
app.get("/", (req, res) => {
  res.send("hello world");
});

const posts = [
  {
    id: 1,
    title: "First Post",
    content: "This is the first content",
  },
  {
    id: 2,
    title: "Second Post",
    content: "This is the second content",
  },
];

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log(req.params);
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "posts not found" });
  }
  res.send(post);
});

app.post("/posts", (req, res) => {
  const title = "New Post";
  const content = "This is a new post";
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);

  res.status(201).json(newPost);
  // res.status(201).json(posts);

  //To test the 'POST' request , We use PostMan or other API testing tools.....
});

*/
