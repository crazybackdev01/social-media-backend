const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("DB connecting......");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected");
  } catch (error) {
    console.error("DB not connected", error);
  }
};

module.exports = connectDB;
