if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
// const bodyParser = require("body-parser");

// const methodOverride = require("method-override");

// const indexRouter = require("./routes/index");
const movieRouter = require("./routes/movies");

app.set("view engine", "ejs");
// app.use(methodOverride("_method"));
app.set("layout", "layouts/layout");
app.use(express.static("public"));
app.use(expressLayouts);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

const mongoose = require("mongoose");

const uri = process.env.DATABASE_URL;
// console.log(uri);
mongoose.connect(uri, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

// app.use("/", indexRouter);
app.use("/", movieRouter);

app.listen(process.env.PORT || 3000);
