const express = require("express");
const app = express();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route.js");
const userRoute = require("./routes/user.route.js");
const postRoute = require("./routes/post.routes.js");
const dotenv = require("dotenv");
const { errorHandler } = require("./middlewares/error.js");
const path = require("path");

//Middlewares-stack of execution
dotenv.config();
app.use(express.json());
app.use(cookieParser());
// app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log("Listening on port 5000");
});

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
OAuth (Open Authorization) is an open standard protocol that allows users to grant third-party applications access to their resources without sharing their credentials (such as username and password). It provides a secure and standardized way for users to authorize applications to access their data on different platforms, including social media platforms like Google, Facebook, Twitter, etc.

The OAuth process involves multiple parties: the user (resource owner), the third-party application (client), and the service provider (OAuth provider). Here is a high-level overview of the OAuth process:

1. User initiates the authorization process by clicking on a "Sign in with Google" (or any other OAuth provider) button on the client application.

2. The client application redirects the user to the OAuth provider's authorization endpoint, along with the client's credentials (client ID and client secret) and the requested scopes (permissions).

3. The user is prompted to log in to the OAuth provider (if not already logged in) and is presented with the requested scopes and the client application's name.

4. The user grants permission to the client application to access their resources by clicking on the "Allow" button.

5. The OAuth provider generates an authorization code and redirects the user back to the client application's redirect URL, along with the authorization code.

6. The client application receives the authorization code and sends a request to the OAuth provider's token endpoint, along with the authorization code, client credentials, and redirect URL.

7. The OAuth provider verifies the authorization code and client credentials and issues an access token and optionally a refresh token.

8. The client application receives the access token and can use it to make authorized API requests on behalf of the user. The access token may also contain an expiration time.

9. The client application can store the access token securely (e.g., in a server-side session or database) and use it to authenticate subsequent requests to the OAuth provider's protected resources.

10. If the access token expires, the client application can use the refresh token (if provided) to obtain a new access token without requiring user interaction.

The OAuth process ensures that the client application never sees or stores the user's credentials directly. Instead, it relies on the OAuth provider to handle the authentication and authorization process securely.

It's important to note that OAuth is a complex protocol with different versions (OAuth 1.0, OAuth 2.0) and various flows (authorization code flow, implicit flow, client credentials flow, etc.). The specific details of the OAuth process may vary depending on the version and flow being used.

Overall, OAuth provides a secure and standardized way for users to grant permissions to third-party applications without compromising their credentials, enhancing user privacy and security in the authentication and authorization process.
*/
