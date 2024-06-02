const { CustomError } = require("../middlewares/error.js");
const { ApiResponse } = require("../middlewares/ApiResponse.js");
const Story = require("../models/Story.model.js");
const User = require("../models/User.model.js");

const createStoryController = async (req, res, next) => {};
const getStoriesController = async (req, res, next) => {};
const getUserStoriesController = async (req, res, next) => {};
const deleteStoryController = async (req, res, next) => {};
const deleteStoriesController = async (req, res, next) => {};

module.exports = {
  createStoryController,
  getStoriesController,
  getUserStoriesController,
  deleteStoryController,
  deleteStoriesController,
};
