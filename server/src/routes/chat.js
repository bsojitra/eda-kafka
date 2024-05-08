const express = require("express");
const { mysql } = require("../db/connection");
const router = express.Router();
const { authApiMiddleware } = require("../middleware/auth");
const { Op } = require("sequelize");
const uuid = require("uuid");

router.post("/new", authApiMiddleware, async (req, res) => {
  // TODO: return old chats data i guess

  res.json({});
});

module.exports = router;
