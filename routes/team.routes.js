const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const Player = require("../models/Player.model");
const Team = require("../models/Team.model");

// POST "/api/team/create-team"
router.post("/create-team", isAuthenticated, async (req, res, next) => {
  const { teamName, password1, password2 } = req.body;

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
      return res.status(400).json({ errorMessage: "Ya existe un equipo con ese nombre" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password1, salt);

    // Create team
    const createdTeam = await Team.create({
        teamName,
        password: hashedPassword,
    })
    return res.status(201).json(createdTeam);
    
  } catch (error) {
    next(error)
  }
});

module.exports = router;
