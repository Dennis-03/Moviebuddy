const express = require("express");
const router = express.Router();
const axios = require("axios");
const CircularJSON = require("circular-json");

router.get("/", async (req, res) => {
  try {
    const data = await axios.get(
      "http://www.omdbapi.com/?apikey=6df39d0d&s=avengers"
    );
    console.log(data.data);
    res.render("index", { data: CircularJSON.stringify(data.data) });
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
      `http://www.omdbapi.com/?apikey=6df39d0d&s=${req.body.search}`
    );
    console.log(req.body.search);
    // data = ;
    res.render("index", { data: CircularJSON.stringify(data.data) });
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

router.get("/detail/:imdbID", async (req, res) => {
  console.log(req.params.imdbID);
  // res.send("ADDING>>>>>>>");
  try {
    const detail = await axios.get(
      `http://www.omdbapi.com/?apikey=6df39d0d&i=${req.params.imdbID}`
    );
    // console.log(data.data);
    res.render("detail/detail", {
      detail: CircularJSON.stringify(detail.data)
    });
  } catch (e) {
    console.log(e);
  }
});
router.get("/watchlist/:imdbID", async (req, res) => {
  console.log("WatchList");
  console.log(req.params.imdbID);
});
router.get("/watched/:imdbID", async (req, res) => {
  console.log("Watched");
  console.log(req.params.imdbID);
});

module.exports = router;
