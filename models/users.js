const mongoose = require("mongoose");

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
  noOfMovie: {
    type: Number,
  },
  watchList: {
    type: Array,
    default: [],
  },
  watchListName: {
    type: Array,
    default: [],
  },
  watchListPoster: {
    type: Array,
    default: [],
  },
  watchListType: {
    type: Array,
    default: [],
  },
  watchedList: {
    type: Array,
    default: [],
  },
  watchedListName: {
    type: Array,
    default: [],
  },
  watchedListPoster: {
    type: Array,
    default: [],
  },
  favList: {
    type: Array,
    default: [],
  },
  favListName: {
    type: Array,
    default: [],
  },
  favListPoster: {
    type: Array,
    default: [],
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("user", userSchema);
