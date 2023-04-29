const MIN_GROUP_SIZE = 5;
const POSITIONS = ["goalKeeper", "defense", "midfield", "attack"];
const combinationsGenerator = require("combinations");
const { all } = require("../../routes/user.routes");

const goalkeeperList = [];
let goalkeeperCounter = 0;
const teamA = [];
const teamB = [];
let teamAScore = 0;
let teamBScore = 0;

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
        return teamA, teamB;
      }
      if (allPlayers.length > 0) {
        teamA.push(allPlayers.pop());
      } else {
        return teamA, teamB;
      }
    } else {
      if (allPlayers.length > 0) {
        teamA.push(allPlayers.pop());
      } else {
        return teamA, teamB;
      }
      if (allPlayers.length > 0) {
        teamB.push(allPlayers.pop());
      } else {
        return teamA, teamB;
      }
    }
    dividePlayers();
  }
  console.log("team A Score " + teamAScore);
  console.log("team B Score " + teamBScore);
  console.log("team A players " + teamA.length);
  console.log("team B players " + teamB.length);
  console.log(allPlayers.length);
}

module.exports =  generatePlayerGroups  , teamA, teamB
