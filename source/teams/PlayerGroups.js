const MIN_GROUP_SIZE = 5;
const POSITIONS = ["goalKeeper", "defense", "midfield", "attack"];
const combinationsGenerator = require("combinations") 

function generatePlayerGroups(allPlayers) {
    /*
        * Generar todos las combinaciones posibles de grupos
        * Iterar por cada par de equipos [A, B]
           * Calcular nivel(A) y nivel(B)
           * Calcular la diferencia de nivel: abs(nivel(A) - nivel(B))
           * Ordenar los pares de equipos [A, B] de menor a mayor en función de la diferencia de nivel 
           * Seleccionar el par de equipos [A, B] con menor diferencia de nivel    
    */
   let combinations = generateAllTwoGroupCombinations(allPlayers);
   combinations = filterOutInvalidCombinations(combinations);
   const orderedByLevelDifference = orderByLevelDifference(combinations);
   return orderedByLevelDifference[0];
}

function generateAllTwoGroupCombinations(allPlayers) {
    const response = combinationsGenerator(allPlayers, 5)
    console.log(response);
    return response
    // const fn = function(active, rest, a) {
        
    //     if (active.length === 0 && rest.length === 0)
    //         return;
    //     if (rest.length === 0) {
    //         a.push(active);
    //     } else {
    //         const activeCopy = [...active];
    //         active.push(rest[0]);
    //         fn(active, rest.slice(1), a);
    //         fn(activeCopy, rest.slice(1), a);
    //     }
    //     return a;
    // }
    // return fn([], allPlayers, []);

}


function filterOutInvalidCombinations(combinations) {
    return combinations.filter(combination => groupSize(combination[0]) >= MIN_GROUP_SIZE 
        && groupSize(combination[1]) >= MIN_GROUP_SIZE);
}

function groupSize(playersGroup) {
    return POSITIONS.forEach(position => playersGroup[position].length)
    .reduce((sizeA, sizeB) => sizeA + sizeB);
}

function orderByLevelDifference(combinations) {
    combinations.sort((combinationA, combinationB) => {
        const levelDifferenceA = levelDifference(combinationA);
        const levelDifferenceB = levelDifference(combinationB);
        if (levelDifferenceA === levelDifferenceB) return 0;
        return levelDifferenceA < levelDifferenceB ? -1 : 1;
    });
}

function levelDifference(combination) {
    return abs(level(combination[0]) - level(combination[1]));
}

function level(playerGroup) {
    /*
        Para calcular el nivel de un equipo,
        calculamos el nivel en cada posición (portero, defensa, ataque)
        y lo sumamos.
        El nivel en cada posición será la suma del "poder" que aporta cada jugador en esa
        posición.
    */
   const goalKeeperLevel = positionLevel("goalkeeper", playerGroup);
   const defenseLevel = positionLevel("defense", playerGroup);
   const midFieldLevel = positionLevel("midfield", playerGroup);
   const attackLevel = positionLevel("attack", playerGroup);
   return goalKeeperLevel + defenseLevel + attackLevel;
}

function positionLevel(position, playerGroup) {
    /*
        ejemplo playerGroup:
        {
            "goalKeeper": [player],
            "defense": [player],
            "midfield": [player, player]
            "attack": [player]
        }
    */
    return playerGroup[position].map(player => playerLevel(player, position)).reduce((levelPlayerA, levelPlayerB) => {
        return levelPlayerA + levelPlayerB;
    });
}

function playerLevel(player, position) {
    switch(position) {
        case "goalKeeper":
            return calculateGoalKeeperLevel(player);
        case "defense":
            return calculateDefenseLevel(player);
        case "midfield":
            return calculateMidFieldLevel(player);            
        default:
            case "attack":
                return calculateAttackLevel(player);
    }
}

function calculateGoalKeeperLevel(player) {
    return player.portero;
}

function calculateDefenseLevel(player) {
    return player.defensa + player.cardio;
}

function calculateMidFieldLevel(player) {
    return player.tecnica + player.defensa + player.ataque + player.cardio;
}

function calculateAttackLevel(player) {
    return player.ataque + player.tecnica;
}

module.exports = generatePlayerGroups;