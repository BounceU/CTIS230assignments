onmessage = function(e) {
    // The only thing that will be coming in is the imageCanvas, color, and darkest pixel location. [canvas, r, g, b, x, y]

    let dataIn = e.data;
    let darkest = [dataIn[4], dataIn[5]];
    var imageCanvas = dataIn[0];
    var imageContext = imageCanvas.getContext('2d');

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

    //Draw the path on a temporary canvas, draw the line on the imageCanvas, then draw the imageCanvas on the pathCanvas ('destination-in')
    var pathCanvas = document.createElement('canvas');
    var pathContext = pathCanvas.getContext('2d');
    pathCanvas.width = imageCanvas.width;
    pathCanvas.height = imageCanvas.height;
    pathContext.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
    pathContext.moveTo(startPoint[0], startPoint[1]);
    pathContext.lineTo(endPoint[0], endPoint[1]);
    pathContext.strokeStyle = 'rgb(0, 0, 0)';
    pathContext.stroke();

    imageContext.moveTo(startPoint[0], startPoint[1]);
    imageContext.lineTo(endPoint[0], endPoint[1]);
    imageContext.strokeStyle = 'rgb(' + dataIn[1] + ', ' + dataIn[2] + ', ' + dataIn[3] + ')';
    imageContext.stroke();

    pathContext.globalCompositeOperation = 'destination-in';
    pathContext.drawImage(imageCanvas, 0, 0, pathCanvas.width, pathCanvas.height);

    let imageData = pathContext.getImageData(0, 0, pathCanvas.width, pathCanvas.height);
    var averageColor = [0, 0, 0];
    var totalPixels = 0;
    for (var y = 0; y < pathCanvas.height; y++) {
        for (var x = 0; x < pathCanvas.width; x++) {
            var location = y * (imageCanvas.width * 4) + x * 4;
            var tempColor = [imageData.data[location], imageData.data[location + 1], imageData.data[location + 2], imageData.data[location + 3]]; // R G B A
            if (tempColor[3] > 0) {
                totalPixels++;
                averageColor = [averageColor[0] + tempColor[0], averageColor[1] + tempColor[1], averageColor[2] + tempColor[2]];
            }
        }
    }
    averageColor = [averageColor[0] / totalPixels, averageColor[1] / totalPixels, averageColor[2] / totalPixels];

    // Return the line and the average color
    let returnData = [startPoint[0], startPoint[1], endPoint[0], endPoint[1], getDark(averageColor)];
    postMessage(returnData);

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