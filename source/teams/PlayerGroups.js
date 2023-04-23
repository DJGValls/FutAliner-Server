const MIN_GROUP_SIZE = 5;
const POSITIONS = ["goalKeeper", "defense", "midfield", "attack"];
const combinationsGenerator = require("combinations");
const { all } = require("../../routes/user.routes");

function generatePlayerGroups(allPlayers) {
  /*
   * Generar todos las combinaciones posibles de grupos
   * Iterar por cada par de equipos [A, B]
   * Calcular nivel(A) y nivel(B)
   * Calcular la diferencia de nivel: abs(nivel(A) - nivel(B))
   * Ordenar los pares de equipos [A, B] de menor a mayor en función de la diferencia de nivel
   * Seleccionar el par de equipos [A, B] con menor diferencia de nivel
   */
  playersScoreLevel(allPlayers);
  calculatePosition(allPlayers);
  filterGoalKeepers(allPlayers);
  generateTeams(allPlayers);
  // console.log(combinations);
  // const orderedByLevelDifference = orderByLevelDifference(combinations);
  // console.log(orderedByLevelDifference);
  // return orderedByLevelDifference[0];
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

function filterGoalKeepers(allPlayers) {
  let listOfGoalKeepers = [];
  allPlayers.forEach((eachPlayer) => {
    if (eachPlayer.position === "goalkeeper") {
      listOfGoalKeepers.push(eachPlayer);
    }
  });

  if (listOfGoalKeepers.length >= 3) {
    listOfGoalKeepers = listOfGoalKeepers.sort((a, b) => {
      return (
        Number.parseInt(a.totalplayerLevel) -
        Number.parseInt(b.totalplayerLevel)
      );
    });

    const response = allPlayers.findIndex(
      (player) => player._id === listOfGoalKeepers[0]._id
    );
    allplayers = allPlayers.splice(response, 1, {
      _id: allPlayers[response]._id,
      goalkeeperLevel: allPlayers[response].goalkeeperLevel,
      defenseLevel: allPlayers[response].defenseLevel,
      midfieldLevel: allPlayers[response].midfieldLevel,
      atackLevel: allPlayers[response].atackLevel,
      totalplayerLevel:
        (allPlayers[response].defenseLevel +
          allPlayers[response].midfieldLevel +
          allPlayers[response].atackLevel) /
        3,
      position: "player",
    });
    filterGoalKeepers(allPlayers);
    return allPlayers;
  } else {
    return allPlayers;
  }
}

function generateTeams(allPlayers) {
  const teamA = [];
  const teamB = [];
  const goalkeeperList = [];
  let teamAScore = 0;
  let teamBScore = 0;

  // extrae los porteros de allplayers a goalkeeperlist
  allPlayers.forEach((eachPlayer) => {
    if (eachPlayer.position === "goalkeeper") {
      const playerIndex = allPlayers.indexOf(eachPlayer);
      goalkeeperList.push(eachPlayer);
      allPlayers.splice(playerIndex, 1);
    }
  });

  // ordenamos goalkeeperlist como ultimo elemento el mejor portero
  goalkeeperList.sort(function (a, b) {
    if (a.goalkeeperLevel > b.goalkeeperLevel) {
      return 1;
    }
    if (a.goalkeeperLevel < b.goalkeeperLevel) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  const poppedGoalkeeper = goalkeeperList.pop();
  teamA.push(poppedGoalkeeper);
  teamB.push(goalkeeperList[0]);

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
  // extrae el mejor atacante de allplayers a teamB
  const poppedAttacker = allPlayers.pop();
  teamB.push(poppedAttacker);
  const poppedAttacker2 = allPlayers.pop();
  teamA.push(poppedAttacker2);

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
        const poppedTotalplayerLevel = allPlayers.pop();
        teamB.push(poppedTotalplayerLevel);
      } else {
        return console.log(teamA, teamB, teamAScore, teamBScore);
      }
      if (allPlayers.length > 0) {
        const poppedTotalplayerLevel2 = allPlayers.pop();
        teamA.push(poppedTotalplayerLevel2);
      } else {
        return console.log(teamA, teamB, teamAScore, teamBScore);
      }
    } else {
      if (allPlayers.length > 0) {
        const poppedTotalplayerLevel2 = allPlayers.pop();
        teamA.push(poppedTotalplayerLevel2);
      } else {
        return console.log(teamA, teamB, teamAScore, teamBScore);
      }
      if (allPlayers.length > 0) {
        const poppedTotalplayerLevel = allPlayers.pop();
        teamB.push(poppedTotalplayerLevel);
      } else {
        return console.log(teamA, teamB, teamAScore, teamBScore);
      }
    }
    dividePlayers();
  }
  console.log(teamAScore);
  console.log(teamBScore);
  console.log(teamA.length);
  console.log(teamB.length);
  console.log(allPlayers.length);
}

module.exports = generatePlayerGroups;
