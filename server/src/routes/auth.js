const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { mysql } = require("../db/connection");
const passport = require("passport");

router.post("/signup", async (req, res) => {
  try {
    if (!req.body?.email || !req.body?.password) {
      res.status(400).send("provide valid email and password");
      return;
    }

    const email = req.body.email;

    const user = await mysql.db.User.findOne(
      {
        where: {
          email,
        },
      },
      { raw: true }
    );

    if (user) {
      res.status(400).send("User already exists!");
      return;
    }

    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 15);

    await mysql.db.User.create({
      email,
      password: hashedPassword,
    });

    res.status(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/login", passport.authenticate("local"), async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.sendStatus(200);
});

module.exports = router;
