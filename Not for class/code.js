var canvas = document.getElementById('tutorial');
var button = document.getElementById('butt');

// longest side scaled to 1022
// (For the darkest pixel on the image with multiple testing lines) On the image, draw a temporary line and add all of the pixel values on that line together in order to get the average color. Actually draw the
// line (subtractive) that has the darkest average color on the canvas. Then draw that line (additive) on the image. this makes it so that there is a new darkest pixel
// Do this for how ever many lines you decide to use (x3 for in color)

// Canvas to store image, Canvas that we see (main), Canvas that Stores change we're gonna make, Canvas to do operations
// Copy imageCanv to operationsCanv and draw line. Then set draw mode to 'destination-in' and draw the line again.
// Add up all of the non-clear pixels to get the average color. If this average color is darker than the holdCanv's average color, copy the main canvas to the StoreCanv and draw the line
// Once we're through all of our lines, copy the StoreCanv to the main canvas.

// ALGORITHM PROBABLY WORKS!
// Tomorrow I'm going to revisit this and add WEB WORKERS!!!! YAY!!!!
// Apparently JavaScript is so cool it doesn't have multithreading so we'll just run multiple programs! (that's what I think workers do)


// Okay, here's the plan:
// We have a worker per color channel. This worker then delegates to more workers (each finding 1 line) and then we go through each line and find the best one.
// The manager worker will then return the best line.

var lineWeight = 160;
var numLines = 300;
var iterations = 20;

var ctx = canvas.getContext('2d');

if (canvas.getContext) {
    var img;

    var input = document.getElementById('input');
    input.addEventListener('change', handleFiles);

    function handleFiles(e) {
        img = new Image();
        img.addEventListener('load', function() {
            ctx.drawImage(img, 0, 0) // execute drawImage statements here
        }, false);
        img.src = URL.createObjectURL(e.target.files[0]);
    }

    button.addEventListener('click', function() {


        console.log("Starting linification");

        //Setup Canvases
        var imageCanvas = document.createElement('canvas');
        var imageContext = imageCanvas.getContext('2d');

        var maxSide = 500;
        if (img.width > img.height) {
            canvas.width = maxSide;
            canvas.height = maxSide / img.width * img.height;
            imageCanvas.width = maxSide;
            imageCanvas.height = maxSide / img.width * img.height;
        } else {
            canvas.height = maxSide;
            canvas.width = maxSide / img.height * img.width;
            imageCanvas.height = maxSide;
            imageCanvas.width = maxSide / img.height * img.width;
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log("Starting linification");
        ctx.globalCompositeOperation = 'exclusion';



        // Find darkest pixel 
        var imageData = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        var tempDarkest = [0, 0, getDark([imageData.data[0], imageData.data[0 + 1], imageData.data[0 + 2], imageData.data[0 + 3]])]
        for (var y = 0; y < imageCanvas.height; y++) {
            for (var x = 0; x < imageCanvas.width; x++) {
                var location = y * (imageCanvas.width * 4) + x * 4;
                var color = [imageData.data[location], imageData.data[location + 1], imageData.data[location + 2], imageData.data[location + 3]]; // R G B A
                if (tempDarkest[2] > getDark(color)) {
                    tempDarkest = [x, y, getDark(color)];
                }
            }
        }
        var darkest = [tempDarkest[0], tempDarkest[1]];

        // Create the manager that is going to find the lines
        for (var line = 0; line < numLines; line++) {
            // data = [imageCanvas, numLines, color red, color green, color blue, darkest pixel x, darkest pixel y]
            var manager = new Worker('manager.js');
            switch (getRandomInt(3)) {
                case 0:
                    var sendToManager = [imageCanvas, iterations, lineWeight, 0, 0, darkest[0], darkest[1]];
                    manager.postMessage(sendToManager);
                    break;
                case 1:
                    var sendToManager = [imageCanvas, iterations, 0, lineWeight, 0, darkest[0], darkest[1]];
                    manager.postMessage(sendToManager);
                    break;
                case 2:
                    var sendToManager = [imageCanvas, iterations, 0, 0, lineWeight, darkest[0], darkest[1]];
                    manager.postMessage(sendToManager);
                    break;
            }

            manager.onmessage = function(e) {
                let input = e.data;
                var draw = canvas.getContext('2d');
                var imageDraw = canvas.getContext('2d');
                canvas.globalCompositeOperation = 'exclusion';
                draw.moveTo(input[0], input[1]);
                draw.lineTo(input[2], input[3]);
                draw.strokeStyle = 'rgb(' + input[4] + ', ' + input[5] + ', ' + input[6] + ')';
                draw.stroke();
                imageCanvas.globalCompositeOperation = 'lighter';
                imageDraw.moveTo(input[0], input[1]);
                imageDraw.lineTo(input[2], input[3]);
                imageDraw.strokeStyle = 'rgb(' + input[4] + ', ' + input[5] + ', ' + input[6] + ')';
                imageDraw.stroke();
                manager.terminate();

                imageCanvas.globalCompositeOperation = 'source-over';
                canvas.globalCompositeOperation = 'source-over';
            }

        }



    }, false);

    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
} else {
    // canvas-unsupported code here
}

function getDark(color) {
    return Math.min(color[0], color[1], color[2]);
}

function distance(xA, yA, xB, yB) {
    var xDiff = xA - xB;
    var yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


////////////// Single Threaded version of algorithm ////////////////
/*
        //Set up canvases
        var imageCanvas = document.createElement('canvas');
        var storeCanvas = document.createElement('canvas');
        var storeMainCanvas = document.createElement('canvas');
        var tempCanvas = document.createElement('canvas');
        var tempCanvas2 = document.createElement('canvas');
        var maxSide = 500;

        if (img.width > img.height) {
            canvas.width = maxSide;
            canvas.height = maxSide / img.width * img.height;
            imageCanvas.width = maxSide;
            imageCanvas.height = maxSide / img.width * img.height;
            storeCanvas.width = maxSide;
            storeCanvas.height = maxSide / img.width * img.height;
            storeMainCanvas.width = maxSide;
            storeMainCanvas.height = maxSide / img.width * img.height;
            tempCanvas.width = maxSide;
            tempCanvas.height = maxSide / img.width * img.height;
            tempCanvas2.width = maxSide;
            tempCanvas2.height = maxSide / img.width * img.height;
        } else {
            canvas.height = maxSide;
            canvas.width = maxSide / img.height * img.width;
            imageCanvas.height = maxSide;
            imageCanvas.width = maxSide / img.height * img.width;
            storeCanvas.height = maxSide;
            storeCanvas.width = maxSide / img.height * img.width;
            storeMainCanvas.height = maxSide;
            storeMainCanvas.width = maxSide / img.height * img.width;
            tempCanvas.height = maxSide;
            tempCanvas.width = maxSide / img.height * img.width;
            tempCanvas2.height = maxSide;
            tempCanvas2.width = maxSide / img.height * img.width;
        }
        var imageCtx = imageCanvas.getContext('2d');
        var storeCtx = storeCanvas.getContext('2d');
        var tempCtx = tempCanvas.getContext('2d');
        var tempCtx2 = tempCanvas2.getContext('2d');
        var storeMainCtx = storeMainCanvas.getContext('2d');

        //Copy image to image Canvas and clear the other canvases
        ctx.globalCompositeOperation = 'source-over';
        imageCtx.globalCompositeOperation = 'source-over';
        storeCtx.globalCompositeOperation = 'source-over';
        tempCtx.globalCompositeOperation = 'source-over';
        tempCtx2.globalCompositeOperation = 'source-over';
        storeMainCtx.globalCompositeOperation = 'source-over';
        imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        storeCtx.clearRect(0, 0, storeCanvas.width, storeCanvas.height);
        storeMainCtx.clearRect(0, 0, storeMainCanvas.width, storeMainCanvas.height);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx2.clearRect(0, 0, tempCanvas2.width, tempCanvas2.height);


        //Do multiple lines
        for (var lineNum = 0; lineNum < numLines; lineNum++) {

            // Find the darkest pixel
            var imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            var tempDarkest = [0, 0, getDark([imageData.data[0], imageData.data[0 + 1], imageData.data[0 + 2], imageData.data[0 + 3]])]
            for (var y = 0; y < imageCanvas.height; y++) {
                for (var x = 0; x < imageCanvas.width; x++) {
                    var location = y * (imageCanvas.width * 4) + x * 4;
                    var color = [imageData.data[location], imageData.data[location + 1], imageData.data[location + 2], imageData.data[location + 3]]; // R G B A
                    if (tempDarkest[2] > getDark(color)) {
                        tempDarkest = [x, y, getDark(color)];
                    }
                }
            }
            var darkest = [tempDarkest[0], tempDarkest[1]];
            var darkestAverage;

            //Go through multiple iterations to find the best line
            for (var iteration = 0; iteration < iterations; iteration++) {

                // Find the line (start point to end point, color)
                var startPoint = ((getRandomInt(2) === 0) ? [getRandomInt(imageCanvas.width), 0] : [0, getRandomInt(imageCanvas.height)]);
                var endPoint;

                var findColor = getRandomInt(3);
                if (findColor === 0) {
                    color = [lineWeight, 0, 0];
                } else if (findColor == 1) {
                    color = [0, lineWeight, 0];
                } else {
                    color = [0, 0, lineWeight];
                }

                if (startPoint[0] === 0) {
                    var cy = darkest[1] - startPoint[1];
                    var cx = darkest[0] - startPoint[0];
                    var tempEnd1;
                    var tempEnd2;
                    if (cy < 0) { // If we are greater than darkest
                        var temp = (0 - startPoint[1]) * 1.0 / cy;
                        tempEnd1 = [cx * temp + startPoint[0], 0];
                        temp = (imageCanvas.width - startPoint[0]) * 1.0 / cx;
                        tempEnd2 = [imageCanvas.width, cy * temp + startPoint[1]]

                        endPoint = (distance(startPoint[0], startPoint[1], tempEnd1[0], tempEnd1[1]) < distance(startPoint[0], startPoint[1], tempEnd2[0], tempEnd2[1])) ? [tempEnd1[0], tempEnd1[1]] : [tempEnd2[0], tempEnd2[1]];

                    } else { // If we are less than darkest
                        var temp = (imageCanvas.height - startPoint[1]) * 1.0 / cy;
                        tempEnd1 = [cx * temp + startPoint[0], imageCanvas.height];
                        temp = (imageCanvas.width - startPoint[0]) * 1.0 / cx;
                        tempEnd2 = [imageCanvas.width, cy * temp + startPoint[1]]

                        endPoint = (distance(startPoint[0], startPoint[1], tempEnd1[0], tempEnd1[1]) < distance(startPoint[0], startPoint[1], tempEnd2[0], tempEnd2[1])) ? [tempEnd1[0], tempEnd1[1]] : [tempEnd2[0], tempEnd2[1]];

                    }
                } else {
                    var cy = darkest[1] - startPoint[1];
                    var cx = darkest[0] - startPoint[0];
                    var tempEnd1;
                    var tempEnd2;
                    if (cx < 0) { // If we are greater than darkest
                        var temp = (imageCanvas.height - startPoint[1]) * 1.0 / cy;
                        tempEnd1 = [cx * temp + startPoint[0], imageCanvas.height];
                        temp = (0 - startPoint[0]) * 1.0 / cx;
                        tempEnd2 = [0, cy * temp + startPoint[1]]

                        endPoint = (distance(startPoint[0], startPoint[1], tempEnd1[0], tempEnd1[1]) < distance(startPoint[0], startPoint[1], tempEnd2[0], tempEnd2[1])) ? [tempEnd1[0], tempEnd1[1]] : [tempEnd2[0], tempEnd2[1]];

                    } else { // If we are less than darkest
                        var temp = (imageCanvas.height - startPoint[1]) * 1.0 / cy;
                        tempEnd1 = [cx * temp + startPoint[0], imageCanvas.height];
                        temp = (imageCanvas.width - startPoint[0]) * 1.0 / cx;
                        tempEnd2 = [imageCanvas.width, cy * temp + startPoint[1]]

                        endPoint = (distance(startPoint[0], startPoint[1], tempEnd1[0], tempEnd1[1]) < distance(startPoint[0], startPoint[1], tempEnd2[0], tempEnd2[1])) ? [tempEnd1[0], tempEnd1[1]] : [tempEnd2[0], tempEnd2[1]];

                    }
                }

                //Copy the imageCanv to the operationsCanv, set the drawingmode to 'lighter' (additive), and draw the line
                tempCtx2.globalCompositeOperation = 'source-over';
                tempCtx2.drawImage(imageCanvas, 0, 0);
                tempCtx2.globalCompositeOperation = 'lighter';
                tempCtx2.moveTo(startPoint[0], startPoint[1]);
                tempCtx2.lineTo(endPoint[0], endPoint[1]);
                tempCtx2.strokeStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                tempCtx2.stroke();

                //Get the average color value of place along the line        
                tempCtx.globalCompositeOperation = 'source-over';
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.moveTo(startPoint[0], startPoint[1]);
                tempCtx.lineTo(endPoint[0], endPoint[1]);
                tempCtx.strokeStyle = '#FFFFFF';
                tempCtx.stroke();
                tempCtx.globalCompositeOperation = 'destination-in';
                tempCtx.drawImage(tempCanvas2, 0, 0);

                var imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                var averageColor = [0, 0, 0];
                var totalPixels = 0;
                for (var y = 0; y < tempCanvas.height; y++) {
                    for (var x = 0; x < tempCanvas.width; x++) {
                        var location = y * (imageCanvas.width * 4) + x * 4;
                        var tempColor = [imageData.data[location], imageData.data[location + 1], imageData.data[location + 2], imageData.data[location + 3]]; // R G B A
                        if (tempColor[3] > 0) {
                            totalPixels++;
                            averageColor = [averageColor[0] + tempColor[0], averageColor[1] + tempColor[1], averageColor[2] + tempColor[2]];
                        }
                    }
                }
                averageColor = [averageColor[0] / totalPixels, averageColor[1] / totalPixels, averageColor[2] / totalPixels];

                // If this average color is darker than the stored one (or if there isn't a stored one), draw this canvas on the stored canvas
                if (iteration === 0 || getDark(averageColor) < getDark(darkestAverage)) {
                    darkestAverage = averageColor;
                    storeCtx.globalCompositeOperation = 'source-over';
                    storeCtx.fillStyle = '#FFFFFF';
                    storeCtx.clearRect(0, 0, storeCanvas.width, storeCanvas.height);
                    storeCtx.drawImage(imageCanvas, 0, 0, storeCanvas.width, storeCanvas.height);
                    storeCtx.globalCompositeOperation = 'lighter';
                    storeCtx.moveTo(startPoint[0], startPoint[1]);
                    storeCtx.lineTo(endPoint[0], endPoint[1]);
                    storeCtx.strokeStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                    storeCtx.stroke();

                    storeMainCtx.globalCompositeOperation = 'source-over';
                    storeMainCtx.fillStyle = '#FFFFFF';
                    storeMainCtx.fillRect(0, 0, storeCanvas.width, storeCanvas.height);
                    storeMainCtx.drawImage(canvas, 0, 0);
                    storeMainCtx.globalCompositeOperation = 'exclusion';
                    storeMainCtx.moveTo(startPoint[0], startPoint[1]);
                    storeMainCtx.lineTo(endPoint[0], endPoint[1]);
                    storeMainCtx.strokeStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                    storeMainCtx.stroke();
                }
            }


            ctx.drawImage(storeMainCanvas, 0, 0);
            imageCtx.drawImage(storeCanvas, 0, 0);

            var currentTime = new Date().getTime();

            while (currentTime + 200 >= new Date().getTime()) {}

            console.log("Done linification");
        }
*/