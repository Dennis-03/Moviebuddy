// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const User = require("../models/user");
// const bcrypt = require("bcrypt");
// const passport = require("passport");
// const flash = require("express-flash");
// const session = require("express-session");
// const methodOverride = require("method-override");
// // const jwt = require("jsonwebtoken");

// const initializePassport = require("./passport-config");
// initializePassport(
//   passport,
//   email => User.findOne(user => user.email === email),
//   id => User.find(user => user.id === id)
// );

// router.use(flash());
// router.use(
//   session({
//     secret: process.env.JWT_KEY,
//     resave: false,
//     saveUninitialized: false
//   })
// );
// router.use(passport.initialize());
// router.use(passport.session());
// router.use(methodOverride("_method"));

// router.get("/signup", (req, res) => {
//   res.render("signup");
// });

// router.post("/signup", (req, res) => {
//   User.find({ email: req.body.email })
//     .exec()
//     .then(user => {
//       if (user.length >= 1) {
//         return res.send(409);
//       } else {
//         bcrypt.hash(req.body.password, 10, (err, hash) => {
//           if (err) {
//             return res.send(500);
//           } else {
//             const user = new User({
//               _id: new mongoose.Types.ObjectId(),
//               email: req.body.email,
//               password: hash
//             });
//             user
//               .save()
//               .then(result => {
//                 console.log(result);
//                 res.redirect("/login");
//               })
//               .catch(err => {
//                 console.log(err);
//                 res.send(500);
//               });
//           }
//         });
//       }
//     });
// });

// router.get("/login", (req, res) => {
//   res.render("login");
// });

// // router.post("/login", (req, res, next) => {
// //   User.findOne({ email: req.body.email })
// //     .exec()
// //     .then(user => {
// //       if (user.length < 1) {
// //         return res.status(401).json({
// //           message: "Auth failed"
// //         });
// //       }
// //       bcrypt.compare(req.body.password, user.password, (err, result) => {
// //         if (err) {
// //           return res.status(401).json({
// //             message: "Auth failed"
// //           });
// //         }
// //         if (result) {
// //           const token = jwt.sign(
// //             {
// //               email: user.email,
// //               userId: user._id
// //             },
// //             process.env.JWT_KEY,
// //             {
// //               expiresIn: "7d"
// //             }
// //           );
// //           return res.json({
// //             token: token
// //           });
// //         }
// //         res.status(401).json({
// //           message: "Auth failed"
// //         });
// //       });
// //     })
// //     .catch(err => {
// //       console.log(err);
// //       res.status(500).json({
// //         error: err
// //       });
// //     });
// // });

// router.post(
//   "/login",
//   checkNotAuthenticated,
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     failureFlash: true
//   })
// );

// // function checkAuthenticated(req, res, next) {
// //   if (req.isAuthenticated()) {
// //     return next();
// //   }

// //   res.redirect("/login");
// // }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect("/");
//   }
//   next();
// }
// module.exports = router;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const axios = require("axios");

// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("user/login")
);

// signup Page
router.get("/signup", forwardAuthenticated, (req, res) =>
  res.render("user/signup")
);

// signup
router.post("/signup", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("user/signup", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("user/signup", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.hash(newUser.password, 10, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              // req.flash(
              //   "success_msg",
              //   "You are now registered and can log in"
              // );
              res.redirect("/user/login");
            })
            .catch((err) => console.log(err));
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "user/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

// list movies

router.get("/profile", async (req, res) => {
  // console.log(data);
  // res.send(data2);
  res.render("user/profile", { user: req.user });
});

module.exports = router;
