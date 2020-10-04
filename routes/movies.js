const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/users");
const { ensureAuthenticated } = require("../config/auth");
/**
 * This is Home route
 */
router.get("/", async (req, res) => {
  try {
    const now_playing = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const popular = await axios.get(
      "https://api.themoviedb.org/3/movie/popular?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const upcoming = await axios.get(
      "https://api.themoviedb.org/3/movie/upcoming?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const today = await axios.get(
      "https://api.themoviedb.org/3/tv/airing_today?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const onair = await axios.get(
      "https://api.themoviedb.org/3/tv/on_the_air?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const populartv = await axios.get(
      "https://api.themoviedb.org/3/tv/popular?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    const person = await axios.get(
      "https://api.themoviedb.org/3/person/popular?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&page=1"
    );
    res.render("index", {
      now_playing: JSON.stringify(now_playing.data),
      popular: JSON.stringify(popular.data),
      upcoming: JSON.stringify(upcoming.data),
      today: JSON.stringify(today.data),
      person: JSON.stringify(person.data),
      onair: JSON.stringify(onair.data),
      populartv: JSON.stringify(populartv.data),
      user: req.user,
    });
  } catch (e) {
    console.log(e);
  }
});

// router.get("/search", (req, res) => {
//   res.render("movies/search");
// });
/**
 * This is to search
 */
router.post("/search/", async (req, res) => {
  //   console.log(req.params.search);
  //   console.log(req.params.type);

  try {
    const data = await axios.get(
      `https://api.themoviedb.org/3/search/${req.body.type}?api_key=181ef0bca7e7dc51ef6013ce8ad75505&language=en-US&query=${req.body.search}`
    );
    console.log(req.body.type);
    // data = ;
    res.render("search", {
      data: JSON.stringify(data.data),
      type: req.body.type,
      query: req.body.search,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
  }
});
/**
 * This is will give details of the movie
 */
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
      // console.log(videos.data);

      res.render(`detail/detail${type}`, {
        detail: JSON.stringify(detail.data),
        omdb: JSON.stringify(imdbID.data),
        cast: JSON.stringify(cast.data),
        images: JSON.stringify(images.data),
        videos: JSON.stringify(videos.data),
        recommended: JSON.stringify(recom.data),
        similar: JSON.stringify(similar.data),
        user: req.user,
      });
    } else {
      const credits = await axios.get(
        `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=181ef0bca7e7dc51ef6013ce8ad75505`
      );
      console.log(credits.data);
      res.render(`detail/detail${type}`, {
        credits: JSON.stringify(credits.data),
        detail: JSON.stringify(detail.data),
        user: req.user,
      });
    }
  } catch (e) {
    console.log(e);
  }
});
router.get(
  "/watchlist/:id/:name/:poster/:type",
  ensureAuthenticated,
  async (req, res, next) => {
    console.log("WatchList");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;
    const type = req.params.type;

    console.log(id);
    console.log(name);
    console.log(poster);

    let list = req.user.watchList;
    let nameList = req.user.watchListName;
    let posterList = req.user.watchListPoster;
    let typeList = req.user.watchListType;

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
      typeList.push(type);

      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchList: list,
          watchListName: nameList,
          watchListPoster: posterList,
          watchListType: typeList,
        },
        { new: true }
      );
    } else {
      console.log(nameList);

      for (let i = 0; i < list.length; i++) {
        if (list[i] == id) {
          // await console.log(i);
          list.splice(i, 1);
          nameList.splice(i, 1);
          posterList.splice(i, 1);
          typeList.splice(i, 1);
        }
      }
      // list = list.filter((list) => list !== id);
      // nameList = nameList.filter((list) => list !== name);
      // posterList = posterList.filter((list) => list !== poster);
      // typeList = typeList.filter((list) => list !== type);

      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchList: list,
          watchListName: nameList,
          watchListPoster: posterList,
          watchListType: typeList,
        },
        { new: true }
      );
      // console.log(newList);
      req.flash("success_msg", "Removed Movie from Watch List");
    }
    // console.log(list);
    // next();
    res.redirect(`/detail/${type}/${id}`);
  }
);
/**
 * This to get user's watch list
 */
router.get(
  "/watchedlist/:id/:name/:poster/:type",
  ensureAuthenticated,
  async (req, res) => {
    console.log("watchedlist");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;
    const type = req.params.type;

    console.log(id);
    console.log(name);
    console.log(poster);

    let list = req.user.watchedList;
    let nameList = req.user.watchedListName;
    let posterList = req.user.watchedListPoster;
    let typeList = req.user.watchedListPoster;

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
      typeList.push(type);

      req.flash("success_msg", "Added Movie to Watched List");
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchedList: list,
          watchedListName: nameList,
          watchedListPoster: posterList,
          watchedListType: typeList,
        },
        { new: true }
      );
    } else {
      for (let i = 0; i < list.length; i++) {
        if (list[i] == id) {
          // await console.log(i);
          list.splice(i, 1);
          nameList.splice(i, 1);
          posterList.splice(i, 1);
          typeList.splice(i, 1);
        }
      }

      // list = list.filter((list) => list !== id);
      // nameList = nameList.filter((list) => list !== name);
      // posterList = posterList.filter((list) => list !== poster);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          watchedList: list,
          watchedListName: nameList,
          watchedListPoster: posterList,
          watchedListType: typeList,
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
  "/favlist/:id/:name/:poster/:type",
  ensureAuthenticated,
  async (req, res) => {
    console.log("fav");
    const id = req.params.id;
    const name = req.params.name;
    const poster = req.params.poster;
    const type = req.params.type;

    console.log(id);
    console.log(name);
    console.log(poster);

    let list = req.user.favList;
    let nameList = req.user.favListName;
    let posterList = req.user.favListPoster;
    let typeList = req.user.favListPoster;

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
      typeList.push(type);

      req.flash("success_msg", "Added Movie to Favourites");
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          favList: list,
          favListName: nameList,
          favListPoster: posterList,
          favListType: typeList,
        },
        { new: true }
      );
    } else {
      // list = list.filter((list) => list !== id);
      // nameList = nameList.filter((list) => list !== name);
      // posterList = posterList.filter((list) => list !== poster);

      for (let i = 0; i < list.length; i++) {
        if (list[i] == id) {
          // await console.log(i);
          list.splice(i, 1);
          nameList.splice(i, 1);
          posterList.splice(i, 1);
          typeList.splice(i, 1);
        }
      }

      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          favList: list,
          favListName: nameList,
          favListPoster: posterList,
          favListType: typeList,
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
