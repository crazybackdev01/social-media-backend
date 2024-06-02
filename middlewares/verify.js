const jwt = require("jsonwebtoken");

const isAuthenticate = async (req, res, next) => {
  let token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (token && decodedToken) {
    next();
  } else {
    res.status(404).json({
      success: false,
      error: {
        message: "Not Authenticated or Invalid Token",
      },
    });
  }
};

module.exports = { isAuthenticate };
