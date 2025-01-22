var numberOfTurnsForSimulation = 2;
var grille;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.valeur = 0; // Correctly initialize valeur
    }

    setValeur(valeur) {
        this.valeur = valeur;
    }
}

class Grille {
    constructor() {
        this.points = [];
    }

    addPoint(point) {
        this.points.push(point);
    }

    getPoint(x, y) {
        for (let point of this.points) { // Use this.points
            if (x == point.x && y == point.y) {
                return point;
            }
        }
        return -1;
    }

    getNumberInColumn(x) {
        let number = 0;
        for (let i = 0; i < 6; i++) {
            if (this.getPoint(x, i).valeur === 1 || this.getPoint(x, i).valeur === 2) {
                number = i + 1;
            }
        }
        return number;
    }

    cloneGrilleWithNewPoint(point) {
        let grille = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        grille.getPoint(point.x, point.y).setValeur(point.valeur);
        return grille;
    }

    static generateEmptyGrid() {
        let grille = new Grille();
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                grille.addPoint(new Point(j, i));
            }
        }
        return grille;
    }
}

function cloneGrilleWithNewPoint(grille, point) {
    let newGrille = new Grille();
    for (let p of grille.points) {
        let newPoint = new Point(p.x, p.y);
        newPoint.setValeur(p.valeur);
        newGrille.addPoint(newPoint);
    }
    newGrille.getPoint(point.x, point.y).setValeur(point.valeur);
    return newGrille;
}

class Node {
    constructor(grille, index, hashParent) {
        this.grille = grille;
        this.index = index;
        this.hashParent = hashParent;
        this.hashChildren = [];
        this.weight = 0;
        this.hash = '';
        this.generateHash();
    }

    addChild(child) {
        this.hashChildren.push(child);
    }

    generateHash() {
        this.hash = ''; // Initialize hash as an empty string
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                this.hash += this.grille.getPoint(j, i).valeur.toString();
            }
        }
    }
}

function generateChildrenForPlayer(node, player, index) {
    let children = [];

    for (let i = 0; i < 7; i++) {
        let numberInColumn = node.grille.getNumberInColumn(i); // Use node.grille instead of grille
        if (numberInColumn < 6) {
            let point = new Point(i, numberInColumn);
            point.setValeur(player);
            let childNode = new Node(cloneGrilleWithNewPoint(node.grille, point), index, node.hash);
            children.push(childNode);
        }
    }
    node.hashChildren = children.map(x => x.hash); // Correctly assign the hashes of children
    return children;
}

function getNodesEnFonctionDuTour(combinaisons, tour) {
    let nodes = [];
    for (let node of combinaisons) { // Use let instead of var
        if (node.index === tour) {
            nodes.push(node);
        }
    }
    return nodes;
}

function getNodeWithHash(combinaisons, hash) {
    for (let node of combinaisons) {
        //console.log(`Comparing  ${hash} with ${node.hash}.`);
        if (node.hash === hash) {
          //  console.log(`Found equals node with hash.`);

            return node;
        }
    }
}


function generateTreeOfPossibilities(grille, lastMoveHash) {
    // retourne un tableau de toutes les possibilités, tableau de nodes
    let rootNode = new Node(grille, 0, lastMoveHash);
    let combinaisons = []; // Initialize combinaisons as an empty array
    combinaisons.push(rootNode);
    for (let i = 1; i <= numberOfTurnsForSimulation; i++) {
        let player = (i % 2) + 1;
        let parentNodes = getNodesEnFonctionDuTour(combinaisons, i - 1);
        for (let parentNode of parentNodes) {
            if (!evaluateSituationWin(parentNode.grille, 1) && !evaluateSituationWin(parentNode.grille, 2)) {
                let children = generateChildrenForPlayer(parentNode, player, i);
                //console.log(`Generated children for node ${parentNode.hash}:`, children);
                combinaisons.push(...children); // Spread the children nodes into combinaisons            } else {
            }
        }
    }
    //console.log("Generated tree of possibilities:", combinaisons);

    return combinaisons;
}

class Pattern {
    points = [];
    originPoint;
    weight;
    constructor(points, weight) {
        this.points = points;
        this.weight = weight;
    }

    isExistingPoint(x, y) {
        if (originPoint != null) {
            for (let point of points) {
                if (originPoint.x + point.x === x && this.originPoint.y + point.y === y) {
                    return true;
                }
            }
        }
        return false;
    }
}


const PATTERN_GAGNE_1 = new Pattern([new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3)], 10000);
const PATTERN_GAGNE_2 = new Pattern([new Point(0, 0), new Point(1, 1), new Point(2, 2), new Point(3, 3)], 10000);
const PATTERN_GAGNE_3 = new Pattern([new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)], 10000);
const PATTERN_GAGNE_4 = new Pattern([new Point(0, 0), new Point(1, -1), new Point(2, -2), new Point(3, -3)], 10000);
const PATTERNS_GAGNE = [PATTERN_GAGNE_1, PATTERN_GAGNE_2, PATTERN_GAGNE_3, PATTERN_GAGNE_4];

const PATTERN_3_EN_LIGNE_1 = new Pattern([new Point(0, 0), new Point(0, 1), new Point(0, 2), getBlankPoint(0, 3)], 600);
const PATTERN_3_EN_LIGNE_2 = new Pattern([new Point(0, 0), new Point(1, 1), new Point(2, 2), getBlankPoint(3, 3)], 600);
const PATTERN_3_EN_LIGNE_3 = new Pattern([new Point(0, 0), new Point(1, 0), new Point(2, 0), getBlankPoint(3, 0)], 600);
const PATTERN_3_EN_LIGNE_4 = new Pattern([new Point(0, 0), new Point(1, -1), new Point(2, -2), getBlankPoint(3, -3)], 600);
const PATTERN_3_EN_LIGNE_5 = new Pattern([getBlankPoint(0, 0), new Point(0, 1), new Point(0, 2), new Point(0, 3)], 600);
const PATTERN_3_EN_LIGNE_6 = new Pattern([getBlankPoint(0, 0), new Point(1, 1), new Point(2, 2), new Point(3, 3)], 600);
const PATTERN_3_EN_LIGNE_7 = new Pattern([getBlankPoint(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)], 600);
const PATTERN_3_EN_LIGNE_8 = new Pattern([getBlankPoint(0, 0), new Point(1, -1), new Point(2, -2), new Point(3, -3)], 600);


const PATTERN_1_2_1 = new Pattern([new Point(0, 0), getBlankPoint(0, 1), new Point(0, 2), new Point(0, 3)], 600);
const PATTERN_1_2_2 = new Pattern([new Point(0, 0), getBlankPoint(1, 1), new Point(2, 2), new Point(3, 3)], 600);
const PATTERN_1_2_3 = new Pattern([new Point(0, 0), getBlankPoint(1, 0), new Point(2, 0), new Point(3, 0)], 600);
const PATTERN_1_2_4 = new Pattern([new Point(0, 0), getBlankPoint(1, -1), new Point(2, -2), new Point(3, -3)], 600);

const PATTERN_2_1_1 = new Pattern([new Point(0, 0), new Point(0, 1), getBlankPoint(0, 2), new Point(0, 3)], 600);
const PATTERN_2_1_2 = new Pattern([new Point(0, 0), new Point(1, 1), getBlankPoint(2, 2), new Point(3, 3)], 600);
const PATTERN_2_1_3 = new Pattern([new Point(0, 0), new Point(1, 0), getBlankPoint(2, 0), new Point(3, 0)], 600);
const PATTERN_2_1_4 = new Pattern([new Point(0, 0), new Point(1, -1), getBlankPoint(2, -2), new Point(3, -3)], 600);

const PATTERN_2_EN_LIGNE_FIRST_1 = new Pattern([new Point(0, 0), new Point(0, 1), getBlankPoint(0, 2)], 100);
const PATTERN_2_EN_LIGNE_FIRST_2 = new Pattern([new Point(0, 0), new Point(1, 1), getBlankPoint(2, 2)], 100);
const PATTERN_2_EN_LIGNE_FIRST_3 = new Pattern([new Point(0, 0), new Point(1, 0), getBlankPoint(2, 0)], 100);
const PATTERN_2_EN_LIGNE_FIRST_4 = new Pattern([new Point(0, 0), new Point(1, -1), getBlankPoint(2, -2)], 100);

const PATTERN_2_EN_LIGNE_LAST_1 = new Pattern([getBlankPoint(0, 0), new Point(0, 1), new Point(0, 2)], 100);
const PATTERN_2_EN_LIGNE_LAST_2 = new Pattern([getBlankPoint(0, 0), new Point(1, 1), new Point(2, 2)], 100);
const PATTERN_2_EN_LIGNE_LAST_3 = new Pattern([getBlankPoint(0, 0), new Point(1, 0), new Point(2, 0)], 100);
const PATTERN_2_EN_LIGNE_LAST_4 = new Pattern([getBlankPoint(0, 0), new Point(1, -1), new Point(2, -2)], 100);

const PATTERN_2_EN_LIGNE_MIDDLE_1 = new Pattern([new Point(0, 0), getBlankPoint(0, 1), new Point(0, 2)], 100);
const PATTERN_2_EN_LIGNE_MIDDLE_2 = new Pattern([new Point(0, 0), getBlankPoint(1, 1), new Point(2, 2)], 100);
const PATTERN_2_EN_LIGNE_MIDDLE_3 = new Pattern([new Point(0, 0), getBlankPoint(1, 0), new Point(2, 0)], 100);
const PATTERN_2_EN_LIGNE_MIDDLE_4 = new Pattern([new Point(0, 0), getBlankPoint(1, -1), new Point(2, -2)], 100);



const PATTERNS_3 = [
    PATTERN_3_EN_LIGNE_1,
    PATTERN_3_EN_LIGNE_2,
    PATTERN_3_EN_LIGNE_3,
    PATTERN_3_EN_LIGNE_4,
    PATTERN_3_EN_LIGNE_5,
    PATTERN_3_EN_LIGNE_6,
    PATTERN_3_EN_LIGNE_7,
    PATTERN_3_EN_LIGNE_8,
    PATTERN_1_2_1,
    PATTERN_1_2_2,
    PATTERN_1_2_3,
    PATTERN_1_2_4,
    PATTERN_2_1_1,
    PATTERN_2_1_2,
    PATTERN_2_1_3,
    PATTERN_2_1_4];

const PATTERNS_2 = [
    PATTERN_2_EN_LIGNE_FIRST_1,
    PATTERN_2_EN_LIGNE_FIRST_2,
    PATTERN_2_EN_LIGNE_FIRST_3,
    PATTERN_2_EN_LIGNE_FIRST_4,
    PATTERN_2_EN_LIGNE_LAST_1,
    PATTERN_2_EN_LIGNE_LAST_2,
    PATTERN_2_EN_LIGNE_LAST_3,
    PATTERN_2_EN_LIGNE_LAST_4,
    PATTERN_2_EN_LIGNE_MIDDLE_1,
    PATTERN_2_EN_LIGNE_MIDDLE_2,
    PATTERN_2_EN_LIGNE_MIDDLE_3,
    PATTERN_2_EN_LIGNE_MIDDLE_4
];

function getBlankPoint(x, y) {
    let point = new Point(x, y);
    point.valeur = 3;
    return point;
}



function evaluateSituationForPlayer(grille, patterns, player) {
    let listePatterns = [];
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            for (let pattern of patterns) {
                if (!pattern.points || pattern.points.length === 0) {
                    console.error("Pattern points are undefined or empty:", pattern);
                    continue;
                }
                let continueEvaluation = true;
                let iPoint = 0;
                while (continueEvaluation) {
                    let xPointToEvaluate = j + pattern.points[iPoint].x;
                    let yPointToEvaluate = i + pattern.points[iPoint].y;
                    if ((pattern.points[iPoint].valeur === 3 && grille.getPoint(xPointToEvaluate, yPointToEvaluate).valeur !== 0) || 
                        (pattern.points[iPoint].valeur === 0 && grille.getPoint(xPointToEvaluate, yPointToEvaluate).valeur !== player)) {
                        continueEvaluation = false;
                    }
                    if (continueEvaluation === true && iPoint + 1 === pattern.points.length) {
                        pattern.originPoint = new Point(j, i);
                        listePatterns.push(pattern); // Use listePatterns instead of mapPatterns
                        break;
                    }
                    iPoint += 1;
                }
            }
        }
    }
    return listePatterns;
}

function evaluateSituationWin(grille, player) {
    if (evaluateSituationForPlayer(grille, PATTERNS_GAGNE, player).length > 0) {
        return true;
    }
    return false;
}

function evaluateSituation(grille, player) {
    let listePatterns = PATTERNS_GAGNE.concat(PATTERNS_3.concat(PATTERNS_2));
    var score = 0;
    for (let pattern of evaluateSituationForPlayer(grille, listePatterns, player)){
    score += pattern.weight;
    }
    return score;
}

function remonterScore(combinaisons) {
    for (let i = numberOfTurnsForSimulation; i >= 1; i--) {
        let nodesOfThisTurn = getNodesEnFonctionDuTour(combinaisons, i);
        for (let node of nodesOfThisTurn) {
            // si le node n'a pas d'enfants ou si il s'agit du dernier tour de simu 
            // il faut calculer le poids
            if (i === numberOfTurnsForSimulation || node.hashChildren.length===0) {
                node.weight = 2 * evaluateSituation(node.grille, 1) - evaluateSituation(node.grille, 2);
            } else {
                // sinon il faut récupérer les enfants, et calculer le max       
                let weight;
                for (let childNode of node.hashChildren) {
                    let weightOfChildNode = getNodeWithHash(combinaisons, childNode).weight;               
                    // Remonter le poids min
                    if (weight == null || weight === 0 || weightOfChildNode > weight) {
                        weight = weightOfChildNode;
                    }
                }
                node.weight = weight;
            }
        }
    }
}


function getBestMove(combinaisons) {
    let nodesFirstRound = getNodesEnFonctionDuTour(combinaisons, 1);
    let maximumWeight = Infinity; 
    let nodesWithSameMinimalScore = [];

   // security, check if one shot would win	
   nodesFirstRound.forEach(function(item) {
        if (evaluateSituationWin(item.grille, 2)) {
            return item;
        }
    });

    // Set the minimum weight
    nodesFirstRound.forEach(function(item) {
        if (item.weight < maximumWeight) {
            maximumWeight = item.weight;
        }
    });
    
    // Check if there are several nodes with the same score
    nodesFirstRound.forEach(function(item) {
        if (item.weight === maximumWeight) {
            nodesWithSameMinimalScore.push(item);
        }
    });
    
    if (nodesWithSameMinimalScore.length > 1) {
        // There are several nodes with the same  score. Determine which one to take.
        // Traverse the children and determine for each node how many moves it takes
        let hashChildBestMove = getBestMoveInCaseOfEqualities(combinaisons, maximumWeight, nodesWithSameMinimalScore, 1);
        if (hashChildBestMove === 0) {
            // Return a random hash from nodesWithSameMinimalScore
            let index = Math.floor(Math.random() * nodesWithSameMinimalScore.length);
            return nodesWithSameMinimalScore[index];
        } else {
            // Return the parent of hashChildBestMove
            return getParent(combinaisons, getNodeWithHash(combinaisons, hashChildBestMove.hash), 1);
        }
    } else if (nodesWithSameMinimalScore.length === 1) {
        return nodesWithSameMinimalScore[0];
    } else {
        console.error("No valid move found.");
        return null;
    }
}

function getParent(combinaisons, nodeChild, round) {
    let result = getNodeWithHash(combinaisons, nodeChild.hashParent);
    if (result.index === round) {
        return result;
    } else {
        return getParent(combinaisons, result, round);
    }
}

function getBestMoveInCaseOfEqualities(combinaisons, weight, listHashParents, roundNumber) {
    // If for each parent there is not at least one child with the same weight, return the round number
    let definitiveChildren = [];
    let hashResult;
    let isFound = false;
    for (let hashParent of listHashParents) {
        let children = [];
        hashParent.hashChildren.forEach(function(item) {
            let node = getNodeWithHash(combinaisons, item);
            if (node.weight === weight) {
                children.push(node);
            }
        });
        if (children.length === 0) {
            hashResult = hashParent;
            isFound = true;
            break;
        }
        definitiveChildren.push(...children);
    }
    if (roundNumber <= numberOfTurnsForSimulation-1) {
        if (isFound) {
            return hashResult;
        }
        roundNumber += 1;
        return getBestMoveInCaseOfEqualities(combinaisons, weight, definitiveChildren, roundNumber);
    } else {
        // All moves are equivalent, choose one at random
        return 0;
    }
}

function compareNodeHashesToGetPoint(node1, node2) {
    if (node1.length !== node2.length) {
        throw new Error("Node hashes are of different lengths.");
    }

    for (let i = 0; i < node1.length; i++) {
        if (node1[i] !== node2[i]) {
            let x = i % 7;
            let y = Math.floor(i / 7);
            return new Point(x, y, 0);
        }
    }
    console.error("No difference found between hashes");
    return null; // No difference found
}

function playIA(turnCounter, lastMoveHash) {
    // Generate the tree of possibilities
    let combinaisons = generateTreeOfPossibilities(grille, lastMoveHash);
    // Calculate the scores for each node
    remonterScore(combinaisons);
    // Determine the best move
    let bestMoveNode = getBestMove(combinaisons);
    
    if (!bestMoveNode) {
        console.error("No valid move found for AI.");
        return false;
    }
    
    console.log("Best move node:", bestMoveNode);
    
    // Add the best move to the grille
    //let bestMovePoint = bestMoveNode.grille.getPoint(bestMoveNode.index % 7, Math.floor(bestMoveNode.index / 7));
    let bestMovePoint = compareNodeHashesToGetPoint(lastMoveHash, bestMoveNode.hash);
    
    grille.getPoint(bestMovePoint.x, bestMovePoint.y).setValeur(2); // Assuming 2 is the AI player
    
    // Check if the game is won
    if (evaluateSituationWin(grille, 2)) {
        console.log("AI wins!");
        return true;
    }
    
    return false;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Initialize the grille after the document is fully loaded
function initializeGrille() {
    grille = Grille.generateEmptyGrid();
}

// Call initializeGrille after the document is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    initializeGrille();
});
