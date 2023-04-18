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
  generateAllTwoGroupCombinations(allPlayers);
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
      totalplayerLevel:
        (eachPlayer.defensa +
          eachPlayer.ataque +
          eachPlayer.tecnica +
          eachPlayer.ataque) /
        4,
      atackLevel: (eachPlayer.ataque + eachPlayer.cardio) / 2,
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
      eachPlayer.goalkeeperLevel > eachPlayer.atackLevel &&
      eachPlayer.goalkeeperLevel > eachPlayer.totalplayerLevel
    ) {
      const positionG = {
        position: "goalkeeper",
      };
      return Object.assign(eachPlayer, positionG);
    }

    if (
      eachPlayer.defenseLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.defenseLevel > eachPlayer.midfieldLevel &&
      eachPlayer.defenseLevel > eachPlayer.atackLevel &&
      eachPlayer.defenseLevel > eachPlayer.totalplayerLevel
    ) {
      const positionD = {
        position: "defense",
      };
      return Object.assign(eachPlayer, positionD);
    }

    if (
      eachPlayer.midfieldLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.midfieldLevel > eachPlayer.defenseLevel &&
      eachPlayer.midfieldLevel > eachPlayer.atackLevel &&
      eachPlayer.midfieldLevel > eachPlayer.totalplayerLevel
    ) {
      const positionM = {
        position: "midfield",
      };
      return Object.assign(eachPlayer, positionM);
    }

    if (
      eachPlayer.atackLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.atackLevel > eachPlayer.defenseLevel &&
      eachPlayer.atackLevel > eachPlayer.midfieldLevel &&
      eachPlayer.atackLevel > eachPlayer.totalplayerLevel
    ) {
      const positionA = {
        position: "forward",
      };
      return Object.assign(eachPlayer, positionA);
    }

    if (
      eachPlayer.totalplayerLevel > eachPlayer.goalkeeperLevel &&
      eachPlayer.totalplayerLevel > eachPlayer.defenseLevel &&
      eachPlayer.totalplayerLevel > eachPlayer.midfieldLevel &&
      eachPlayer.totalplayerLevel > eachPlayer.atackLevel
    ) {
      const positionT = {
        position: "totalPlayer",
      };
      return Object.assign(eachPlayer, positionT);
    }
  });
  return allPlayers;
}

function generateAllTwoGroupCombinations(allPlayers) {
  const response = combinationsGenerator(
    allPlayers,
    Math.floor(allPlayers.length / 2),
    Math.round(allPlayers.length / 2)
  );

  const divisionGroup = Math.floor(response.length / 2); //Nos devuelve el número medio que divide en 2 las combinaciones
  const combinationA = response.slice(0, divisionGroup);
  const combinationB = response.slice(divisionGroup); //Si no se indica el indice se usa la longitud como referencia para la división

  console.log(combinationA);

  console.log(combinationB);

  // const filterTwoGoalkepersInOneCombination = (obj)=>{
  //   if ("goalkeeper") {

  //   }
  // }

  // const filteredResponse = response.reduce((lastValue, actualValue, index)=>{
  //   if (lastValue[actualValue.position = ++]) {
  //     console.log(lastValue[actualValue.position]);
  //   }
  // })

  // return
}

// function orderByLevelDifference(combinations) {
//   combinations.sort((combinationA, combinationB) => {
//     const levelDifferenceA = levelDifference(combinationA);
//     const levelDifferenceB = levelDifference(combinationB);

//     if (levelDifferenceA === levelDifferenceB) return 0;
//     return levelDifferenceA < levelDifferenceB ? -1 : 1;
//   });
// }

// function levelDifference(combination) {
//   return Math.abs(level(combination[0]) - level(combination[1]));
// }

// function level(playerGroup) {
//   /*
//         Para calcular el nivel de un equipo,
//         calculamos el nivel en cada posición (portero, defensa, ataque)
//         y lo sumamos.
//         El nivel en cada posición será la suma del "poder" que aporta cada jugador en esa
//         posición.
//     */
//   const goalKeeperLevel = positionLevel("goalkeeper", playerGroup);
//   const defenseLevel = positionLevel("defense", playerGroup);
//   const midFieldLevel = positionLevel("midfield", playerGroup);
//   const attackLevel = positionLevel("attack", playerGroup);
//   return goalKeeperLevel + defenseLevel + midFieldLevel + attackLevel;
// }

// function positionLevel(position, playerGroup) {
//   /*
//         ejemplo playerGroup:
//         {
//             "goalKeeper": [player],
//             "defense": [player],
//             "midfield": [player, player]
//             "attack": [player]
//         }
//     */
//   return playerGroup[position]
//     .map((player) => playerLevel(player, position))
//     .reduce((levelPlayerA, levelPlayerB) => {
//       return levelPlayerA + levelPlayerB;
//     });
// }

// function playerLevel(player, position) {
//   switch (position) {
//     case "goalKeeper":
//       return calculateGoalKeeperLevel(player);
//     case "defense":
//       return calculateDefenseLevel(player);
//     case "midfield":
//       return calculateMidFieldLevel(player);
//     default:
//     case "attack":
//       return calculateAttackLevel(player);
//   }
// }

// function calculateGoalKeeperLevel(player) {
//   console.log(player);
//   return player.portero;
// }

// function calculateDefenseLevel(player) {
//   return player.defensa + player.cardio;
// }

// function calculateMidFieldLevel(player) {
//   return player.tecnica + player.defensa + player.ataque + player.cardio;
// }

// function calculateAttackLevel(player) {
//   return player.ataque + player.tecnica;
// }

module.exports = generatePlayerGroups;
