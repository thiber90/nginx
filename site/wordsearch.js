var tailleGrille = 10;
var nbMots = 10;
var grille;
var gridNodes = [];


class Point {

    color = [];    
    
    constructor(x, y, lettre) {
        this.x = x;
        this.y = y;
        this.lettre = lettre;
    }

    setColor(color) {
        this.color = color;
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
        return -1; // lorsqu'on ne trouve pas de point, ne devrait pas arriver
    }


    static generateEmptyGrid() {
        let grille = new Grille();
        for (let i = 0; i < tailleGrille; i++) {
            for (let j = 0; j < tailleGrille; j++) {
                grille.addPoint(new Point(i, j, ""));
            }
        }
        return grille;
    }
}

class Node {

    found=false;
    foundOrder=0;


    constructor(word, point, direction){
        this.word=word;
        this.point=point;
        this.direction=direction;
    }

    setNodeFound(){
        this.found=true;
    }

    setFoundOrder(order){
        this.foundOrder=order;
    }

}

function getPointsWithOriginAndDirection(node){
    let points = [];

    for(i=0; i<node.word.length; i++){
        if(node.direction === 1){
            points.push(grille.getPoint(node.point.x + i, node.point.y));
        }
        if(node.direction === 2){
            points.push(grille.getPoint(node.point.x + i, node.point.y + i));
        }
        if(node.direction === 3){
            points.push(grille.getPoint(node.point.x, node.point.y + i));
        }
        if(node.direction === 4){
            points.push(grille.getPoint(node.point.x - i, node.point.y + i));
        }
        if(node.direction === 5){
            points.push(grille.getPoint(node.point.x - i, node.point.y));
        }
        if(node.direction === 6){
            points.push(grille.getPoint(node.point.x - i, node.point.y - i));
        }
        if(node.direction === 7){
            points.push(grille.getPoint(node.point.x, node.point.y - i));
        }
        if(node.direction === 8){
            points.push(grille.getPoint(node.point.x + i, node.point.y - i));
        }

    }
    return points;

}

// Load words from a file using AJAX
function loadWords(callback) {
    $.ajax({
        url: 'frenchWords.txt',
        success: function(data) {
            const wordsArray = data.split(',');
            callback(wordsArray);
        },
        error: function() {
            console.error('Failed to load words');
        }
    });
}


// Load words from a file using synchronous XMLHttpRequest
function loadWordsSync(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, false); // false makes the request synchronous
    request.send(null);

    if (request.status === 200) {
        const wordsArray = request.responseText.split(',');
        return wordsArray;
    } else {
        console.error('Failed to load words');
        return [];
    }
}

// function qui retourne 200 mots au hasard
function getRandomWords(selectedLanguage) {
    var file;
    if(selectedLanguage==='french'){
        file = 'frenchWords.txt';
    } else {
        file = 'englishWords.txt';
    }
    const wordsArray = loadWordsSync(file);
    // Shuffle the array and get 200 random words
    const shuffledArray = wordsArray.sort(() => 0.5 - Math.random());
    const randomWords = shuffledArray.slice(0, 200);
    return randomWords;
}



// function qui retourne les mots choisis au hasard et retourne des nodes
function populateGrille(selectedLanguage){
    var words = getRandomWords(selectedLanguage);

        var i = 0;
        var nodes = [];
        while (nodes.length < nbMots) {
            let chosenNode;
            let possibleNodes = getPossibleNodesForAWord(words[i]);
            if (possibleNodes.length > 0) {
                if(nodes.length===0 || calculatePercentageDiagWords(nodes)<0.5){
                    let diagNodes = filterNodestoGetOnlyDiag(possibleNodes);
                    if(diagNodes.length>0){
                        chosenNode = diagNodes[Math.floor(Math.random() * diagNodes.length)];
                    }
                } else {
                    chosenNode = possibleNodes[Math.floor(Math.random() * possibleNodes.length)];
                }
                if(chosenNode!==undefined){
                nodes.push(chosenNode);
                addWordToTheGrille(chosenNode);
                }
          }
            i++;
        }
       gridNodes.push(...nodes)
       // générer des lettres aléatoires, disabled at the moment for testing
        fillGridWithRandomLetters();
}

function filterNodestoGetOnlyDiag(nodes){
    var diagNodes = [];
    for (let node of nodes) {
        if(node.direction === 2 || node.direction === 4 || node.direction === 6 || node.direction === 8){
            diagNodes.push(node);
        }   
    }
    return diagNodes;

}

// given a node, add this word to the grille
function addWordToTheGrille(node) {
    for (let i = 0; i < node.word.length; i++) {
        let x = node.point.x;
        let y = node.point.y;

        switch (node.direction) {
            case 1: // left to right
                x += i;
                break;
            case 2: // diagonal bottom-left to top-right
                x += i;
                y += i;
                break;
            case 3: // bottom to top
                y += i;
                break;
            case 4: // diagonal bottom-right to top-left
                x -= i;
                y += i;
                break;
            case 5: // right to left
                x -= i;
                break;
            case 6: // diagonal top-right to bottom-left
                x -= i;
                y -= i;
                break;
            case 7: // top to bottom
                y -= i;
                break;
            case 8: // diagonal top-left to bottom-right
                x += i;
                y -= i;
                break;
        }

        grille.getPoint(x, y).lettre = node.word.charAt(i);
    }
}

// evaluate all the possibilities for a word to be put in the grille (at all the possible points)
function getPossibleNodesForAWord(word){

    var possibleNodes = [];
    for (let point of grille.points) {
        let node = new Node(word, point, 0); // Example direction
        let nodes = evaluateNodePossibilities(node);
        possibleNodes = possibleNodes.concat(nodes);
    }
    return possibleNodes;

}

function calculatePercentageDiagWords(nodes){
    var diagWords = 0;
    for (let node of nodes) {
        if(node.direction === 2 || node.direction === 4 || node.direction === 6 || node.direction === 8){
            diagWords++;
        }   
    }
    return diagWords/nodes.length;
}

// evaluate de possibility for a word to be put at a certain point
function evaluateNodePossibilities(node) {
    var possibleNodes = [];

    // direction 1 (left to right)
    if (node.word.length - ((tailleGrille) - node.point.x) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x + i, node.point.y).lettre !== "" && grille.getPoint(node.point.x + i, node.point.y).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 1));
            }
        }
    }

    // direction 2 (diagonal bottom-left to top-right)
    if (node.word.length - Math.min((tailleGrille) - node.point.x, (tailleGrille) - node.point.y) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x + i, node.point.y + i).lettre !== "" && grille.getPoint(node.point.x + i, node.point.y + i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 2));
            }
        }
    }

    // direction 3 (bottom to top)
    if (node.word.length - ((tailleGrille) - node.point.y) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x, node.point.y + i).lettre !== "" && grille.getPoint(node.point.x, node.point.y + i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 3));
            }
        }
    }

    // direction 4 (diagonal bottom-right to top-left)
    if (node.word.length - Math.min(node.point.x + 1, (tailleGrille) - node.point.y)<= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x - i, node.point.y - i).lettre !== "" && grille.getPoint(node.point.x - i, node.point.y - i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 4));
            }
        }
    }

    // direction 5 (right to left)
    if (node.word.length - (node.point.x + 1) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x - i, node.point.y).lettre !== "" && grille.getPoint(node.point.x - i, node.point.y).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 5));
            }
        }
    }

    // direction 6 (diagonal top-right to bottom-left)
    if (node.word.length - Math.min(node.point.x + 1,  node.point.y + 1) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x - i, node.point.y + i).lettre !== "" && grille.getPoint(node.point.x - i, node.point.y + i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 6));
            }
        }
    }

    // direction 7 (top to bottom)
    if (node.word.length - ( node.point.y + 1) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x, node.point.y - i).lettre !== "" && grille.getPoint(node.point.x, node.point.y - i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 7));
            }
        }
    }

    // direction 8 (diagonal top-left to bottom-right)
    if (node.word.length - Math.min((tailleGrille) - node.point.x,  node.point.y + 1) <= 0) {
        for (let i = 0; i < node.word.length; i++) {
            if (grille.getPoint(node.point.x + i, node.point.y - i).lettre !== "" && grille.getPoint(node.point.x + i, node.point.y - i).lettre !== node.word.charAt(i)) {
                break;
            }
            if (i === node.word.length - 1) {
                possibleNodes.push(new Node(node.word, node.point, 8));
            }
        }
    }

    return possibleNodes;
}


function isWordFound(points){
    for(let node of gridNodes){
        if(points.length===node.word.length){
            let pointsFromWord = getPointsWithOriginAndDirection(node);
            if(comparePointsArray(points, pointsFromWord)){
                node.setNodeFound();
                node.setFoundOrder(howManyWordsFound()+1);
                return true;
            }
        }
    }
    return false;

}

function howManyWordsFound(){
    let foundWords = 0;
    for(let node of gridNodes){
        if(node.found){
            foundWords++;
        }
    }
    return foundWords;
}

function getRandomLetter() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

function fillGridWithRandomLetters() {
    for (let point of grille.points) {
        if (point.lettre === "") {
            point.lettre = getRandomLetter();
        }
    }
}


function comparePointsArray(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Sort the arrays
    arr1.sort((a, b) => (a.x - b.x) || (a.y - b.y));
    arr2.sort((a, b) => (a.x - b.x) || (a.y - b.y));

    // Compare the sorted arrays
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].x !== arr2[i].x || arr1[i].y !== arr2[i].y) {
            return false;
        }
    }

    return true;
}



// useless
function extractWordLetters(word){
    let letterMap = new Map();
    for(i=0; i<word.length; i++){
        if(letterMap.has(word.charAt(i))){
            letterMap.set(word.charAt(i), letterMap.get(word.charAt(i))+1);
        } else {
            letterMap.set(word.charAt(i), 1);
        }
    }
    return letterMap;
}



