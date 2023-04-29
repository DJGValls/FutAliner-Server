const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");
const Player = require("../models/Player.model");
const Team = require("../models/Team.model");
// const generatePlayerGroups = require("../source/teams/PlayerGroups");
// const {teamA, teamB} = require("../source/teams/PlayerGroups")

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
      });
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
      return res.status(400).json({ errorMessage: "Ya estás en este grupo" });
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
    const foundTeam = await Team.findById(teamId).populate("players");
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

// POST "api/team/selected-players"
router.patch("/selected-players", isAuthenticated, async (req, res, next) => {
  // console.log(req.body.selectedPlayersList);

  try {
    const allPlayers = await Promise.all(req.body.selectedPlayersList.map(async (eachPlayer) => 
      await Player.findById(eachPlayer).exec()
    ))

    // const groups = generatePlayerGroups(allPlayers);
  
    // return res.status(201).json(groups);

    const goalkeeperList = [];
let goalkeeperCounter = 0;
const teamA = [];
const teamB = [];
let teamAScore = 0;
let teamBScore = 0;

generatePlayerGroups(allPlayers)

function generatePlayerGroups(allPlayers) {
  playersScoreLevel(allPlayers);
  calculatePosition(allPlayers);
  goalkeeperCounterFunction(allPlayers);
  filterGoalKeepers(allPlayers);
  generateTeams(allPlayers);
}

function playersScoreLevel(allPlayers) {
  allPlayers.forEach((eachPlayer) => {
    allPlayers.push({
      _id: eachPlayer._id,
      goalkeeperLevel: eachPlayer.portero,
      defenseLevel: (eachPlayer.defensa + eachPlayer.cardio) / 2,
      midfieldLevel: (eachPlayer.tecnica + eachPlayer.cardio) / 2,
      atackLevel: (eachPlayer.ataque + eachPlayer.cardio) / 2,
      totalplayerLevel:
        (eachPlayer.defensa +
          eachPlayer.ataque +
          eachPlayer.tecnica +
          eachPlayer.ataque) /
        4,
    });
  });

  allPlayers.splice(0, allPlayers.length / 2);
  return allPlayers;
}

function calculatePosition(allPlayers) {
  allPlayers.forEach((eachPlayer) => {
    if (
      eachPlayer.goalkeeperLevel > eachPlayer.defenseLevel &&
      eachPlayer.goalkeeperLevel > eachPlayer.midfieldLevel &&
      eachPlayer.goalkeeperLevel > eachPlayer.atackLevel
    ) {
      const positionG = {
        position: "goalkeeper",
      };
      eachPlayer.totalplayerLevel = eachPlayer.goalkeeperLevel;
      return Object.assign(eachPlayer, positionG);
    }

    if (
      eachPlayer.defenseLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.defenseLevel > eachPlayer.midfieldLevel &&
      eachPlayer.defenseLevel >= eachPlayer.atackLevel
    ) {
      const positionD = {
        position: "defense",
      };
      eachPlayer.totalplayerLevel = eachPlayer.defenseLevel;
      return Object.assign(eachPlayer, positionD);
    }

    if (
      eachPlayer.midfieldLevel >= eachPlayer.goalkeeperLevel &&
      eachPlayer.midfieldLevel >= eachPlayer.defenseLevel &&
      eachPlayer.midfieldLevel >= eachPlayer.atackLevel
    ) {
      const positionM = {
        position: "midfield",
      };
      eachPlayer.totalplayerLevel = eachPlayer.midfieldLevel;
      return Object.assign(eachPlayer, positionM);
    }

    if (
      eachPlayer.atackLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.atackLevel > eachPlayer.defenseLevel &&
      eachPlayer.atackLevel > eachPlayer.midfieldLevel
    ) {
      const positionA = {
        position: "forward",
      };
      eachPlayer.totalplayerLevel = eachPlayer.atackLevel;
      return Object.assign(eachPlayer, positionA);
    }
  });
}
function goalkeeperCounterFunction(allPlayers) {
  allPlayers.forEach((eachPlayer) => {
    if (eachPlayer.position === "goalkeeper") {
      goalkeeperCounter++;
    }
  });
  console.log("goalkeeperCounter " + goalkeeperCounter);
}

function filterGoalKeepers(allPlayers) {
  // const goalkeeperCounter = 0;
  // console.log(allPlayers);
  // allPlayers.forEach((eachPlayer) => {
  //   if (eachPlayer.position === "goalkeeper") {
  //     return goalkeeperCounter = goalkeeperCounter +1 ;
  //   }
  // });

  allPlayers.sort(function (a, b) {
    if (a.goalkeeperLevel > b.goalkeeperLevel) {
      return 1;
    }
    if (a.goalkeeperLevel < b.goalkeeperLevel) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  if (goalkeeperCounter > 0) {
    if (goalkeeperList.length < goalkeeperCounter) {
      goalkeeperList.push(allPlayers.pop());
      filterGoalKeepers(allPlayers);
    } else {
      // console.log(allPlayers);

      return allPlayers;
    }
  } else {
    return allPlayers;
  }
}

function generateTeams(allPlayers) {
  // ordenamos goalkeeperlist como ultimo elemento el mejor portero y los distribuimos a los equipos
  goalkeeperList.sort(function (a, b) {
    if (a.totalplayerLevel > b.totalplayerLevel) {
      return 1;
    }
    if (a.totalplayerLevel < b.totalplayerLevel) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  if (goalkeeperList.length > 1) {
    teamA.push(goalkeeperList.pop());
    teamB.push(goalkeeperList.pop());
  }
  if (goalkeeperList.length == 1) {
    teamA.push(goalkeeperList.pop());
  }
  // console.log(goalkeeperList.length);

  // ordenamos allplayers como ultimo elemento el mejor atacante
  allPlayers.sort(function (a, b) {
    if (a.atackLevel > b.atackLevel) {
      return 1;
    }
    if (a.atackLevel < b.atackLevel) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  // console.log(teamA[0].totalplayerLevel);
  // console.log(teamB[0].totalplayerLevel);

  // extrae el mejor atacante de allplayers a teamB
  if (teamA.length > 0 && teamB.length > 0) {
    if (teamA[0].totalplayerLevel > teamB[0].totalplayerLevel) {
      teamB.push(allPlayers.pop());
      teamA.push(allPlayers.pop());
    } else {
      teamA.push(allPlayers.pop());
      teamB.push(allPlayers.pop());
    }
  }

  if (teamA.length > 0 && teamB.length == 0) {
    teamB.push(allPlayers.pop());
  }

  // ordenamos allplayers como último elemento el mejor jugador totalplayerlevel
  allPlayers.sort(function (a, b) {
    if (a.totalplayerLevel > b.totalplayerLevel) {
      return 1;
    }
    if (a.totalplayerLevel < b.totalplayerLevel) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  dividePlayers();

  // extraemos el mejor totlaplayerlevel al peor de los dos equipos
  function dividePlayers() {
    // Guarda la puntuación total del equipo A
    teamA.forEach((eachPlayer) => {
      teamAScore = teamAScore + eachPlayer.totalplayerLevel;
    });

    // Guarda la puntuación total del equipo B
    teamB.forEach((eachPlayer) => {
      teamBScore = teamBScore + eachPlayer.totalplayerLevel;
    });

    if (teamAScore > teamBScore) {
      if (allPlayers.length > 0) {
        teamB.push(allPlayers.pop());
      } else {
        return
      }
      if (allPlayers.length > 0) {
        teamA.push(allPlayers.pop());
      } else {
        return
      }
    } else {
      if (allPlayers.length > 0) {
        teamA.push(allPlayers.pop());
      } else {
        return
      }
      if (allPlayers.length > 0) {
        teamB.push(allPlayers.pop());
      } else {
        return
      }
    }
    dividePlayers();
  }
  console.log("team A Score " + teamAScore);
  console.log("team B Score " + teamBScore);
  console.log("team A players " + teamA.length);
  console.log("team B players " + teamB.length);
  const teams = [teamA, teamB]
  console.log(teams);
  res.status(201).json(teams)
  

  
}

  } catch (error) {
    next(error);
  }
});

module.exports = router;
