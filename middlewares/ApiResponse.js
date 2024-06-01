class ApiResponse {
  constructor(statusCode = 200, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = { ApiResponse };

/*
  return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
*/
