const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/users");
const { ensureAuthenticated } = require("../config/auth");

router.get("/", async (req, res) => {
  try {
    const data = await axios.get(
      "https://api.themoviedb.org/3/movie/upcoming?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    // console.log(data.data);
    res.render("index", {
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

router.post("/search/", async (req, res) => {
  //   console.log(req.params.search);
  //   console.log(req.params.type);

  try {
    const data = await axios.get(
      `https://api.themoviedb.org/3/search/${req.body.type}?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&query=${req.body.search}`
    );
    const keyword = await axios.get(
      `https://api.themoviedb.org/3/search/keyword?api_key=181ef0bca7e7dc51ef6013ce8ad75505&query=${req.body.search}`
    );
    console.log(req.body.type);
    console.log(keyword.data.results);

    // data = ;
    res.render("search", {
      data: JSON.stringify(data.data),
      user: req.user,
      keyword: JSON.stringify(keyword.data),
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/detail/:type/:id", async (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  console.log(type);
  // res.send("ADDING>>>>>>>");
  try {
    const detail = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US`
    );
    if (type === "movie" || type === "tv") {
      let imdbID = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/external_ids?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      imdbID = imdbID.data.imdb_id;
      imdbID = await axios.get(
        `http://www.omdbapi.com/?apikey=6df39d0d&i=${imdbID}`
      );
      // console.log(imdbID.data);
      const cast = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      const images = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/images?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      const videos = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      const recom = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      const similar = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/similar?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      console.log(videos.data);

      res.render(`detail/detail${type}`, {
        detail: JSON.stringify(detail.data),
        omdb: JSON.stringify(imdbID.data),
        cast: JSON.stringify(cast.data),
        images: JSON.stringify(images.data),
        videos: JSON.stringify(videos.data),
        recommended: JSON.stringify(recom.data),
        similar: JSON.stringify(similar.data),
      });
    } else {
      res.render(`detail/detail${type}`, {
        detail: JSON.stringify(detail.data),
      });
    }
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

    let list = req.user.watchList;
    let nameList = req.user.watchListName;
    let posterList = req.user.watchListPoster;

    console.log(list);
    let flag = 0;
    list.forEach((e) => {
      if (e === id) {
        flag = 1;
      }
    });
    if (flag === 0) {
      req.flash("success_msg", "Added Movie to Watch List");
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
    } else {
      list = list.filter((list) => list !== id);
      nameList = nameList.filter((list) => list !== name);
      posterList = posterList.filter((list) => list !== poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchList: list,
          watchListName: nameList,
          watchListPoster: posterList,
        },
        { new: true }
      );
      // console.log(newList);
      req.flash("success_msg", "Removed Movie from Watch List");
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

    let list = req.user.watchedList;
    let nameList = req.user.watchedListName;
    let posterList = req.user.watchedListPoster;

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
      req.flash("success_msg", "Added Movie to Watched List");
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchedList: list,
          watchedListName: nameList,
          watchedListPoster: posterList,
        },
        { new: true }
      );
    } else {
      list = list.filter((list) => list !== id);
      nameList = nameList.filter((list) => list !== name);
      posterList = posterList.filter((list) => list !== poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchedList: list,
          watchedListName: nameList,
          watchedListPoster: posterList,
        },
        { new: true }
      );
      // console.log(newList);
      req.flash("success_msg", "Removed Movie from Watched List");
    }
    // console.log(list);
    res.redirect(`/detail/${id}`);
  }
);

router.get(
  "/favlist/:id/:name/:poster",
  ensureAuthenticated,
  async (req, res) => {
    console.log("fav");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;

    console.log(id);
    console.log(name);
    console.log(poster);

    let list = req.user.favList;
    let nameList = req.user.favListName;
    let posterList = req.user.favListPoster;

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
      req.flash("success_msg", "Added Movie to Favourites");
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          favList: list,
          favListName: nameList,
          favListPoster: posterList,
        },
        { new: true }
      );
    } else {
      list = list.filter((list) => list !== id);
      nameList = nameList.filter((list) => list !== name);
      posterList = posterList.filter((list) => list !== poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          favList: list,
          favListName: nameList,
          favListPoster: posterList,
        },
        { new: true }
      );
      // console.log(newList);
      req.flash("success_msg", "Removed Movie from Favourites");
    }
    // console.log(list);
    res.redirect(`/detail/${id}`);
  }
);

module.exports = router;
