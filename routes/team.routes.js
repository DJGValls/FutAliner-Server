const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");
const Player = require("../models/Player.model");
const Team = require("../models/Team.model");

// POST "/api/team/create-team"
router.post("/create-team", isAuthenticated, async (req, res, next) => {
  const {
    teamName,
    password1,
    password2,
    portero,
    defensa,
    tecnica,
    ataque,
    cardio,
    team,
    total,
    role,
    user,
  } = req.body;

  // No fields are empty
  if (!teamName || !password1 || !password2) {
    return res
      .status(400)
      .json({ errorMessage: "Todos los campos deben estar completos" });
  }

  // Passwords match
  if (password1 !== password2) {
    return res
      .status(400)
      .json({ errorMessage: "El password ha de ser igual" });
  }

  // Password is secure
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$/;
  if (passwordRegex.test(password1) === false) {
    return res.status(400).json({
      errorMessage:
        "El password debe tener al menos 6 caracteres, incluir una mayuscula y un caracter especial",
    });
  }

  try {
    // team does not exist in DB
    const foundTeam = await Team.findOne({ teamName: teamName });
    if (foundTeam) {
      return res
        .status(400)
        .json({ errorMessage: "Ya existe un equipo con ese nombre" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password1, salt);

    // Create team
    await Team.create({
      teamName,
      password: hashedPassword,
    });
    // to create player with capitan role
    const createdPlayer = await Player.create({
      portero,
      defensa,
      tecnica,
      ataque,
      cardio,
      team,
      role: "capitan",
      user: req.payload._id,
      total,
    });
    // to add the id of the new player created to user arrays of players
    await User.findByIdAndUpdate(
      req.payload._id,
      {
        $push: { players: createdPlayer._id },
      },
      { safe: true, upsert: true, new: true }
    );
  } catch (error) {
    next(error);
  }
  try {
    const foundTeam = await Team.findOne({ teamName: teamName });
    const foundPlayer = await Player.findOne({ team: null });
    await Player.findByIdAndUpdate(foundPlayer._id, {
      team: foundTeam._id,
    });
    await Team.findByIdAndUpdate(
      foundTeam._id,
      {
        $push: { players: foundPlayer._id },
      },
      { safe: true, upsert: true, new: true }
    );
    return res.status(201).json();
  } catch (error) {
    next(error);
  }
});

// POST "/api/team/join-team"
router.post("/join-team", isAuthenticated, async (req, res, next) => {
  const {
    teamName,
    password,
    portero,
    defensa,
    tecnica,
    ataque,
    cardio,
    team,
    role,
    user,
    total,
  } = req.body;

  // No fields are empty
  if (!teamName || !password) {
    return res
      .status(400)
      .json({ errorMessage: "Todos los campos deben estar completos" });
  }

  try {
    const foundTeam = await Team.findOne({ teamName: teamName }).populate({
      path: "players",
      populate: "user",
    });
    let playerIsPresent = false;

    // team exist in DB
    if (!foundTeam) {
      return res.status(400).json({ errorMessage: "El equipo no existe" });
    }

    // Password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundTeam.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ errorMessage: "El password de acceso es incorrecto" });
    }

    //  Player is present in the team
    foundTeam.players.forEach((eachPlayer) => {
      // console.log(eachPlayer.user._id);
      if (eachPlayer.user._id == req.payload._id) {
        return (playerIsPresent = true);
      } else {
        return (playerIsPresent = false);
      }
    });

    // console.log(playerIsPresent);
    if (!playerIsPresent) {
      //   // create player
      const createdPlayer = await Player.create({
        portero,
        defensa,
        tecnica,
        ataque,
        cardio,
        team,
        role,
        user: req.payload._id,
        total,
      }) 
      // to add the id of the new player created to user arrays of players
      await User.findByIdAndUpdate(
        req.payload._id,
        {
          $push: { players: createdPlayer._id },
        },
        { safe: true, upsert: true, new: true }
      );

      await Team.findByIdAndUpdate(
        foundTeam._id,
        {
          $push: { players: createdPlayer._id },
        },
        { safe: true, upsert: true, new: true }
      );

      try {
        const foundPlayer = await Player.findOne({ team: null });
        await Player.findByIdAndUpdate(foundPlayer._id, {
          team: foundTeam._id,
        });

        return res.status(201).json();
      } catch (error) {
        next(error);
      }

      return res.status(201).json();
    } else {
      return res
      .status(400)
      .json({ errorMessage: "Ya estás en este grupo" });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH "/api/team/:teamId/edit-team"
router.patch("/:teamId/edit-team", isAuthenticated, async (req, res, next) => {
  const { teamName, password, image } = req.body;
  const { teamId } = req.params;
  try {
    const updateTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        teamName,
        password,
        image,
      },
      { new: true }
    );
    res.status(200).json(updateTeam);
  } catch (error) {
    next(error);
  }
});

// GET "/api/team/:teamId/team"
router.get("/:teamId/team", isAuthenticated, async (req, res, next) => {
  const { teamId } = req.params;
  try {
    const foundTeam = await Team.findById(teamId).populate('players');
    res.status(200).json(foundTeam);
  } catch (error) {
    next(error);
  }
});

// DELETE "/api/team/:playerId/delete"
router.delete("/:playerId/delete", isAuthenticated, async (req, res, next) => {
  const { playerId } = req.params;
  try {
    const foundPlayer = await Player.findById(playerId);
    if (foundPlayer.role === "jugador") {
      return res
        .status(400)
        .json({ errorMessage: "Solo un Capitan puede borrar el equipo" });
    } else {
      const foundTeam = await Team.findById(foundPlayer.team);
      const foundUser = await Team.findById(req.payload._id);
      await User.findByIdAndUpdate(
        req.payload._id,
        {
          $pull: { players: { $in: [playerId] } },
        },
        { safe: true, upsert: true, new: true }
      );
      foundTeam.players.forEach(async (eachPlayer) => {
        await Player.findByIdAndDelete(eachPlayer);
      });
      await Team.findByIdAndDelete(foundTeam._id);

      res.status(200).json();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
