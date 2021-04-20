// Here's the deal. This takes an image and draws it using only straight lines spanning the entire canvas. Cool, right? I thought so.
// Coded by Ben Liebkemann 2021

var canvas = document.getElementById('lineCanvas');
var button = document.getElementById('butt'); // I thought this was funny
var imageURLField = document.getElementById('fileInput');

var lineWeightElement = document.getElementById('lineWeight');
var numLinesElement = document.getElementById('numLines');
var iterationsElement = document.getElementById('testNumber');
var maxSideElement = document.getElementById('sideLen');
var lineWeight = 8;
var numLines = 16000;
var iterations = 100;
var maxSide = 500;
lineWeightElement.addEventListener('change', function(e) {
    lineWeight = parseInt(lineWeightElement.value);
}, false);
numLinesElement.addEventListener('change', function(e) {
    numLines = parseInt(numLinesElement.value);
}, false);
iterationsElement.addEventListener('change', function(e) {
    iterations = parseInt(iterationsElement.value);
}, false);
maxSideElement.addEventListener('change', function(e) {
    maxSide = parseInt(maxSideElement.value);
}, false);




var ctx = canvas.getContext('2d');

imageURLField.addEventListener('change', function(e) {
    img = new Image();
    img.crossOrigin = "Anonymous";
    img.addEventListener('load', function() {
        if (img.width > img.height) {
            canvas.width = maxSide;
            canvas.height = maxSide / img.width * img.height;
        } else {
            canvas.height = maxSide;
            canvas.width = maxSide / img.height * img.width;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height) // execute drawImage statements here
    }, false);
    img.src = imageURLField.value;
}, false);

if (canvas.getContext) {
    var img;


    var localFile = document.getElementById('findFile');
    localFile.addEventListener('change', handleFiles);

    function handleFiles(e) {
        img = new Image();
        img.addEventListener('load', function() {
            if (img.width > img.height) {
                canvas.width = maxSide;
                canvas.height = maxSide / img.width * img.height;
            } else {
                canvas.height = maxSide;
                canvas.width = maxSide / img.height * img.width;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height) // execute drawImage statements here
        }, false);

        img.src = URL.createObjectURL(e.target.files[0]);
    }

    button.addEventListener('click', function() {

        //var maxSide = maxSideElement.value;


        //Setup Canvases
        var imageCanvas = document.createElement('canvas');
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

        var imageContext = imageCanvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'difference';
        imageContext.fillStyle = '#FFFFFFFF';
        imageContext.fillRect(0, 0, canvas.width, canvas.height);
        imageContext.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);


        //Extracting buffers from the image
        var fullBuffer = imageContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;
        var rBuffer = new Int16Array(fullBuffer.length / 4);
        var gBuffer = new Int16Array(fullBuffer.length / 4);
        var bBuffer = new Int16Array(fullBuffer.length / 4);


        for (var index = 0; index < fullBuffer.length; index += 4) {
            rBuffer[index / 4] = fullBuffer[index];
            gBuffer[index / 4] = fullBuffer[index + 1];
            bBuffer[index / 4] = fullBuffer[index + 2];
        }

        //Setting up the worker objects (these run separate processes that find the lines)
        var workers = [];
        let width = imageCanvas.width;
        let height = imageCanvas.height;


        var greenWorker = new Worker(URL.createObjectURL(new Blob(["(" + grunt_function.toString() + ")()"], { type: 'text/javascript' })));
        var blueWorker = new Worker(URL.createObjectURL(new Blob(["(" + grunt_function.toString() + ")()"], { type: 'text/javascript' })));
        var redWorker = new Worker(URL.createObjectURL(new Blob(["(" + grunt_function.toString() + ")()"], { type: 'text/javascript' })));

        var sendToRedManager = [rBuffer, lineWeight, width, height, iterations, numLines];
        redWorker.postMessage(sendToRedManager);

        var sendToGreenManager = [gBuffer, lineWeight, width, height, iterations, numLines];
        greenWorker.postMessage(sendToGreenManager);

        var sendToBlueManager = [bBuffer, lineWeight, width, height, iterations, numLines];
        blueWorker.postMessage(sendToBlueManager);


        //What to do when the workers give us the lines (there's one worker for each color chanel red green blue)
        redWorker.onmessage = function(e) {
            let input = e.data;
            let startPoint = [input[0], input[1]];
            let endPoint = [input[2], input[3]];
            let lineWeight = input[4];
            coloredLine(startPoint[0], startPoint[1], endPoint[0], endPoint[1], 'rgb(' + lineWeight + ',0,0)');
        }
        greenWorker.onmessage = function(e) {
            let input = e.data;
            let startPoint = [input[0], input[1]];
            let endPoint = [input[2], input[3]];
            let lineWeight = input[4];
            coloredLine(startPoint[0], startPoint[1], endPoint[0], endPoint[1], 'rgb(0,' + lineWeight + ',0)');

        }
        blueWorker.onmessage = function(e) {
            let input = e.data;
            let startPoint = [input[0], input[1]];
            let endPoint = [input[2], input[3]];
            let lineWeight = input[4];
            coloredLine(startPoint[0], startPoint[1], endPoint[0], endPoint[1], 'rgb(0,0,' + lineWeight + ')');
        }
    }, false);

} else {
    //If the canvas couldn't load I'd put something here but honestly if the canvas doesn't load there's no point in the webpage so there's no need to put something here.
}

//I can't draw a line in the onmessage function from the workers so I had to make this as a workaround
function coloredLine(startX, startY, endX, endY, color) {
    ctx.beginPath();
    ctx.moveTo(startX + 0.5, startY + 0.5);
    ctx.lineTo(endX + 0.5, endY + 0.5);
    ctx.strokeStyle = color;
    ctx.stroke();
}

//Just gets the minimum value, used to find the luminance value of an rgb color (without converting to hsb)
function getDark(color) {
    return Math.min(color[0], color[1], color[2]);
}

//Standard distance function
function distance(xA, yA, xB, yB) {
    var xDiff = xA - xB;
    var yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

//Get a random number from 0 to max
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}




//////////Workaround in order to be able to use workers//////////////////
// Usually you would use a different file to store all of the worker functions but I needed to debug this on my local machine which doesn't allow you
// to make workers from separate files. Therefore I have this function (which is what the worker does) and when I make the worker I use a blob to
// make the worker think it's getting this code from a different file. Fun workaround and it keeps all the code in one place :)
function grunt_function() {
    onmessage = function(e) {

        //Get all of my data from the message
        let dataIn = e.data;
        let lineWeight = dataIn[1];
        var imageBuffer = dataIn[0];
        let width = dataIn[2];
        let height = dataIn[3];
        let iterations = dataIn[4];
        let numLines = dataIn[5];

        // For however many lines we said we wanted to draw, go through this code (each run through sends one line to the main program)
        for (var currentLine = 0; currentLine < numLines; currentLine++) {
            //Find the darkest pixel in the image
            var startPoint = [0, 0];
            var darkest = [-1, -1];
            var darkValue = 0;
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if (darkest[0] == -1 || imageBuffer[x + y * width] < darkValue) {
                        darkValue = imageBuffer[x + y * width];
                        darkest = [x, y];
                    }
                }
            }

            // Some variables put here so that I can use them outside of the next for loop. Not sure if they're needed here anymore but not about to go through and check. That's work!
            var finalStart = -1;
            var finalEnd;
            var finalBright;

            // Find best line
            var pointsInLine = [];
            var finalLine = [];

            // We're not checking every line that would be dumb. We're just going to check 'iterations' random lines (iterations is a number) and find the best one!
            for (var iteration = 0; iteration < iterations; iteration++) {
                var brightness = 0;
                var count = 0;
                var useEnd = [];

                // Modified Bresenham algorithm. Instead of ending at the endpoint, end at the edge of the array
                // This algorithm just defines making a line, wikipedia article is good. I am 100% certain there is a much smaller and simpler way of doing this algorithm,
                // but this version was the product of 3 am and Sprite (and it works) so I'm leaving it as is.

                //random start point on the edge of the canvas
                startPoint = ((getRandomInt(2) === 0) ? (getRandomInt(2) === 0) ? [getRandomInt(width), 0] : [0, getRandomInt(height)] : (getRandomInt(2) === 0) ? [getRandomInt(width), height] : [width, getRandomInt(height)]);

                //Setting up all of the variables
                var cy = darkest[1] - startPoint[1];
                var cx = darkest[0] - startPoint[0];
                var tx, ty, P, B, A, slope;
                tx = startPoint[0];
                ty = startPoint[1];

                if (Math.abs(cx) > Math.abs(cy)) {
                    if (cx < 0) {
                        if (cy < 0) {
                            cx *= -1;
                            cy *= -1;
                        } else {
                            cx *= -1;
                        }
                    } else {
                        if (cy < 0) {
                            cy *= -1;
                        } else {

                        }
                    }
                    A = 2 * cy;
                    B = A - 2 * cx;
                    P = A - cx;
                } else {
                    if (cy < 0) {
                        if (cx < 0) {
                            cy *= -1;
                            cx *= -1;
                        } else {
                            cy *= -1;
                        }
                    } else {
                        if (cx < 0) {
                            cx *= -1;
                        } else {

                        }
                    }
                    A = 2 * cx;
                    B = A - 2 * cy;
                    P = A - cy;
                }

                cy = darkest[1] - startPoint[1];
                cx = darkest[0] - startPoint[0];
                pointsInLine = [];

                pointsInLine.push([startPoint[0], startPoint[1]]);

                // Going through all the poitns on the line, adding those points to an array, and getting the average brightness of the pixels along the line.
                while (true) {
                    if (Math.abs(cx) > Math.abs(cy)) {
                        if (cx < 0) {
                            if (cy < 0) {
                                tx -= 1;
                                if (P < 0) {
                                    ty -= 0;
                                    P += A;
                                } else {
                                    ty -= 1;
                                    P += B;
                                }
                            } else {
                                tx -= 1;
                                if (P < 0) {
                                    ty += 0;
                                    P += A;
                                } else {
                                    ty += 1;
                                    P += B;
                                }
                            }
                        } else {
                            if (cy < 0) {
                                tx += 1;
                                if (P < 0) {
                                    ty -= 0;
                                    P += A;
                                } else {
                                    ty -= 1;
                                    P += B;
                                }
                            } else {
                                tx += 1;
                                if (P < 0) {
                                    ty += 0;
                                    P += A;
                                } else {
                                    ty += 1;
                                    P += B;
                                }
                            }
                        }
                    } else {
                        if (cy < 0) {
                            if (cx < 0) {
                                ty -= 1;
                                if (P < 0) {
                                    tx -= 0;
                                    P += A;
                                } else {
                                    tx -= 1;
                                    P += B;
                                }
                            } else {
                                ty -= 1;
                                if (P < 0) {
                                    tx += 0;
                                    P += A;
                                } else {
                                    tx += 1;
                                    P += B;
                                }
                            }
                        } else {
                            if (cx < 0) {
                                ty += 1;
                                if (P < 0) {
                                    tx -= 0;
                                    P += A;
                                } else {
                                    tx -= 1;
                                    P += B;
                                }
                            } else {
                                ty += 1;
                                if (P < 0) {
                                    tx += 0;
                                    P += A;
                                } else {
                                    tx += 1;
                                    P += B;
                                }
                            }
                        }
                    }

                    //If we've reached the end of the canvas, stop making the line.
                    if (tx < 0 || tx > width || ty < 0 || ty > height) break;

                    brightness += imageBuffer[tx + ty * width];
                    count++;
                    useEnd = [tx, ty];
                    pointsInLine.push([tx, ty]);
                }

                //Averaging brightness
                brightness = brightness / count;

                // If this line is darker than the previous ones, put it in these convenient placeholder variables!
                if (finalStart == -1 || brightness < finalBright) {
                    finalBright = brightness;
                    finalStart = [startPoint[0], startPoint[1]];
                    finalEnd = [useEnd[0], useEnd[1]];
                    finalLine = pointsInLine;
                }
            }

            // Remember how we put all of the points on the line in an array before? Now we can use those to easily change the image buffer brightness to reflect the changes we want to make!
            for (var i = 0; i < finalLine.length; i++) {
                imageBuffer[finalLine[i][0] + finalLine[i][1] * width] += lineWeight;
            }

            // Send the line back to the main program to be drawn
            let returnData = [finalStart[0], finalStart[1], finalEnd[0], finalEnd[1], lineWeight];
            postMessage(returnData);
        }

        // Random number function again because it couldn't use the other one for some reason? Whatever it works
        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        // When we're done making lines I have the worker commit suicide. Tragic, I know but maybe also a lesson. The needs of Ben are absolute!
        close();
    }
}



// Okay this next part serves 0 purpose. I just spent a lot of time making it and thought it was cool and it runs very slow and I couldn't bring myself to delete it.
// Ladies and gentlemen, I present to you my piece 'so much work for so little payoff.'

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

            console.log("Done lining");
        }
*/