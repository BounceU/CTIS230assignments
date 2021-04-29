var canvas = document.getElementById('predPreyCanvas');
var ctx = canvas.getContext('2d');

// Each cell will take the form of [health, state, nextHealth, nextState]
// We go through each cell and decide where it's gonna move, putting that into it's next state.
// When we test against a cell, we will test against its "next state/health" if it has them.
// The states are as follows:
// 0 - Dead cell        |   Always has 0 health, doesn't interact   
// 1 - Prey cell        |   Health counts up from 0 to a number and when it reaches that number it reproduces. If it can't reproduce right now, its health goes down by 10
// 2 - Predator Cell    |   Health always counts down to 0 from a number and when it reaches 0 the predator dies. If its health goes above that number it reproduces. Predators gain health by eating prey

// To make the simulation interesting I am going to make it so that neither species can die out.
// Reproduction occurs when a species moves to a new cell, passes its threshold, and spawns a copy of itself where it moved from. A newly spawned cell doesn't move this iteration

var cells = [];

var width = 100;
var height = 100;

canvas.width = width;
canvas.height = height;
canvas.style.imageRendering = "pixelated";

var preyOdds = 0.2;
var predOdds = 0.01;
var deadOdds = 0.4;

let preyHealthVal = 20;
let predHealthVal = 20;

var running = false;

var numRed = 0;
var numGreen = 0;

resetEverything();

function resetEverything() {
    cells = [];

    width = parseInt(document.getElementById("width").value);
    height = parseInt(document.getElementById("height").value);

    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = "pixelated";

    preyOdds = 0.2;
    predOdds = 0.01;
    deadOdds = 0.4;

    preyHealthVal = parseInt(document.getElementById("preyVal").value);
    predHealthVal = parseInt(document.getElementById("predVal").value);

    running = false;

    numRed = 0;
    numGreen = 0;
    // Create starting cells
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var currentCell = { health: 100, state: 0, nextHealth: -1, nextState: -1 };

            let decider = Math.random();
            if (decider < preyOdds) { // Prey
                currentCell.health = Math.random() * preyHealthVal / 2;
                currentCell.state = 1;
                numGreen++;
            } else if (decider < preyOdds + predOdds) { // Predator
                currentCell.health = predHealthVal;
                currentCell.state = 2;
                numRed++;
            } else { // Dead
                currentCell.health = 0;
                currentCell.state = 0;
            }


            cells.push(currentCell);
        }
    }
    constructCanvas(cells);
}





var worker = new Worker(URL.createObjectURL(new Blob(["(" + manipulateCells.toString() + ")()"], { type: 'text/javascript' })));


var t = setInterval(function() {
    if (running) {
        var sendToWorker = { useCells: cells, w: width, h: height, predHV: predHealthVal, preyHV: preyHealthVal, numGreen: numGreen, numRed: numRed };
        worker.postMessage(sendToWorker);
    }
}, 1000 / 15)

document.getElementById("butt").addEventListener("click", function(e) {
    if (running) {
        document.getElementById("butt").innerText = "Play";
        running = false;
    } else {
        document.getElementById("butt").innerText = "Pause";
        running = true;
    }
});

document.getElementById("reset").addEventListener("click", function(e) {
    running = false;
    document.getElementById("butt").innerText = "Start";
    resetEverything();
});

worker.onmessage = function(e) {
    var cellArray = e.data.cellArray;
    this.cells = cellArray;
    numRed = e.data.numRed;
    numGreen = e.data.numGreen;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            cells[x + y * width] = cellArray[x + y * width];
            cells[x + y * width].nextState = -1;
        }
    }
    var sendToWorker = { useCells: cells, w: width, h: height, predHV: predHealthVal, preyHV: preyHealthVal };
    // worker.postMessage(sendToWorker);
    //console.log("received data");
    constructCanvas(cells);
}


function constructCanvas(useCells) {

    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, width, height);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var cell = useCells[x + y * width];
            switch (cell.state) {
                case 0:
                    ctx.fillStyle = "rgb(51,51,51)";
                    break;
                case 1:
                    ctx.fillStyle = "rgb(0,200,0)";
                    break;
                case 2:
                    ctx.fillStyle = "rgb(200,0,0)";
                    break;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
}


function manipulateCells() {
    onmessage = function(e) {

        var cells = e.data.useCells;
        let width = e.data.w;
        let height = e.data.h;
        let predHealthVal = e.data.predHV;
        let preyHealthVal = e.data.preyHV;
        var numGreen = e.data.numGreen;
        var numRed = e.data.numRed;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var cell = cells[x + y * height];
                if (cell.nextState != -1 || cell.state === 0) continue;
                // Spaces it can move
                var movableSpaces = [];
                var upY = y - 1 < 0 ? height - 1 : y - 1;
                var leftX = x - 1 < 0 ? width - 1 : x - 1;
                var downY = y + 1 >= height ? 0 : y + 1;
                var rightX = x + 1 >= width ? 0 : x + 1;
                if (cell.state == 2) {
                    if (cells[leftX + upY * width].state < 2) {
                        let tempSpace = { x: leftX, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[x + upY * width].state < 2) {
                        let tempSpace = { x: x, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + upY * width].state < 2) {
                        let tempSpace = { x: rightX, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[leftX + y * width].state < 2) {
                        let tempSpace = { x: leftX, y: y };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + y * width].state < 2) {
                        let tempSpace = { x: rightX, y: y };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[leftX + downY * width].state < 2) {
                        let tempSpace = { x: leftX, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[x + downY * width].state < 2) {
                        let tempSpace = { x: x, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + downY * width].state < 2) {
                        let tempSpace = { x: rightX, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                } else {
                    if (cells[leftX + upY * width].state === 0) {
                        let tempSpace = { x: leftX, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[x + upY * width].state === 0) {
                        let tempSpace = { x: x, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + upY * width].state === 0) {
                        let tempSpace = { x: rightX, y: upY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[leftX + y * width].state === 0) {
                        let tempSpace = { x: leftX, y: y };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + y * width].state === 0) {
                        let tempSpace = { x: rightX, y: y };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[leftX + downY * width].state === 0) {
                        let tempSpace = { x: leftX, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[x + downY * width].state === 0) {
                        let tempSpace = { x: x, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                    if (cells[rightX + downY * width].state === 0) {
                        let tempSpace = { x: rightX, y: downY };
                        movableSpaces.push(tempSpace);
                    }
                }
                //

                if (movableSpaces.length != 0) { // If we can move somewhere
                    var movingTo = movableSpaces[Math.floor(Math.random() * movableSpaces.length)];
                    // console.log("Going to try to move to " + movingTo.x + ", " + movingTo.y);
                    if (cell.state == 2) {
                        if (cells[movingTo.x + movingTo.y * width].state == 1 && numGreen > 1) {
                            cell.health += cells[movingTo.x + movingTo.y * width].health;
                            cells[movingTo.x + movingTo.y * width].state = 0;
                            numGreen--;
                        } else if (numRed > 1 && cells[movingTo.x + movingTo.y * width].state != 1) {
                            cells[x + y * width].health -= 1;
                            if (cells[x + y * width].health < 0) {
                                cells[x + y * width].state = 0;
                                numRed--;
                                continue;
                            }
                        } else if (cells[movingTo.x + movingTo.y * width].state == 1) {
                            continue;
                        }

                        if (cell.health > predHealthVal) {
                            cells[movingTo.x + movingTo.y * width].health = cell.health / 2;
                            cells[x + y * width].health = cell.health / 2;
                            cells[movingTo.x + movingTo.y * width].state = 2;
                            cells[movingTo.x + movingTo.y * width].nextState = 1;
                            cells[x + y * width].nextState = 1;
                            numRed++;
                        } else {
                            cells[movingTo.x + movingTo.y * width].state = 2;
                            cells[movingTo.x + movingTo.y * width].health = cell.health;
                            cells[movingTo.x + movingTo.y * width].nextState = 1;
                            cells[x + y * width].state = 0;
                        }

                    } else {

                        cell.health += 1;
                        if (cell.health > preyHealthVal) {
                            cell.health /= 2;
                            cells[movingTo.x + movingTo.y * width].health = cell.health;
                            cells[x + y * width].health = cell.health;
                            cells[movingTo.x + movingTo.y * width].state = 1;
                            cells[movingTo.x + movingTo.y * width].nextState = 1;
                            cells[x + y * width].nextState = 1;
                            numGreen++;
                        } else {
                            cells[movingTo.x + movingTo.y * width].state = 1;
                            cells[movingTo.x + movingTo.y * width].health = cell.health;
                            cells[movingTo.x + movingTo.y * width].nextState = 1;
                            cells[x + y * width].state = 0;
                        }

                    }
                    continue;
                }

                if (cell.state == 2 && numRed > 1) {
                    cell.health -= 1;
                    if (cell.health < 0) {
                        cell.state = 0;
                        numRed--;
                    }
                    cells[x + y * width] = cell;
                } else {
                    cell.health += 1;
                    cells[x + y * width] = cell;
                }

            }
        }

        let returnData = { cellArray: cells, numRed: numRed, numGreen: numGreen };
        postMessage(returnData);

    }

}