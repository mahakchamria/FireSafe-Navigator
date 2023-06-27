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

        // for each neighbor do the following
        var searchTop = false;
        var searchLeft = false;
        var searchBottom = false;
        var searchRight = false;

        // Neighbors depend on location of box
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
