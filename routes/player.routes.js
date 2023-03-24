const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");
const Player = require("../models/Player.model");

// GET "/api/player/create-player"
router.get("/create-player", isAuthenticated, async (req, res, next) => {
  const { portero, defensa, tecnica, ataque, cardio, grupo, role, user } =
    req.body;
  //   console.log(req.payload);
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

// PATCH "/api/player/:playerId/votes"
router.patch("/:playerId/votes", isAuthenticated, async (req, res, next) => {
  const { portero, defensa, tecnica, ataque, cardio } = req.body;
  const { playerId } = req.params;

  // No fields are empty
  if (!portero || !defensa || !tecnica || !ataque || !cardio) {
    return res
      .status(400)
      .json({ errorMessage: "Todos los campos deben estar completos" });
  }

  try {
    const foundPlayer = await Player.findById(playerId);
    // const totalVotes = (totalPoints / 5).toFixed(2)
    //    console.log(totalVotes);
    if (foundPlayer.votes === 0) {
      await Player.findByIdAndUpdate(playerId, {
        portero,
        defensa,
        tecnica,
        ataque,
        cardio,
        votes: foundPlayer.votes + 1,
      });
    } else {
      await Player.findByIdAndUpdate(playerId, {
        portero: ((foundPlayer.portero + Number(portero)) / 2).toFixed(2),
        defensa: ((foundPlayer.defensa + Number(defensa)) / 2).toFixed(2),
        tecnica: ((foundPlayer.tecnica + Number(tecnica)) / 2).toFixed(2),
        ataque: ((foundPlayer.ataque + Number(ataque)) / 2).toFixed(2),
        cardio: ((foundPlayer.cardio + Number(cardio)) / 2).toFixed(2),
        votes: foundPlayer.votes + 1,
      });
    }
  } catch (error) {
    next(error);
  }
  try {
    const foundPlayer = await Player.findById(playerId);
    const totalPoints =
      foundPlayer.portero +
      foundPlayer.defensa +
      foundPlayer.tecnica +
      foundPlayer.ataque +
      foundPlayer.cardio;
    await Player.findByIdAndUpdate(playerId, {
      total: (totalPoints / 5).toFixed(2),
    });
    res.status(200).json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
