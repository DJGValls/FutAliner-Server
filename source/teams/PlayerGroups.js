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
  generateTwoGroupCombinations(allPlayers);
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
      id: allPlayers[response]._id,
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

function generateTwoGroupCombinations(allPlayers) {
  const teamA = [];
  const teamB = [];
  const goalkeeperList = [];
  // extrae los porteros de allplayers a goalkeeperlist
  allPlayers.forEach((eachPlayer) => {
    if (eachPlayer.position === "goalkeeper") {
      const playerIndex = allPlayers.indexOf(eachPlayer);
      goalkeeperList.push(eachPlayer);
      allPlayers.splice(playerIndex, 1);
    }
  });

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
  const poppedAttacker = allPlayers.pop()
  teamB.push(poppedAttacker)
  const poppedAttacker2 = allPlayers.pop()
  teamA.push(poppedAttacker2)

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
  
  const poppedGoalkeeper = goalkeeperList.pop()
  teamA.push(poppedGoalkeeper)
  teamB.push(goalkeeperList[0])
  
  console.log("Esto es el team A " + teamA);
  console.log("Esto es el team B " + teamB);

  // console.log(allPlayers);

  // Test de goalkeepers max
  // let listOfGoalKeepers = [];
  // allPlayers.forEach((eachPlayer) => {
  //   if (eachPlayer.position === "goalkeeper") {
  //     listOfGoalKeepers.push(eachPlayer);
  //   }
  // });
  // console.log(listOfGoalKeepers);

  // const response = combinationsGenerator(
  //   allPlayers,
  //   Math.floor(allPlayers.length / 2),
  //   Math.round(allPlayers.length / 2)
  //   );

  //   const divisionGroup = Math.floor(response.length / 2); //Nos devuelve el número medio que divide en 2 las combinaciones
  //   const combinationA = response.slice(0, divisionGroup);
  //   const combinationB = response.slice(divisionGroup); //Si no se indica el indice se usa la longitud como referencia para la división
  //   // console.log(combinationA[0]);

  // combinationA.forEach((eachCombinationA) => {
  //   // console.log(eachCombinationA);
  // });
}

module.exports = generatePlayerGroups;
