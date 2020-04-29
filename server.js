if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
// const bodyParser = require("body-parser");
require("./config/passport")(passport);

// const methodOverride = require("method-override");

const userRouter = require("./routes/user");
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
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/user", userRouter);
app.use("/", movieRouter);

app.listen(process.env.PORT || 3000);
