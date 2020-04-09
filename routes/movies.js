const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const { ensureAuthenticated } = require("../config/auth");

router.get("/", async (req, res) => {
  try {
    const data = await axios.get(
      "https://api.themoviedb.org/3/movie/upcoming?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    // console.log(data.data);
    res.render("/index", {
      data: JSON.stringify(data.data),
      user: req.user,
    });
  } catch (e) {
    console.log(e);
  }
});

// router.get("/search", (req, res) => {
//   res.render("movies/search");
// });

router.post("/search", async (req, res) => {
  try {
    const data = await axios.get(
      `https://api.themoviedb.org/3/search/${req.body.type}?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&query=${req.body.search}`
    );
    console.log(req.body.type);
    // data = ;
    res.render("search", {
      data: JSON.stringify(data.data),
      user: req.user,
    });
  } catch (error) {
    console.error(error);
  }

  // const url = "http://www.omdbapi.com/?apikey=6df39d0d&s=dennis";
  // axios({
  //   url: url,
  //   responseType: "json"
  // }).then(data => res.send(data));
  // const data = req.body.search;
  // res.render("search/search", { movie: data });
  // console.log(data);
});

router.get("/detail/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  // res.send("ADDING>>>>>>>");
  try {
    const detail = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US`
    );
    // console.log(detail.data);
    res.render("detail/detail", {
      detail: JSON.stringify(detail.data),
    });
  } catch (e) {
    console.log(e);
  }
});
router.get(
  "/watchlist/:id/:name/:poster",
  ensureAuthenticated,
  async (req, res) => {
    console.log("WatchList");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;

    console.log(id);
    console.log(name);
    console.log(poster);

    const list = req.user.watchList;
    const nameList = req.user.watchListName;
    const posterList = req.user.watchListPoster;

    console.log(list);
    let flag = 0;
    list.forEach((e) => {
      if (e === id) {
        flag = 1;
      }
    });
    if (flag === 0) {
      list.push(id);
      nameList.push(name);
      posterList.push(poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchList: list,
          watchListName: nameList,
          watchListPoster: posterList,
        },
        { new: true }
      );
    }
    // console.log(list);
    res.redirect(`/detail/${id}`);
  }
);
router.get(
  "/watchedlist/:id/:name/:poster",
  ensureAuthenticated,
  async (req, res) => {
    console.log("watchedlist");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;

    console.log(id);
    console.log(name);
    console.log(poster);

    const list = req.user.watchedList;
    const nameList = req.user.watchedListName;
    const posterList = req.user.watchedListPoster;

    console.log(list);
    let flag = 0;
    list.forEach((e) => {
      if (e === id) {
        flag = 1;
      }
    });
    if (flag === 0) {
      list.push(id);
      nameList.push(name);
      posterList.push(poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchedList: list,
          watchedListName: nameList,
          watchedListPoster: posterList,
        },
        { new: true }
      );
    }
    // console.log(list);
    res.redirect(`/detail/${id}`);
  }
);

module.exports = router;
