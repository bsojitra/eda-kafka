const { Redis } = require("ioredis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const jwt = require("jsonwebtoken");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { mysql } = require("../db/connection");
const bcrypt = require("bcrypt");

const corsConfig = {
  origin: ["http://localhost:4200"],
  credentials: true,
};

const sessionMiddleware = session({
  secret: "secr3t",
  credentials: true,
  name: "sid",
  store: new RedisStore({
    client: new Redis({ port: 6380, password: "1234" }),
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

const wrap = expressMiddleware => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, cb) => {
      if (!email || !password) {
        return cb(true, false, { message: "invalid credentials" });
      }

      const user = await mysql.db.User.findOne({
        where: { email },
        raw: true,
      });

      if (!user) {
        return cb(true, false, { message: "invalid credentials" });
      }

      const isValidPass = await bcrypt.compare(password, user.password);
      if (!isValidPass) {
        return cb(true, false, { message: "invalid credentials" });
      }

      return cb(null, user);
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    const token = jwt.sign({ user }, "secr3t");
    cb(null, { token: token });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

const authSocketMiddleware = (socket, next) => {
  try {
    if (!socket.request.session?.passport?.user?.token) {
      return next(new Error("session missing"));
    }
    const token = socket.request.session.passport.user.token;
    const { user } = jwt.verify(token, "secr3t");
    socket.id = user.id;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const authApiMiddleware = (req, res, next) => {
  try {
    if (!req.user?.token) {
      return next(new Error("session missing"));
    }

    const token = req.user.token;
    const { user } = jwt.verify(token, "secr3t");

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  sessionMiddleware,
  wrap,
  corsConfig,
  authSocketMiddleware,
  authApiMiddleware,
};
