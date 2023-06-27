

var largeDiv = document.getElementById("main-div");
var i;
var startBoxNumber;
var endBoxNumber;
var middleBoxNumber = -1;
var isCheckpointActive = false;
var algoReset = false;
var visualizerToggle = true;
var pathSpeed = 100;
var visualizerSpeed = 0;
var currentSpeed = 3;
var currentMaze = 0;

var windowHeight = window.innerHeight - 170;
document.getElementById('main-div').style.height = windowHeight;
var windowWidth = window.innerWidth - 4;
document.getElementById('main-div').setAttribute("style", "width: 100%;");
document.getElementById('buttonsDiv').style.width = windowWidth;
var boxHeight = 21;
var boxWidth = 22;
var numColumns = Math.floor(Math.floor(windowWidth)/boxWidth);
var numRows = Math.floor((windowHeight)/boxHeight);
var gridSize = numRows * numColumns;

var startBoxStartRow = Math.floor(numRows * 0.5);
var startBoxStartCol = Math.floor(numColumns * 0.1);
var endBoxStartRow = Math.floor(numRows * 0.5);
var endBoxStartCol = Math.floor(numColumns * 0.9);
var middleBoxStartRow = Math.floor(numRows * 0.85);
var middleBoxStartCol = Math.floor(numColumns * 0.5);

window.addEventListener("resize", reset);

var isDijkstraChosen = false;
var isAStarChosen = false;

var isPathFound = false;


function getBoxNum(id) {
    return parseInt(id.substring(1, id.length));
}

function convertToId(boxNum) {
    return 'i' + boxNum.toString();
}

var gridBoxes = [];

class Box {
    constructor(divId) {
        this.divId = divId;
        this.boxNum = getBoxNum(divId);
        this.isWall = false;
        this.isStart = false;
        this.isFinish = false;
        this.isCheckpoint = false;
        this.distance = 99999;
        this.previousBoxRow = -1;
        this.previousBoxCol = -1;
        this.visited = false;
        this.row = -1;
        this.col = -1;
        this.f = -1;
        this.g = -1;
    }
}

var currentRow = 0;
var currentCol = 1;

for (i = 1; i <= gridSize; i++) {
    var newDiv = document.createElement("div");
    newDiv.id = 'i' + i.toString();
    newDiv.className = 'gridBox';
    largeDiv.appendChild(newDiv);

    var newBox = new Box(newDiv.id);
    newBox.row = currentRow;
    newBox.col = currentCol;
    

    if (i == (startBoxStartRow * numColumns) + startBoxStartCol) {
        newBox.isStart = true;
        startBoxNumber = (startBoxStartRow * numColumns) + startBoxStartCol;
        document.getElementById(newDiv.id).setAttribute("style", "background-color: green;");
    }
    if (i == (endBoxStartRow * numColumns) + endBoxStartCol) {
        newBox.isFinish = true;
        endBoxNumber = (endBoxStartRow * numColumns) + endBoxStartCol;
        document.getElementById(newDiv.id).setAttribute("style", "background-color: red;");
    }

    gridBoxes[i-1] = newBox;

    currentCol++;

    if (currentCol == numColumns + 1) {
        currentCol = 1;
        currentRow++;
    }
}

function getCurrentBoxNumber() {
    var evt = window.event;

    if ((evt.clientX >= 2 && evt.clientX <= windowWidth + 2) && (evt.clientY >= 2 && evt.clientY <= windowHeight + 2)) {
        var y;
        var row;
        var col;

        for (y = 1; y <= numColumns; y++) {
            if ((evt.clientX > (y * (boxWidth)) - boxWidth + 2) && (evt.clientX <= (y * (boxWidth)) + 2)) {
                col = y;
            }
        }
        for (y = 1; y <= numRows; y++) {
            if ((evt.clientY >=(y * (boxHeight)) - boxHeight + 2) && (evt.clientY <= (y * (boxHeight)) + 2)) {
                row = y;
            }
        }

        if (prevRow == 0 && prevCol == 0) {
            firstRow = row;
            firstCol = col;
        }

        var boxNumber;
        boxNumber = ((row - 1) * numColumns) + col;

        return boxNumber;
    }
}


var wallClick = false;


window.onclick = function(e) {
    var evt = window.event || e;

    if ((evt.clientX >= 2 && evt.clientX <= this.windowWidth + 2) && (evt.clientY >= 2 && evt.clientY <= this.windowHeight + 2)) {
        var y;
        var row;
        var col;

        for (y = 1; y <= this.numColumns; y++) {
            if ((evt.clientX > (y * (this.boxWidth)) - this.boxWidth + 2) && (evt.clientX <= (y * (this.boxWidth)) + 2)) {
                col = y;
            }
        }
        for (y = 1; y <= this.numRows; y++) {
            if ((evt.clientY >=(y * (this.boxHeight)) - this.boxHeight + 2) && (evt.clientY <= (y * (this.boxHeight)) + 2)) {
                row = y;
            }
        }

        var boxNumber;
        boxNumber = ((row - 1) * this.numColumns) + col;

        if (boxNumber != this.startBoxNumber && boxNumber != this.endBoxNumber && boxNumber != this.middleBoxNumber && this.stack.length == 0) {
            if (this.gridBoxes[boxNumber - 1].isWall == true) {
                this.gridBoxes[boxNumber - 1].isWall = false;
                document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: white;");
            }
            else {
                this.gridBoxes[boxNumber - 1].isWall = true;
                document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: black;");
            }
        }

    }

    console.log("X: " + evt.clientX);
    console.log("Y: " + evt.clientY);
}

var pressDownStart = false;
var pressDownEnd = false;
var pressDownCheckpoint = false;

var prevRow = 0;
var prevCol = 0;

var firstRow;
var firstCol;

function toggleWalls() {
    var evt = window.event;

    if ((evt.clientX >= 2 && evt.clientX <= windowWidth + 2) && (evt.clientY >= 2 && evt.clientY <= windowHeight + 2)) {
        var y;
        var row;
        var col;

        for (y = 1; y <= numColumns; y++) {
            if ((evt.clientX > (y * (boxWidth)) - boxWidth + 2) && (evt.clientX <= (y * (boxWidth)) + 2)) {
                col = y;
            }
        }
        for (y = 1; y <= numRows; y++) {
            if ((evt.clientY >=(y * (boxHeight)) - boxHeight + 2) && (evt.clientY <= (y * (boxHeight)) + 2)) {
                row = y;
            }
        }

        if (prevRow == 0 && prevCol == 0) {
            firstRow = row;
            firstCol = col;
        }

        if (prevRow != row || prevCol != col) {
            var boxNumber;
            boxNumber = ((row - 1) * numColumns) + col;

            if (boxNumber != startBoxNumber && boxNumber != endBoxNumber && boxNumber != middleBoxNumber) {
                if (this.gridBoxes[boxNumber - 1].isWall == true) {
                    this.gridBoxes[boxNumber - 1].isWall = false;
                    document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: white;");
                }
                else {
                    this.gridBoxes[boxNumber - 1].isWall = true;
                    document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: black;");
                }
    
                prevCol = col;
                prevRow = row;
            }
        }

    }

    console.log("X: " + evt.clientX);
    console.log("Y: " + evt.clientY);
}

function configureWalls() {
    var g;
    for (g = 1; g <= gridSize; g++) {

        if (gridBoxes[g - 1].isWall == true) {
            document.getElementById(convertToId(g)).setAttribute("style", "background-color: black;");
        }
        else {
            if (g != startBoxNumber && g != endBoxNumber && g != middleBoxNumber) {
                document.getElementById(convertToId(g)).setAttribute("style", "background-color: white;");
            }
        }
    }
}

var pressDownWall = false;

let downListener = () => {
    if (getCurrentBoxNumber() != startBoxNumber && getCurrentBoxNumber() != endBoxNumber && getCurrentBoxNumber() != middleBoxNumber && stack.length == 0) {
        pressDownWall = true;
    }
}

document.getElementById("main-div").addEventListener('mousedown', downListener);

let moveListener = () => {
    if (pressDownWall == true && pressDownStart == false && pressDownEnd == false && pressDownCheckpoint == false && stack.length == 0) {
        toggleWalls();
    }
}

document.getElementById("main-div").addEventListener('mousemove', moveListener);

let upListener = () => {

    if (pressDownStart == false && pressDownEnd == false && pressDownCheckpoint == false && stack.length == 0 && pressDownWall == true) {
        pressDownWall = false;

        // get rid of this whole section + firstrow and firstcol section in togglewalls if problems start to occur
        if (firstRow != prevRow || firstCol != prevCol) {
            var boxNumber;
            boxNumber = ((prevRow - 1) * numColumns) + prevCol;
            if (this.gridBoxes[boxNumber - 1].isWall == true) {
                this.gridBoxes[boxNumber - 1].isWall = false;
                document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: white;");
            }
            else {
                this.gridBoxes[boxNumber - 1].isWall = true;
                document.getElementById(this.convertToId(boxNumber)).setAttribute("style", "background-color: black;");
            }

            prevRow = 0;
            prevCol = 0;
        }
    }
}

document.getElementById("main-div").addEventListener('mouseup', upListener);



var currentNumberStart = 0;
var currentNumberEnd = 0;
var currentNumberCheckpoint = 0;

let downListenerStart = () => {
    if (startBoxNumber == getCurrentBoxNumber() && stack.length == 0) {
        pressDownStart = true;
        currentNumberStart = startBoxNumber;
        console.log("hellooooooo");
    }
    else if (endBoxNumber == getCurrentBoxNumber() && stack.length == 0) {
        pressDownEnd = true;
        currentNumberEnd = endBoxNumber;
    }
    else if (middleBoxNumber == getCurrentBoxNumber() && isCheckpointActive == true && stack.length == 0) {
        pressDownCheckpoint = true;
        currentNumberCheckpoint = middleBoxNumber;
    }
}

document.getElementById("main-div").addEventListener('mousedown', downListenerStart);



let moveListenerStart = () => {
    if (pressDownStart == true && getCurrentBoxNumber() != endBoxNumber && getCurrentBoxNumber() != middleBoxNumber && stack.length == 0) {
        this.gridBoxes[currentNumberStart - 1].isStart = false;
        document.getElementById(this.convertToId(currentNumberStart)).setAttribute("style", "background-color: white;");
        this.gridBoxes[getCurrentBoxNumber() - 1].isStart = true;
        this.gridBoxes[getCurrentBoxNumber() - 1].isWall = false;
        document.getElementById(convertToId(getCurrentBoxNumber())).setAttribute("style", "background-color: green;");
        startBoxNumber = getCurrentBoxNumber();
        currentNumberStart = getCurrentBoxNumber();
        console.log("startBoxNumber: " + startBoxNumber);
    }
    else if (pressDownEnd == true && getCurrentBoxNumber() != startBoxNumber && getCurrentBoxNumber() != middleBoxNumber && stack.length == 0) {
        this.gridBoxes[currentNumberEnd - 1].isFinish = false;
        document.getElementById(this.convertToId(currentNumberEnd)).setAttribute("style", "background-color: white;");
        this.gridBoxes[getCurrentBoxNumber() - 1].isFinish = true;
        this.gridBoxes[getCurrentBoxNumber() - 1].isWall = false;
        document.getElementById(convertToId(getCurrentBoxNumber())).setAttribute("style", "background-color: red;");
        endBoxNumber = getCurrentBoxNumber();
        currentNumberEnd = getCurrentBoxNumber();
        console.log("endBoxNumber: " + endBoxNumber);
    }
    else if (pressDownCheckpoint == true && getCurrentBoxNumber() != startBoxNumber && getCurrentBoxNumber() != endBoxNumber && isCheckpointActive == true && stack.length == 0) {
        this.gridBoxes[currentNumberCheckpoint - 1].isCheckpoint = false;
        document.getElementById(this.convertToId(currentNumberCheckpoint)).setAttribute("style", "background-color: white;");
        this.gridBoxes[getCurrentBoxNumber() - 1].isCheckpoint = true;
        this.gridBoxes[getCurrentBoxNumber() - 1].isWall = false;
        document.getElementById(convertToId(getCurrentBoxNumber())).setAttribute("style", "background-color: blue;");
        middleBoxNumber = getCurrentBoxNumber();
        currentNumberCheckpoint = getCurrentBoxNumber();
    }

    if (stack.length == 0 && algoReset == true) {

        if (isDijkstraChosen == true) {
            if (isCheckpointActive == true) {
                resetAlgoStats();
                runDijkstraAlgo(startBoxNumber, middleBoxNumber);

                if (isPathFound == true) {
                    updateShortestPath(middleBoxNumber);
                    resetAlgoStatsWithCheckpoint();
                    runDijkstraAlgo(middleBoxNumber, endBoxNumber);

                    if (isPathFound == true) {
                        updateShortestPath(endBoxNumber);
                    }
                }
            }
            else {
                resetAlgoStats();
                runDijkstraAlgo(startBoxNumber, endBoxNumber);
                if (isPathFound == true) {
                    updateShortestPath(endBoxNumber);
                }
            }
        }
        else if (isAStarChosen == true) {
            if (isCheckpointActive == true) {
                resetAlgoStats();
                aStarAlgo(startBoxNumber, middleBoxNumber);

                if (isPathFound == true) {
                    updateShortestPath(middleBoxNumber);
                    resetAlgoStatsWithCheckpoint();
                    aStarAlgo(middleBoxNumber, endBoxNumber);

                    if (isPathFound == true) {
                        updateShortestPath(endBoxNumber);
                    }
                }
            }
            else {
                resetAlgoStats();
                aStarAlgo(startBoxNumber, endBoxNumber);
                if (isPathFound == true) {
                    updateShortestPath(endBoxNumber);
                }
            }
        }
        
    }
}

document.getElementById("main-div").addEventListener('mousemove', moveListenerStart);

let upListenerStart = () => {
    if (pressDownStart == true && stack.length == 0) {
        pressDownStart = false;
        console.log("currentNumberStart: " + getCurrentBoxNumber());
        console.log("isStart: " + gridBoxes[startBoxNumber - 1].isStart);
    }
    else if (pressDownEnd == true && stack.length == 0) {
        pressDownEnd = false;
    }
    else if (pressDownCheckpoint == true && isCheckpointActive == true && stack.length == 0) {
        pressDownCheckpoint = false;
    }
}

document.getElementById("main-div").addEventListener('mouseup', upListenerStart);

function findBoxNumByRowCol (row, col) {
    var m;
    for (m = 0; m < gridBoxes.length; m++) {
        if (gridBoxes[m].row == row && gridBoxes[m].col == col) {
            return gridBoxes[m].boxNum;
        }
    }
}

var visualQueue = [];
var changeColor = false;
var counter = 0;
var changeAt;

function runDijkstraAlgo (startBox, endBox) {
    var unvisitedNodes = [];
    var unvisitedSetLength;

    gridBoxes[startBox - 1].distance = 0;

    var index;
    for (index = 0; index < gridBoxes.length; index++) {
        gridBoxes[index].visited = false;
        unvisitedNodes.push(gridBoxes[index]);
        
    }

    unvisitedSetLength = unvisitedNodes.length
    // iterate through all unvisited boxes until finish box is found
    while (unvisitedSetLength != 0) {

        // find shortest distance box in unvisited set
        var minDistanceBox = 99999;
        var chosenBox;
        for (index = 0; index < gridBoxes.length; index++) {
            if (gridBoxes[index].distance < minDistanceBox && gridBoxes[index].visited == false) {
                minDistanceBox = gridBoxes[index].distance;
                chosenBox = index;
            }
        }

        // remove chosen box from unvisited set
        gridBoxes[chosenBox].visited = true;
        delete unvisitedNodes[chosenBox];
        unvisitedSetLength--;

        if (gridBoxes[chosenBox].boxNum == endBox) {
            isPathFound = true;
            break;
        }

        if (chosenBox + 1 != startBox) {
            visualQueue.push(gridBoxes[chosenBox]);
            counter++;
        }

        // for each neighbor do the following
        var searchTop = false;
        var searchLeft = false;
        var searchBottom = false;
        var searchRight = false;

        // Neighbors depend on location of box
        if (gridBoxes[chosenBox].row > 0 && gridBoxes[chosenBox].row < (numRows - 1) && gridBoxes[chosenBox].col > 1 && gridBoxes[chosenBox].col < numColumns) {
            searchTop = true;
            searchLeft = true;
            searchBottom = true;
            searchRight = true;
        }
        else if (gridBoxes[chosenBox].row == 0 && gridBoxes[chosenBox].col == 1) {
            searchRight = true;
            searchBottom = true;
        }
        else if (gridBoxes[chosenBox].row == (numRows - 1) && gridBoxes[chosenBox].col == 1) {
            searchTop = true;
            searchRight = true;
        }
        else if (gridBoxes[chosenBox].row == 0 && gridBoxes[chosenBox].col == numColumns) {
            searchLeft = true;
            searchBottom = true;
        }
        else if (gridBoxes[chosenBox].row == (numRows - 1) && gridBoxes[chosenBox].col == numColumns) {
            searchLeft = true;
            searchTop = true;
        }
        else if (gridBoxes[chosenBox].row == 0 && gridBoxes[chosenBox].col > 1 && gridBoxes[chosenBox].col < numColumns) {
            searchLeft = true;
            searchRight = true;
            searchBottom = true;
        }
        else if (gridBoxes[chosenBox].row == (numRows - 1) && gridBoxes[chosenBox].col > 1 && gridBoxes[chosenBox].col < numColumns) {
            searchLeft = true;
            searchRight = true;
            searchTop = true;
        }
        else if (gridBoxes[chosenBox].col == 1 && gridBoxes[chosenBox].row > 0 && gridBoxes[chosenBox].row < (numRows - 1)) {
            searchTop = true;
            searchRight = true;
            searchBottom = true;
        }
        else if (gridBoxes[chosenBox].col == numColumns && gridBoxes[chosenBox].row > 0 && gridBoxes[chosenBox].row < (numRows - 1)) {
            searchTop = true;
            searchLeft = true;
            searchBottom = true;
        }

        // for each neighbor
        if (searchTop == true) {
            var topIndex = (findBoxNumByRowCol(gridBoxes[chosenBox].row - 1, gridBoxes[chosenBox].col) - 1);
            console.log('index: ' + topIndex);
            var testDistance;
            console.log('index: ' + topIndex);
            if (gridBoxes[topIndex].visited == false) {
                if (gridBoxes[topIndex].isWall == true) {
                    testDistance = gridBoxes[chosenBox].distance + 99999;
                }
                else {
                    testDistance = gridBoxes[chosenBox].distance + 1;
                }

                if (testDistance < gridBoxes[topIndex].distance) {
                    gridBoxes[topIndex].distance = testDistance;
                    gridBoxes[topIndex].previousBoxRow = gridBoxes[chosenBox].row;
                    gridBoxes[topIndex].previousBoxCol = gridBoxes[chosenBox].col;
                }

            }
        }

        if (searchLeft == true) {
            var leftIndex = (findBoxNumByRowCol(gridBoxes[chosenBox].row, gridBoxes[chosenBox].col - 1) - 1);
            var testDistance;
            if (gridBoxes[leftIndex].visited == false) {
                if (gridBoxes[leftIndex].isWall == true) {
                    testDistance = gridBoxes[chosenBox].distance + 99999;
                }
                else {
                    testDistance = gridBoxes[chosenBox].distance + 1;
                }

                if (testDistance < gridBoxes[leftIndex].distance) {
                    gridBoxes[leftIndex].distance = testDistance;
                    gridBoxes[leftIndex].previousBoxRow = gridBoxes[chosenBox].row;
                    gridBoxes[leftIndex].previousBoxCol = gridBoxes[chosenBox].col;
                }

            }
        }

        if (searchRight == true) {
            var rightIndex = (findBoxNumByRowCol(gridBoxes[chosenBox].row, gridBoxes[chosenBox].col + 1) - 1);
            var testDistance;
            if (gridBoxes[rightIndex].visited == false) {
                if (gridBoxes[rightIndex].isWall == true) {
                    testDistance = gridBoxes[chosenBox].distance + 99999;
                }
                else {
                    testDistance = gridBoxes[chosenBox].distance + 1;
                }

                if (testDistance < gridBoxes[rightIndex].distance) {
                    gridBoxes[rightIndex].distance = testDistance;
                    gridBoxes[rightIndex].previousBoxRow = gridBoxes[chosenBox].row;
                    gridBoxes[rightIndex].previousBoxCol = gridBoxes[chosenBox].col;
                }

            }
        }

        if (searchBottom == true) {
            var bottomIndex = (findBoxNumByRowCol(gridBoxes[chosenBox].row + 1, gridBoxes[chosenBox].col) - 1);
            var testDistance;
            if (gridBoxes[bottomIndex].visited == false) {
                if (gridBoxes[bottomIndex].isWall == true) {
                    testDistance = gridBoxes[chosenBox].distance + 99999;
                }
                else {
                    testDistance = gridBoxes[chosenBox].distance + 1;
                }

                if (testDistance < gridBoxes[bottomIndex].distance) {
                    gridBoxes[bottomIndex].distance = testDistance;
                    gridBoxes[bottomIndex].previousBoxRow = gridBoxes[chosenBox].row;
                    gridBoxes[bottomIndex].previousBoxCol = gridBoxes[chosenBox].col;
                }

            }
        }
    }

    if (changeColor == false) {
        changeColor = true;
        changeAt = counter;
    }

}

var stack = [];
stack.push(1);
var stack2 = [];

function storeShortestPath (endBox) {
    if (gridBoxes[endBox - 1].previousBoxRow != -1) {
        var currentBox = gridBoxes[endBox - 1];

        while (currentBox != null) {

            if (currentBox.boxNum != startBoxNumber && currentBox.boxNum != endBoxNumber && currentBox.boxNum != middleBoxNumber) {
                stack.push(currentBox);
            }

            if (currentBox.isStart == true) {
                currentBox = null;
            }
            else {
                currentBox = gridBoxes[findBoxNumByRowCol(currentBox.previousBoxRow, currentBox.previousBoxCol) - 1];
            }
        }
    }
}

function storeShortestPath2 (startBox, endBox) {
    if (gridBoxes[endBox - 1].previousBoxRow != -1) {
        var currentBox = gridBoxes[endBox - 1];

        while (currentBox != null) {

            if (currentBox.boxNum != startBoxNumber && currentBox.boxNum != endBoxNumber && currentBox.boxNum != middleBoxNumber) {

                if (endBox == middleBoxNumber) {
                    stack.push(currentBox);
                }
                else if (endBox == endBoxNumber) {
                    stack2.push(currentBox);
                }
            }

            if (currentBox.boxNum == startBox) {
                currentBox = null;
            }
            else {
                currentBox = gridBoxes[findBoxNumByRowCol(currentBox.previousBoxRow, currentBox.previousBoxCol) - 1];
            }
        }
    }
}

function updateShortestPath (endBox) {
    if (gridBoxes[endBox - 1].previousBoxRow != -1) {
        var currentBox = gridBoxes[endBox - 1];

        while (currentBox != null) {

            if (currentBox.boxNum != startBoxNumber && currentBox.boxNum != endBoxNumber && currentBox.boxNum != middleBoxNumber) {
                document.getElementById(currentBox.divId).setAttribute("style", "background-color: orange;");
            }

            if (currentBox.isStart == true) {
                currentBox = null;
            }
            else {
                currentBox = gridBoxes[findBoxNumByRowCol(currentBox.previousBoxRow, currentBox.previousBoxCol) - 1];
            }
        }
    }
}

var pace;
var secondStack = [];
var isEndFound = false;


function printPath() {
    setTimeout( function () {
        var currentBox = stack.pop();
        if (currentBox != null) {

            if (currentBox.boxNum != startBoxNumber && currentBox.boxNum != endBoxNumber && currentBox.boxNum != middleBoxNumber) {
                document.getElementById(currentBox.divId).setAttribute("style", "background-color: orange;");
            }

            if (currentBox.isStart == true) {
                currentBox = null;
            }
            else {
                currentBox = gridBoxes[findBoxNumByRowCol(currentBox.previousBoxRow, currentBox.previousBoxCol) - 1];
                printPath(currentBox);
            }
        }

        if (isCheckpointActive == false) {
            pace = (pathSpeed)/2;
        }
        else {
            pace = pathSpeed;
        }

    }, pace)
}

var i = 0;

function printVisual () {
    setTimeout( function () {
        var currentBox = visualQueue[i];
        if (currentBox != null) {
            i++;
            if (currentBox.boxNum != startBoxNumber && currentBox.boxNum != endBoxNumber && currentBox.boxNum != middleBoxNumber) {

                if (i <= changeAt) {
                    document.getElementById(currentBox.divId).setAttribute("style", "background-color: purple;");
                }
                else {
                    document.getElementById(currentBox.divId).setAttribute("style", "background-color: violet;");
                }
                
            }
            printVisual();
        }
        else {

            if (isCheckpointActive == true) {
                stack = [];
                resetAlgoStatsWithCheckpoint();
                runDijkstraAlgo(middleBoxNumber, endBoxNumber);
                storeShortestPath(endBoxNumber);
                resetAlgoStatsWithCheckpoint();
                runDijkstraAlgo(startBoxNumber, middleBoxNumber);
                storeShortestPath(middleBoxNumber);
            }

            printPath();
            visualQueue = [];
            i = 0;
        }
    }, visualizerSpeed)
}

function callDijkstra () {
    
    if (algoReset == false && mazeSetupDone == true) {

        if (isCheckpointActive == true) {
            
            if (visualizerToggle == true) {
                runDijkstraAlgo(startBoxNumber, middleBoxNumber);

                if (isPathFound == true) {
                    storeShortestPath(middleBoxNumber);
                    resetAlgoStatsWithCheckpoint();
                    runDijkstraAlgo(middleBoxNumber, endBoxNumber);

                    if (isPathFound == true) {
                        storeShortestPath(endBoxNumber);

                        printVisual();
                    }
                }
            }
            else {
                resetAlgoStatsWithCheckpoint();
                runDijkstraAlgo(middleBoxNumber, endBoxNumber);

                if (isPathFound == true) {
                    storeShortestPath(endBoxNumber);
                    resetAlgoStatsWithCheckpoint();
                    runDijkstraAlgo(startBoxNumber, middleBoxNumber);

                    if (isPathFound == true) {
                        storeShortestPath(middleBoxNumber);
                        printPath();
                    }
                }
            }

            
            
        }
        else {
            runDijkstraAlgo(startBoxNumber, endBoxNumber);

            if (isPathFound == true) {
                storeShortestPath(endBoxNumber);

                if (visualizerToggle == true) {
                    printVisual();
                }
                else {
                    printPath();
                }
            }
        }
        algoReset = true;
    }
}


function reset () {
    //location.reload();
    largeDiv = document.getElementById("main-div");
    middleBoxNumber = -1;
    isCheckpointActive = false;
    algoReset = false;
    visualizerToggle = true;
    pathSpeed = 100;
    visualizerSpeed = 0;
    currentSpeed = 3;
    currentMaze = 0;

    isDijkstraChosen = false;
    isAStarChosen = false;

    isPathFound = false;

    currentRow = 0;
    currentCol = 1;

    for (var i = 1; i <= gridSize; i++) {
        gridBoxes[i - 1].isWall = false;
        gridBoxes[i - 1].isStart = false;
        gridBoxes[i - 1].isFinish = false;
        gridBoxes[i - 1].isCheckpoint = false;
        gridBoxes[i - 1].distance = 99999;
        gridBoxes[i - 1].previousBoxRow = -1;
        gridBoxes[i - 1].previousBoxCol = -1;
        gridBoxes[i - 1].visited = false;
        gridBoxes[i - 1].row = -1;
        gridBoxes[i - 1].col = -1;
        gridBoxes[i - 1].f = -1;
        gridBoxes[i - 1].g = -1;

        gridBoxes[i - 1].row = currentRow;
        gridBoxes[i - 1].col = currentCol;

        document.getElementById(gridBoxes[i - 1].divId).setAttribute("style", "background-color: white;");

        if (i == (startBoxStartRow * numColumns) + startBoxStartCol) {
            gridBoxes[i - 1].isStart = true;
            startBoxNumber = (startBoxStartRow * numColumns) + startBoxStartCol;
            document.getElementById(gridBoxes[i - 1].divId).setAttribute("style", "background-color: green;");
        }
        if (i == (endBoxStartRow * numColumns) + endBoxStartCol) {
            gridBoxes[i - 1].isFinish = true;
            endBoxNumber = (endBoxStartRow * numColumns) + endBoxStartCol;
            document.getElementById(gridBoxes[i - 1].divId).setAttribute("style", "background-color: red;");
        }

        currentCol++;

        if (currentCol == numColumns + 1) {
            currentCol = 1;
            currentRow++;
        }
    }

    wallClick = false;

    pressDownStart = false;
    pressDownEnd = false;
    pressDownCheckpoint = false;

    prevRow = 0;
    prevCol = 0;

    pressDownWall = false;

    currentNumberStart = 0;
    currentNumberEnd = 0;
    currentNumberCheckpoint = 0;

    visualQueue = [];
    changeColor = false;
    counter = 0;
    stack = [];
    stack2 = [];

    secondStack = [];
    isEndFound = false;

    i = 0;
    
    mazeSetupDone = true;
    w = 0;

    document.getElementById('insertCheckpoint').innerHTML = "Insert Checkpoint";
    document.getElementById('dijkstraBtn').innerHTML = "Choose Algorithm";
    document.getElementById('visualizerToggle').innerHTML = "Visualizer: On";
    document.getElementById('speedBtn').innerHTML = "Speed: Fast";
    document.getElementById('mazeBtn').innerHTML = "Maze Options";
}

function resetAlgoStats () {

    var z;
    isPathFound = false;
    for (z = 0; z < gridSize; z++) {
        gridBoxes[z].distance = 99999;
        gridBoxes[z].previousBoxRow = -1;
        gridBoxes[z].previousBoxCol = -1;
        gridBoxes[z].visited = false;
        gridBoxes[z].f = -1;
        gridBoxes[z].g = -1;
        document.getElementById(gridBoxes[z].divId).setAttribute("style", "background-color: white;");

        if (gridBoxes[z].isWall == true) {
            document.getElementById(gridBoxes[z].divId).setAttribute("style", "background-color: black;");
        }
        if (gridBoxes[z].isStart == true) {
            document.getElementById(gridBoxes[z].divId).setAttribute("style", "background-color: green;");
        }
        if (gridBoxes[z].isFinish == true) {
            document.getElementById(gridBoxes[z].divId).setAttribute("style", "background-color: red;");
        }
        if (gridBoxes[z].isCheckpoint == true) {
            document.getElementById(gridBoxes[z].divId).setAttribute("style", "background-color: blue;");
        }
    }

}

function resetAlgoStatsWithCheckpoint () {
    var z;
    isPathFound = false;
    for (z = 0; z < gridSize; z++) {
        gridBoxes[z].distance = 99999;
        gridBoxes[z].previousBoxRow = -1;
        gridBoxes[z].previousBoxCol = -1;
        gridBoxes[z].visited = false;
        gridBoxes[z].f = -1;
        gridBoxes[z].g = -1;
    }
}

document.getElementById('insertCheckpoint').addEventListener('click', function () {
    if (isCheckpointActive == false && algoReset == false) {
        if (gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isStart == false && gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isFinish == false) {
            gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isWall = false;
            gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isCheckpoint = true;
            document.getElementById(convertToId(((middleBoxStartRow * numColumns) + middleBoxStartCol))).setAttribute("style", "background-color: blue;");
        }
        else {
            gridBoxes[((startBoxStartRow * numColumns) + startBoxStartCol) - 1].isWall = false;
            gridBoxes[((startBoxStartRow * numColumns) + startBoxStartCol) - 1].isStart = true;
            startBoxNumber = ((startBoxStartRow * numColumns) + startBoxStartCol);
            document.getElementById(convertToId(((startBoxStartRow * numColumns) + startBoxStartCol))).setAttribute("style", "background-color: green;");
    
            gridBoxes[((endBoxStartRow * numColumns) + endBoxStartCol) - 1].isWall = false;
            gridBoxes[((endBoxStartRow * numColumns) + endBoxStartCol) - 1].isFinish = true;
            endBoxNumber = ((endBoxStartRow * numColumns) + endBoxStartCol);
            document.getElementById(convertToId(((endBoxStartRow * numColumns) + endBoxStartCol))).setAttribute("style", "background-color: red;");
    
            gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isWall = false;
            gridBoxes[((middleBoxStartRow * numColumns) + middleBoxStartCol) - 1].isCheckpoint = true;
            document.getElementById(convertToId(((middleBoxStartRow * numColumns) + middleBoxStartCol))).setAttribute("style", "background-color: blue;");
        }
        middleBoxNumber = ((middleBoxStartRow * numColumns) + middleBoxStartCol);
        isCheckpointActive = true;
        document.getElementById('insertCheckpoint').innerHTML = "Delete Checkpoint";
    }
    else if (isCheckpointActive == true && algoReset == false) {
        gridBoxes[middleBoxNumber - 1].isCheckpoint = false;
        document.getElementById(convertToId(middleBoxNumber)).setAttribute("style", "background-color: white;");
        middleBoxNumber = -1;
        document.getElementById('insertCheckpoint').innerHTML = "Insert Checkpoint";
        isCheckpointActive = false;
    }
});

document.getElementById('reset').addEventListener('click', function () {
    reset();
});

function toggleVisualizer () {

    if (stack.length == 0) {
        if (visualizerToggle == true) {
            visualizerToggle = false;
            document.getElementById('visualizerToggle').innerHTML = "Visualizer: Off";
        }
        else {
            visualizerToggle = true;
            document.getElementById('visualizerToggle').innerHTML = "Visualizer: On";
        }
    }
    
}


function maze1 () {

    // erase current start and end box (and middle if it exists)
    if (isCheckpointActive == true) {
        document.getElementById(convertToId(middleBoxNumber)).setAttribute("style", "background-color: white;");
        document.getElementById('insertCheckpoint').innerHTML = "Insert Checkpoint";
        gridBoxes[middleBoxNumber - 1].isCheckpoint = false;
        middleBoxNumber = -1;
        isCheckpointActive = false;
    }

    // set start
    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[startBoxNumber - 1].isStart = false;

    startBoxNumber = 1;
    gridBoxes[startBoxNumber - 1].isStart = true;
    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: green;");

    // set finish
    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[endBoxNumber - 1].isFinish = false;

    endBoxNumber = gridSize;
    gridBoxes[gridSize - 1].isFinish = true;
    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: red;");


    for (var i = 0; i < gridSize; i++) {
        
        if (gridBoxes[i].row == 0 && gridBoxes[i].col > 2 ) {
            gridBoxes[i].isWall = true;
        }
        else if (gridBoxes[i].row < 23 && gridBoxes[i].col == 69 ) {
            gridBoxes[i].isWall = true;
        }
        else if ( gridBoxes[i].col == 1 && gridBoxes[i].row > 1 || gridBoxes[i].row == 24 && gridBoxes[i].col != 68) {
            gridBoxes[i].isWall = true;
        }
        
        else if(gridBoxes[i].row == 5 && gridBoxes[i].col > 3 && gridBoxes[i].col < 69 && gridBoxes[i].col != 12 && gridBoxes[i].col != 56 && gridBoxes[i].col != 35) {
            gridBoxes[i].isWall = true;
        }
        else if(gridBoxes[i].col == 4 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }
        else if(gridBoxes[i].col == 34 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }
        else if(gridBoxes[i].col == 36 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }
        else if(gridBoxes[i].col == 57 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }

        else if(gridBoxes[i].col == 55 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }

        else if(gridBoxes[i].col == 13 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }

        else if(gridBoxes[i].col == 11 && (gridBoxes[i].row <= 15 && gridBoxes[i].row > 5 )) {
            gridBoxes[i].isWall = true;
        }
        else if(gridBoxes[i].row == 16 && gridBoxes[i].col > 3 && gridBoxes[i].col < 69 && gridBoxes[i].col != 12 && gridBoxes[i].col != 56 && gridBoxes[i].col != 35) {
            gridBoxes[i].isWall = true;
        }

        else if (gridBoxes[i].isStart == false && gridBoxes[i].isFinish == false) {
            gridBoxes[i].isWall = false;
        }

    }

}

function maze2 () {
    if (isCheckpointActive == true) {
        document.getElementById(convertToId(middleBoxNumber)).setAttribute("style", "background-color: white;");
        document.getElementById('insertCheckpoint').innerHTML = "Insert Checkpoint";
        gridBoxes[middleBoxNumber - 1].isCheckpoint = false;
        middleBoxNumber = -1;
        isCheckpointActive = false;
    }

    var columnWidth = Math.floor(numColumns/10);
    var rowHeight = Math.floor(numRows/5);

    var firstColumn = columnWidth;
    var secondColumn = firstColumn + columnWidth;
    var thirdColumn = secondColumn + columnWidth;
    var fourthColumn = thirdColumn + columnWidth;
    var fifthColumn = fourthColumn + columnWidth;
    var sixthColumn = fifthColumn + columnWidth;
    var seventhColumn = sixthColumn + columnWidth;
    var eighthColumn = seventhColumn + columnWidth;
    var ninthColumn = eighthColumn + columnWidth;
    var tenthColumn = ninthColumn + columnWidth;

    var firstRow = rowHeight;
    var secondRow = firstRow + rowHeight;
    var thirdRow = secondRow + rowHeight;
    var fourthRow = thirdRow + rowHeight;
    var fifthRow = fourthRow + rowHeight;


    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[startBoxNumber - 1].isStart = false;

    startBoxNumber = (1 * numColumns) + 2;
    gridBoxes[startBoxNumber - 1].isStart = true;
    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: green;");

    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[endBoxNumber - 1].isFinish = false;

    endBoxNumber = ((fifthRow - 2) * numColumns) + (tenthColumn - 1);
    gridBoxes[endBoxNumber - 1].isFinish = true;
    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: red;");

    for (var i = 0; i < gridSize; i++) {

        //row
        if (gridBoxes[i].row == firstRow) {

            if (gridBoxes[i].col >= firstColumn && gridBoxes[i].col <= secondColumn+5 && gridBoxes[i].col >= secondColumn && gridBoxes[i].col <= fourthColumn) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= firstColumn+2 && gridBoxes[i].col <= secondColumn) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= secondColumn && gridBoxes[i].col <= thirdColumn) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= seventhColumn && gridBoxes[i].col <= ninthColumn) {
                gridBoxes[i].isWall = true;
            }
            else {
                gridBoxes[i].isWall = false;
            }

        }
        else if (gridBoxes[i].row == firstRow-3) {

            if (gridBoxes[i].col >= firstColumn && gridBoxes[i].col <= tenthColumn) {
                gridBoxes[i].isWall = true;
            }
            
            else {
                gridBoxes[i].isWall = false;
            }

        }
        else if (gridBoxes[i].row == secondRow) {

            if (gridBoxes[i].col >= 0 && gridBoxes[i].col <= fifthColumn) {
                gridBoxes[i].isWall = true;
            }
        
            else if (gridBoxes[i].col >= ninthColumn && gridBoxes[i].col <= tenthColumn) {
                gridBoxes[i].isWall = true;
            }
            else {
                gridBoxes[i].isWall = false;
            }

        }
        else if (gridBoxes[i].row == thirdRow) {

            if (gridBoxes[i].col >= 0 && gridBoxes[i].col <= firstColumn+3) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= thirdColumn && gridBoxes[i].col <= fourthColumn) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= fifthColumn && gridBoxes[i].col <= seventhColumn-2) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= seventhColumn && gridBoxes[i].col <= eighthColumn) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].col >= eighthColumn+1 && gridBoxes[i].col <= ninthColumn) {
                gridBoxes[i].isWall = true;
            }
            else {
                gridBoxes[i].isWall = false;
            }

        }
        // else if (gridBoxes[i].row == fourthRow) {

        //     if (gridBoxes[i].col >= firstColumn-2 && gridBoxes[i].col <= fourthColumn) {
        //         gridBoxes[i].isWall = true;
        //     }
        //     else if (gridBoxes[i].col >= fifthColumn && gridBoxes[i].col <= seventhColumn) {
        //         gridBoxes[i].isWall = true;
        //     }
        //     else if (gridBoxes[i].col >= eighthColumn && gridBoxes[i].col <= tenthColumn) {
        //         gridBoxes[i].isWall = true;
        //     }
        //     else {
        //         gridBoxes[i].isWall = false;
        //     }

        // }
        else if (gridBoxes[i].row == fifthRow-2) {

            if (gridBoxes[i].col >=0 && gridBoxes[i].col <= tenthColumn-2) {
                gridBoxes[i].isWall = true;
            }
            else {
                gridBoxes[i].isWall = false;
            }

        }
        
        else if ((gridBoxes[i].row == 0 && gridBoxes[i].col <= tenthColumn) || (gridBoxes[i].row == fifthRow && gridBoxes[i].col <= tenthColumn) || (gridBoxes[i].col == 1 && gridBoxes[i].row <= fifthRow) || (gridBoxes[i].col == tenthColumn && gridBoxes[i].row <= fifthRow)) {
            gridBoxes[i].isWall = true;
        }
        else if (gridBoxes[i].isStart == false && gridBoxes[i].isFinish == false) {
            gridBoxes[i].isWall = false;
        }

        // column
        if (gridBoxes[i].col == firstColumn) {

            if (gridBoxes[i].row >= firstRow && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == secondColumn) {

            
        }
        else if (gridBoxes[i].col == thirdColumn-2) {

            if(gridBoxes[i].row==8){
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].row >= thirdRow && gridBoxes[i].row <= fourthRow+2) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == thirdColumn-1) {

            if (gridBoxes[i].row >= 0 && gridBoxes[i].row <=firstRow+1 && gridBoxes[i].row <=firstRow+1 && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }
            else if(gridBoxes[i].row==8){
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].row >= thirdRow && gridBoxes[i].row <= fourthRow+2) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == thirdColumn) {

            if (gridBoxes[i].row >= 0 && gridBoxes[i].row <=firstRow+1 && gridBoxes[i].row <=firstRow+1 && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }
            else if(gridBoxes[i].row==8){
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].row >= thirdRow && gridBoxes[i].row <= fourthRow+2) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == fourthColumn) {

          

        }
        else if (gridBoxes[i].col == fifthColumn) {

            if (gridBoxes[i].row >= firstRow-1 && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].row >= thirdRow && gridBoxes[i].row <= fourthRow) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == sixthColumn) {

            
        }
        else if (gridBoxes[i].col == seventhColumn) {

            if (gridBoxes[i].row >= firstRow && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }
            else if (gridBoxes[i].row >= thirdRow && gridBoxes[i].row <= fourthRow+1) {
                gridBoxes[i].isWall = true;
            }

        }
        else if (gridBoxes[i].col == eighthColumn) {

            if (gridBoxes[i].row >= firstRow && gridBoxes[i].row <= secondRow) {
                gridBoxes[i].isWall = true;
            }
        }
        else if (gridBoxes[i].col == ninthColumn) {

            

        }

        if ((gridBoxes[i].row == firstRow && gridBoxes[i].col == 1) || (gridBoxes[i].row == secondRow && gridBoxes[i].col == 1) || (gridBoxes[i].row == fourthRow && gridBoxes[i].col == 1) || 
        (gridBoxes[i].row == firstRow && gridBoxes[i].col == tenthColumn) || (gridBoxes[i].row == secondRow && gridBoxes[i].col == tenthColumn) || (gridBoxes[i].row == thirdRow && gridBoxes[i].col == tenthColumn) || 
        gridBoxes[i].row == numRows - 1) {
            gridBoxes[i].isWall = true;
        }

        if (gridBoxes[i].col > tenthColumn) {
            gridBoxes[i].isWall = false;
        }
        

    }
}

function maze3 () {

    if (isCheckpointActive == true) {
        document.getElementById(convertToId(middleBoxNumber)).setAttribute("style", "background-color: white;");
        document.getElementById('insertCheckpoint').innerHTML = "Insert Checkpoint";
        gridBoxes[middleBoxNumber - 1].isCheckpoint = false;
        middleBoxNumber = -1;
        isCheckpointActive = false;
    }

    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[startBoxNumber - 1].isStart = false;

    startBoxNumber = 1;
    gridBoxes[startBoxNumber - 1].isStart = true;
    document.getElementById(convertToId(startBoxNumber)).setAttribute("style", "background-color: green;");

    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: white;");
    gridBoxes[endBoxNumber - 1].isFinish = false;

    endBoxNumber = gridSize;
    gridBoxes[gridSize - 1].isFinish = true;
    document.getElementById(convertToId(endBoxNumber)).setAttribute("style", "background-color: red;");

    var randomNum;

    for (var i = 0; i < gridSize; i++) {

        if (gridBoxes[i].isStart == false && gridBoxes[i].isFinish == false) {

            randomNum = Math.random();

            if (randomNum <= 0.85) {
                gridBoxes[i].isWall = false;
            }
            else {
                gridBoxes[i].isWall = true;
            }

        }

        if (i == 1 || i == numColumns || i == endBoxNumber - 2 || i == endBoxNumber - 1 - numColumns) {
            gridBoxes[i].isWall = false;
        }

    }
}

function setAllWhite () {
    for (var i = 0; i < gridSize; i++) {
        document.getElementById(gridBoxes[i].divId).setAttribute("style", "background-color: white;");
    }
}

var mazeSetupDone = true;
var w = 0;
function visualMazeSetup () {
    setTimeout( function () {
        mazeSetupDone = false;
        if (w < gridSize) {
            if (gridBoxes[w].isStart == true) {
                document.getElementById(gridBoxes[w].divId).setAttribute("style", "background-color: green;");
            }
            else if (gridBoxes[w].isFinish == true) {
                document.getElementById(gridBoxes[w].divId).setAttribute("style", "background-color: red;");
            }
            else if (gridBoxes[w].isWall == true) {
                document.getElementById(gridBoxes[w].divId).setAttribute("style", "background-color: black;");
            }
            w++;
            visualMazeSetup();
        }
        else {
            w = 0;
            mazeSetupDone = true;
        }
    }, visualizerSpeed)
}

function mazeButton () {
    if (stack.length == 0 && algoReset == false && mazeSetupDone == true) {
          
        if (currentMaze == 1) {
            setAllWhite();
            maze1();
            document.getElementById('mazeBtn').innerHTML = "Maze 1";
            visualMazeSetup();
        }
        else if (currentMaze == 2) {
            setAllWhite();
            maze2();
            document.getElementById('mazeBtn').innerHTML = "Maze 2";
            visualMazeSetup();
        }
        else if (currentMaze == 3) {
            setAllWhite();
            maze3();
            document.getElementById('mazeBtn').innerHTML = "Random";
            visualMazeSetup();
        }
    }
}

function pressMaze1 () {
    currentMaze = 1;
    mazeButton();
}

function pressMaze2 () {
    currentMaze = 2;
    mazeButton();
}

function pressMaze3 () {
    currentMaze = 3;
    mazeButton();
}


function chooseAStar () {
    isAStarChosen = true;
    var aStar = "<sup>*</sup>";
    document.getElementById('dijkstraBtn').innerHTML = 'Run A* Search';

}



function heuristicFunction (row1, col1, row2, col2) {
    var a = row2 - row1;
    var b = col2 - col1;

    var distance = 10 * (Math.abs(a) + Math.abs(b));

    return distance;
}

function aStarAlgo (startBox, endBox) {
    var open = [];
    var close = [];
    var openLength = 0;

    var currentF = heuristicFunction(gridBoxes[startBox - 1].row + 1, gridBoxes[startBox - 1].col, gridBoxes[endBox - 1].row + 1, gridBoxes[endBox - 1].col);
    gridBoxes[startBox - 1].f = currentF;
    gridBoxes[startBox - 1].g = 0;
    open.push(gridBoxes[startBox - 1]);
    openLength++;

    for (var i = 0; i < gridSize; i++) {
        if (i != startBox - 1) {
            gridBoxes[i].f = 99999;
            gridBoxes[i].g = 99999;
        }
    }

    while(openLength != 0) {

        var lowestF = 99999;
        var chosenBox = null;
        var index = -1;
        for (var i = 0; i < openLength; i++) {
            if (open[i].f < lowestF) {
                lowestF = open[i].f;
                chosenBox = open[i];
                index = i;
            }
        }

        if (chosenBox.boxNum == endBox) {
            isPathFound = true;
            break;
        }

        if (chosenBox.boxNum != startBox) {
            visualQueue.push(chosenBox);
            counter++;
        }

        open.splice(index, 1);
        openLength--;
        close.push(chosenBox);

        var searchTop = false;
        var searchLeft = false;
        var searchBottom = false;
        var searchRight = false;

        if (chosenBox.row > 0 && chosenBox.row < (numRows - 1) && chosenBox.col > 1 && chosenBox.col < numColumns) {
            searchTop = true;
            searchLeft = true;
            searchBottom = true;
            searchRight = true;
        }
        else if (chosenBox.row == 0 && chosenBox.col == 1) {
            searchRight = true;
            searchBottom = true;
        }
        else if (chosenBox.row == (numRows - 1) && chosenBox.col == 1) {
            searchTop = true;
            searchRight = true;
        }
        else if (chosenBox.row == 0 && chosenBox.col == numColumns) {
            searchLeft = true;
            searchBottom = true;
        }
        else if (chosenBox.row == (numRows - 1) && chosenBox.col == numColumns) {
            searchLeft = true;
            searchTop = true;
        }
        else if (chosenBox.row == 0 && chosenBox.col > 1 && chosenBox.col < numColumns) {
            searchLeft = true;
            searchRight = true;
            searchBottom = true;
        }
        else if (chosenBox.row == (numRows - 1) && chosenBox.col > 1 && chosenBox.col < numColumns) {
            searchLeft = true;
            searchRight = true;
            searchTop = true;
        }
        else if (chosenBox.col == 1 && chosenBox.row > 0 && chosenBox.row < (numRows - 1)) {
            searchTop = true;
            searchRight = true;
            searchBottom = true;
        }
        else if (chosenBox.col == numColumns && chosenBox.row > 0 && chosenBox.row < (numRows - 1)) {
            searchTop = true;
            searchLeft = true;
            searchBottom = true;
        }

        if (searchTop == true) {
            var newDistance;
            var tentativeScore;
            var topIndex = findBoxNumByRowCol(chosenBox.row - 1, chosenBox.col) - 1;
            if (gridBoxes[topIndex].isWall == true) {
                newDistance = 99999;
            }
            else {
                newDistance = 1;
            }

            tentativeScore = chosenBox.g + newDistance;

            if (tentativeScore < gridBoxes[topIndex].g) {
                gridBoxes[topIndex].previousBoxRow = chosenBox.row;
                gridBoxes[topIndex].previousBoxCol = chosenBox.col;

                gridBoxes[topIndex].g = tentativeScore;
                gridBoxes[topIndex].f = gridBoxes[topIndex].g + heuristicFunction(gridBoxes[topIndex].row + 1, gridBoxes[topIndex].col, gridBoxes[endBox - 1].row + 1, gridBoxes[endBox - 1].col);

                var existsInA = false;
                for (var i = 0; i < openLength; i++) {
                    if (open[i].boxNum == gridBoxes[topIndex].boxNum) {
                        existsInA = true;
                    }
                }

                if (existsInA == false) {
                    open.push(gridBoxes[topIndex]);
                    openLength++;
                    console.log("row: " + gridBoxes[topIndex].row + " col: " + gridBoxes[topIndex].col + "    success");
                    console.log("f: " + gridBoxes[topIndex].f);
                }
            }
        }

        if (searchLeft == true) {
            var newDistance;
            var tentativeScore;
            var leftIndex = findBoxNumByRowCol(chosenBox.row, chosenBox.col - 1) - 1;
            if (gridBoxes[leftIndex].isWall == true) {
                newDistance = 99999;
            }
            else {
                newDistance = 1;
            }

            tentativeScore = chosenBox.g + newDistance;

            if (tentativeScore < gridBoxes[leftIndex].g) {
                gridBoxes[leftIndex].previousBoxRow = chosenBox.row;
                gridBoxes[leftIndex].previousBoxCol = chosenBox.col;

                gridBoxes[leftIndex].g = tentativeScore;
                gridBoxes[leftIndex].f = gridBoxes[leftIndex].g + heuristicFunction(gridBoxes[leftIndex].row + 1, gridBoxes[leftIndex].col, gridBoxes[endBox - 1].row + 1, gridBoxes[endBox - 1].col);

                var existsInA = false;
                for (var i = 0; i < openLength; i++) {
                    if (open[i].boxNum == gridBoxes[leftIndex].boxNum) {
                        existsInA = true;
                    }
                }

                if (existsInA == false) {
                    open.push(gridBoxes[leftIndex]);
                    openLength++;
                    console.log("row: " + gridBoxes[leftIndex].row + " col: " + gridBoxes[leftIndex].col + "    success");
                    console.log("f: " + gridBoxes[leftIndex].f);
                }
            }
        }

        if (searchBottom == true) {
            var newDistance;
            var tentativeScore;
            var bottomIndex = findBoxNumByRowCol(chosenBox.row + 1, chosenBox.col) - 1;
            if (gridBoxes[bottomIndex].isWall == true) {
                newDistance = 99999;
            }
            else {
                newDistance = 1;
            }

            tentativeScore = chosenBox.g + newDistance;

            if (tentativeScore < gridBoxes[bottomIndex].g) {
                gridBoxes[bottomIndex].previousBoxRow = chosenBox.row;
                gridBoxes[bottomIndex].previousBoxCol = chosenBox.col;

                gridBoxes[bottomIndex].g = tentativeScore;
                gridBoxes[bottomIndex].f = gridBoxes[bottomIndex].g + heuristicFunction(gridBoxes[bottomIndex].row + 1, gridBoxes[bottomIndex].col, gridBoxes[endBox - 1].row + 1, gridBoxes[endBox - 1].col);

                var existsInA = false;
                for (var i = 0; i < openLength; i++) {
                    if (open[i].boxNum == gridBoxes[bottomIndex].boxNum) {
                        existsInA = true;
                    }
                }

                if (existsInA == false) {
                    open.push(gridBoxes[bottomIndex]);
                    openLength++;
                    console.log("row: " + gridBoxes[bottomIndex].row + " col: " + gridBoxes[bottomIndex].col + "    success");
                    console.log("f: " + gridBoxes[bottomIndex].f);
                }
            }
        }

        if (searchRight == true) {
            var newDistance;
            var tentativeScore;
            var rightIndex = findBoxNumByRowCol(chosenBox.row, chosenBox.col + 1) - 1;
            if (gridBoxes[rightIndex].isWall == true) {
                newDistance = 99999;
            }
            else {
                newDistance = 1;
            }

            tentativeScore = chosenBox.g + newDistance;

            if (tentativeScore < gridBoxes[rightIndex].g) {
                gridBoxes[rightIndex].previousBoxRow = chosenBox.row;
                gridBoxes[rightIndex].previousBoxCol = chosenBox.col;

                gridBoxes[rightIndex].g = tentativeScore;
                gridBoxes[rightIndex].f = gridBoxes[rightIndex].g + heuristicFunction(gridBoxes[rightIndex].row + 1, gridBoxes[rightIndex].col, gridBoxes[endBox - 1].row + 1, gridBoxes[endBox - 1].col);

                var existsInA = false;
                for (var i = 0; i < openLength; i++) {
                    if (open[i].boxNum == gridBoxes[rightIndex].boxNum) {
                        existsInA = true;
                    }
                }

                if (existsInA == false) {
                    open.push(gridBoxes[rightIndex]);
                    openLength++;
                    console.log("row: " + gridBoxes[rightIndex].row + " col: " + gridBoxes[rightIndex].col + "    success");
                    console.log("f: " + gridBoxes[rightIndex].f);
                }
            }
        }
    }

    if (changeColor == false) {
        changeColor = true;
        changeAt = counter;
    }
}


document.getElementById('dijkstraBtn').addEventListener('click', function () {
    if (isDijkstraChosen == true && algoReset == false) {
        callDijkstra();
    }
    else if (isAStarChosen == true && algoReset == false) {
        if (algoReset == false && mazeSetupDone == true) {

            if (isCheckpointActive == true) {
                
                if (visualizerToggle == true) {
                    aStarAlgo(startBoxNumber, middleBoxNumber);

                    if (isPathFound == true) {
                        storeShortestPath(middleBoxNumber);
                        resetAlgoStatsWithCheckpoint();
                        aStarAlgo(middleBoxNumber, endBoxNumber);

                        if (isPathFound == true) {
                            storeShortestPath(endBoxNumber);
    
                            printVisual();
                        }
                    }
                }
                else {
                    resetAlgoStatsWithCheckpoint();
                    aStarAlgo(middleBoxNumber, endBoxNumber);

                    if (isPathFound == true) {
                        storeShortestPath(endBoxNumber);
                        resetAlgoStatsWithCheckpoint();
                        aStarAlgo(startBoxNumber, middleBoxNumber);

                        if (isPathFound == true) {
                            storeShortestPath(middleBoxNumber);
                            printPath();
                        }
                    }
                }
            }
            else {
                aStarAlgo(startBoxNumber, endBoxNumber);

                if (isPathFound == true) {
                    storeShortestPath(endBoxNumber);
    
                    if (visualizerToggle == true) {
                        printVisual();
                    }
                    else {
                        printPath();
                    }
                }
            }
            algoReset = true;
        }
    }
    
});





function titleClick () {
    document.querySelector('.modal1').setAttribute("style", "display: flex;");
    stack.push(1);
}