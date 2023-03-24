const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");
const Player = require("../models/Player.model");

// GET "/api/player/create-player"
router.get("/create-player", isAuthenticated, async (req, res, next) => {
  const { portero, defensa, tecnica, ataque, cardio, grupo, role, user } =
    req.body;
  console.log(req.payload);
  try {
    const createdPlayer = await Player.create({
      portero,
      defensa,
      tecnica,
      ataque,
      cardio,
      grupo,
      role,
      user: req.payload._id,
    });
    // to add the id of the new player created to user arrays of players
    const updateUser = await User.findByIdAndUpdate(
      req.payload._id,
      {
        $push: { players: createdPlayer._id },
      },
      { safe: true, upsert: true, new: true }
    );
    return res.status(201).json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
