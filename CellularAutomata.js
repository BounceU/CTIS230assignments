var currentScale = 1;
var arrayOfCells = [];
var width = 50;
var height = 50;

var canvas = document.getElementById("automataCanvas");
var ctx = canvas.getContext('2d');

canvas.style.imageRendering = "pixelated";

var d = new Date();

var running = false;


var tempIndex = 0;


regenerateCells();


canvas.addEventListener('mouseleave', updateCells(), false);

canvas.addEventListener('mousemove', function(e) {
    var x = Math.floor(e.offsetX / canvas.clientWidth * width) < 0 ? 0 : Math.floor(e.offsetX / canvas.clientWidth * width);
    var y = Math.floor(e.offsetY / canvas.clientHeight * height) < 0 ? 0 : Math.floor(e.offsetY / canvas.clientHeight * height);

    updateCells();

    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 1, 1);

    if (arrayOfCells[x + y * width] == 1) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
    }
    ctx.fillRect(x, y, 1, 1);

}, false);

canvas.addEventListener('mousedown', function(e) {
    var x = Math.floor(e.offsetX / canvas.clientWidth * width) < 0 ? 0 : Math.floor(e.offsetX / canvas.clientWidth * width);
    var y = Math.floor(e.offsetY / canvas.clientHeight * height) < 0 ? 0 : Math.floor(e.offsetY / canvas.clientHeight * height);

    arrayOfCells[x + y * width] = Math.abs(arrayOfCells[x + y * width] - 1);


    ctx.fillStyle = "white";
    ctx.fillRect(x, y, 1, 1);

    if (arrayOfCells[x + y * width] == 1) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
    }
    ctx.fillRect(x, y, 1, 1);

}, false);

document.getElementById("regenerate").addEventListener("click", function(e) {

    document.getElementById("butt").innerText = "Start";
    regenerateCells();

}, false);

document.getElementById("iterate").addEventListener("click", function(e) {
    iterate1();
}, false);


document.getElementById("butt").addEventListener("click", function(e) {
    if (running) {
        document.getElementById("butt").innerText = "Play";
        running = false;
    } else {
        document.getElementById("butt").innerText = "Pause";
        running = true;
    }
}, false);


var t = setInterval(function() {
    if (running) {
        iterate1();
    }
}, 1000 / 15)

function iterate1() {
    var tempIndex = 0;
    while (tempIndex < width * height) {

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

    }

    fixArray();

    updateCells();

}


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
    for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
            if (arrayOfCells[x + y * width] == 1) {
                ctx.fillStyle = "black"
                ctx.fillRect(x, y, 1, 1);
            } else {
                ctx.fillStyle = "white"
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

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

    arrayOfCells = [];


    width = parseInt(document.getElementById("cellsX").value);
    height = parseInt(document.getElementById("cellsY").value);

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            arrayOfCells.push(Math.floor(Math.random() * 2));
        }
    }

    canvas.width = width;
    canvas.height = height;

    updateCells();

}