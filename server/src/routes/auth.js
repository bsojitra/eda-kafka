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

    const KcAdminClient = (await import("@keycloak/keycloak-admin-client"))
      .default;

    const kcAdminClient = new KcAdminClient({
      baseUrl: "http://127.0.0.1:8080",
      realmName: "master",
    });

    await kcAdminClient.auth({
      username: "admin",
      password: "password",
      grantType: "password",
      clientId: "admin-cli",
    });

    const u = await kcAdminClient.users.create({
      email,
      enabled: true,
      realm: "dummy-realm",
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
      attributes: {
        hello: "there",
      },
    });

    console.log(u);

    // await mysql.db.User.create({
    //   email,
    //   password: hashedPassword,
    // });

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
