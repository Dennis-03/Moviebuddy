const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API);
const salt = bcrypt.genSaltSync(10);

// Load User model
const User = require("../models/users");
const { forwardAuthenticated } = require("../config/auth");

// Email Secret
const JWT_KEY = process.env.JWT_KEY;
const DOMAIN_URL = process.env.DOMAIN_URL;

// Transporter
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

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
        // errors.push({ msg: "Email already exists" });
        req.flash("success_msg", "Email Already Exists");
        res.redirect("signup");
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
              const emailToken = jwt.sign(
                {
                  email: user.email,
                  name: user.name,
                },
                JWT_KEY,
                {
                  expiresIn: "1h",
                }
              );

              const url = `${DOMAIN_URL}/user/confirmation/${emailToken}`;

              // transporter.sendMail({
              //   to: email,
              //   subject: "Confirm Email",
              //   html: `<h1 style="color:blue;">Movie buddy</h1>
              //   <p> ${name} </p>
              //   <p>To activate your Movie Buddy Account, please verify your email address.<br />
              //   Your account will not be created until your email address is confirmed.</p>
              //   <a href="${url}"><strong>Verify Mail</strong></a>`,
              // });
              const msg = {
                to: email,
                from: process.env.GMAIL_USER,
                subject: "Confirm Email",
                html: `<h1 style="color:blue;">Movie buddy</h1>
                <p> ${name} </p>
                <p>To activate your Movie Buddy Account, please verify your email address.<br />
                Your account will not be created until your email address is confirmed.</p>
                <a href="${url}"><strong>Verify Mail</strong></a>`,
              };

              sgMail.send(msg).then(
                () => {},
                (error) => {
                  console.error(error);

                  if (error.response) {
                    console.error(error.response.body);
                  }
                }
              );

              // console.log(emailToken);
              req.flash(
                "success_msg",
                "You are now registered Check Your mail for Confirmation"
              );
              res.redirect("/user/login");
            })
            .catch((err) => console.log(err));
        });
      }
    });
  }
});

// Confirmation

router.get("/confirmation/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_KEY);
    // console.log(decoded);
    await User.findOneAndUpdate(
      { email: decoded.email },
      {
        confirmed: true,
      },
      { new: true }
    );
  } catch (e) {
    console.log(e);
  }

  return res.redirect(`${DOMAIN_URL}/user/login`);
});

// Login
router.post("/login", (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email }).then((user) => {
    if (user == null) {
      req.flash("success_msg", "Email ID does not exist");
      res.redirect("login");
    }
    if (user.confirmed == false) {
      req.flash(
        "success_msg",
        "You are email is not authenticated please check your Mail"
      );
      res.redirect("login");
    } else {
      passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "login",
        failureFlash: true,
      })(req, res, next);
    }
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

// list movies

router.get("/profile", (req, res) => {
  res.render("user/profile", { user: req.user });
});

router.get("/forgot", (req, res) => {
  res.render("user/forgot");
});

router.post("/forgot", (req, res) => {
  const email = req.body.email;
  User.findOne({ email }).then((user) => {
    if (user != null) {
      const reset = jwt.sign(
        {
          email: user.email,
          name: user.name,
        },
        JWT_KEY,
        {
          expiresIn: "1d",
        }
      );
      const url = `${DOMAIN_URL}/user/reset/${reset}`;

      const msg = {
        to: email,
        from: process.env.GMAIL_USER,
        subject: "Reset Password",
        html: `<h1 style="color:blue;">Movie buddy</h1>
        <p style="tesxt-align:justify;">Someone (hopefully you) has requested a password reset for your Movie buddy account.<br />
        Follow the link below to set a new password:</p>
        <a href="${url}"><strong>Reset Password</strong></a> <br /><br />
        If you don't wish to reset your password, disregard this email and no action will be taken.`,
      };

      sgMail.send(msg).then(
        () => {},
        (error) => {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      );
    }
  });
  res.redirect("/user/login");
});

router.get("/reset/:token", (req, res) => {
  res.render("user/reset", { token: req.params.token });
});

router.post("/reset", async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const password2 = req.body.password2;
  console.log(token);

  if (password != password2) {
    req.flash("success_msg", "Passwords do not match");
    res.send("/user/reset");
  } else if (password.length < 6) {
    req.flash("success_msg", "Minimum 6 character");
    res.send("/user/reset");
  } else {
    try {
      const decoded = jwt.verify(token.trim(), JWT_KEY);
      const hash = bcrypt.hashSync(password, salt);
      await User.findOneAndUpdate(
        { email: decoded.email },
        {
          password: hash,
        },
        { new: true }
      );
    } catch (e) {
      console.log(e);
    }
    res.redirect("/user/login");
  }
});

module.exports = router;
