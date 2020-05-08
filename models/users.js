const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  tmdbid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  posterPath: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  watchList: [movieSchema],
});

module.exports = mongoose.model("user", userSchema);
module.exports = mongoose.model("movie", movieSchema);
