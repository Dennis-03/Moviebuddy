const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  usename: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  movieId: {
    type: Array
  },
  noOfMovie: {
    type: Number
  }
});
module.exports = mongoose.model("user", userSchema);
