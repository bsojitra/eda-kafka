const express = require("express");
const { mysql } = require("../db/connection");
const router = express.Router();
const { authApiMiddleware } = require("../middleware/auth");
const { Op } = require("sequelize");

router.get("/me", authApiMiddleware, async (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

router.get("/all", authApiMiddleware, async (req, res) => {
  const users = await mysql.db.User.findAll({
    attributes: ["id", "email"],
    where: {
      id: {
        [Op.not]: req.user.id,
      },
    },
    raw: true,
  });

  res.json(users);
});

module.exports = router;
