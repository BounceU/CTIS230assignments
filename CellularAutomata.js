var currentScale = 1;
var arrayOfCells = [];
var width = 50;
var height = 50;

var d = new Date();

var running = false;


var tempIndex = 0;
document.querySelectorAll('.cell').forEach(item => {
    item.style.backgroundColor = "white"
    arrayOfCells.push(0);
    var ae = tempIndex;
    tempIndex++;
    item.addEventListener('click', event => {
        if (item.style.backgroundColor == "white") {
            item.style.backgroundColor = "green";
            arrayOfCells[ae] = 1;

        } else {
            item.style.backgroundColor = "white";
            arrayOfCells[ae] = 0;
        }
    })
});


regenerateCells();

document.getElementById("zoomIn").addEventListener("click", function(e) {
    if (currentScale < 1) {
        currentScale += 0.1;
    } else {
        currentScale += 1;
        currentScale = Math.floor(currentScale);
    }
    document.querySelectorAll('.cell').forEach(item => {
        item.style.width = (20 * currentScale) + "px";
        item.style.height = (20 * currentScale) + "px";
        item.style.marginLeft = (currentScale) + "px";
        item.style.marginTop = (currentScale) + "px";
        item.style.borderRadius = (5 * currentScale) + "px";
        document.getElementById("scale").innerHTML = "Scale: " + currentScale.toFixed(1);
    })
}, false);

document.getElementById("zoomOut").addEventListener("click", function(e) {
    if (currentScale <= 1) {
        currentScale -= 0.1;
    } else {
        currentScale -= 1;
    }
    document.querySelectorAll('.cell').forEach(item => {
        item.style.width = (20 * currentScale) + "px";
        item.style.height = (20 * currentScale) + "px";
        item.style.marginLeft = Math.floor(currentScale) + "px";
        item.style.marginTop = Math.floor(currentScale) + "px";
        item.style.borderRadius = Math.floor(5 * currentScale) + "px";
        document.getElementById("scale").innerHTML = "Scale: " + currentScale.toFixed(1);
    })
}, false);

document.getElementById("regenerate").addEventListener("click", function(e) {

    regenerateCells();

}, false);

document.getElementById("iterate").addEventListener("click", function(e) {
    var tempIndex = 0;
    document.querySelectorAll('.cell').forEach(item => {

        var x = tempIndex % width;
        var y = Math.floor(tempIndex / width);

        var numNeighbors = getNeighbors(x, y, width, height, arrayOfCells);

        if (arrayOfCells[tempIndex] === 0) {
            if (numNeighbors == 3) {
                arrayOfCells[tempIndex] = 2;
            } else {
                arrayOfCells[tempIndex] = 0
            }
        } else if (arrayOfCells[tempIndex] == 1) {
            if (!(numNeighbors == 2 || numNeighbors == 3)) {
                arrayOfCells[tempIndex] = 3;
            } else {
                arrayOfCells[tempIndex] = 1;
            }
        }

        tempIndex++;

    });


    fixArray();

    updateCells();


}, false);



function getNeighbors(x, y, width, height, cells) {
    var neighbors = [];
    var numNeighbors = 0;

    var leftx = x - 1 < 0 ? width - 1 : x - 1;
    var midx = x;
    var rightx = x + 1 >= width ? 0 : x + 1;
    var topy = y - 1 < 0 ? height - 1 : y - 1;
    var midy = y;
    var bottomy = y + 1 >= height ? 0 : y + 1;

    //Top left//
    neighbors.push(cells[leftx + topy * width]);
    //Top mid//
    neighbors.push(cells[midx + topy * width]);
    //Top right//
    neighbors.push(cells[rightx + topy * width]);
    //Mid left//
    neighbors.push(cells[leftx + midy * width]);
    //Mid right//
    neighbors.push(cells[rightx + midy * width]);
    //Bottom left//
    neighbors.push(cells[leftx + bottomy * width]);
    //Bottom mid//
    neighbors.push(cells[midx + bottomy * width]);
    //Bottom right//
    neighbors.push(cells[rightx + bottomy * width]);


    for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i] == 1 || neighbors[i] == 3) {
            numNeighbors++;
        }
    }


    return numNeighbors;
}

function updateCells() {
    document.getElementById("iterate").addEventListener("click", function(e) {
        var tempIndex = 0;
        document.querySelectorAll('.cell').forEach(item => {
            if (arrayOfCells[tempIndex] == 0) {
                item.style.backgroundColor = "white"
            } else {
                item.style.backgroundColor = "green"
            }
            tempIndex++;
        });
    }, false);
}

function fixArray() {
    for (var i = 0; i < arrayOfCells.length; i++) {

        if (arrayOfCells[i] == 2) {
            arrayOfCells[i] = 1;
        }
        if (arrayOfCells[i] == 3) {
            arrayOfCells[i] = 0;
        }

    }
}

function regenerateCells() {
    var newString = "";


    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            newString = newString + "<div class='cell'></div>";
        }
        newString = newString + "<br>";
    }


    document.getElementById("holdCells").innerHTML = newString;

    var tempIndex = 0;
    arrayOfCells = [];

    width = parseInt(document.getElementById("cellsX").value);
    height = parseInt(document.getElementById("cellsY").value);

    document.querySelectorAll('.cell').forEach(item => {
        item.style.backgroundColor = "white"
        arrayOfCells.push(0);
        var ae = tempIndex;
        tempIndex++;
        item.addEventListener('click', event => {
            if (item.style.backgroundColor == "white") {
                item.style.backgroundColor = "green";
                arrayOfCells[ae] = 1;

            } else {
                item.style.backgroundColor = "white";
                arrayOfCells[ae] = 0;
            }
        })
    });
}

function tryStart() {
    var trying = d.getTime();
    while (running) {

        if (d.getTime() > trying + 1000) {
            var tempIndex = 0;
            document.querySelectorAll('.cell').forEach(item => {

                var x = tempIndex % width;
                var y = Math.floor(tempIndex / width);

                var numNeighbors = getNeighbors(x, y, width, height, arrayOfCells);

                if (arrayOfCells[tempIndex] === 0) {
                    if (numNeighbors == 3) {
                        arrayOfCells[tempIndex] = 2;
                    } else {
                        arrayOfCells[tempIndex] = 0
                    }
                } else if (arrayOfCells[tempIndex] == 1) {
                    if (!(numNeighbors == 2 || numNeighbors == 3)) {
                        arrayOfCells[tempIndex] = 3;
                    } else {
                        arrayOfCells[tempIndex] = 1;
                    }
                }

                tempIndex++;

            });


            fixArray();

            updateCells();

            trying = d.getTime();
        }
    }
}