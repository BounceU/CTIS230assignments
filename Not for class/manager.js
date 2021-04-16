onmessage = function(e) {

    // data = [imageCanvas, numLines, color red, color green, color blue, darkest pixel x, darkest pixel y]

    workers = [];
    let dataIn = e.data;

    let iterations = dataIn[1];
    var goneThrough = 0;
    var rStart = -1;
    var rEnd;
    var rAverage;


    for (var iteration = 0; iteration < iterations; iteration++) {
        var worker = new Worker('grunt.js');
        workers.push(worker);
        let gruntData = [dataIn[0], dataIn[2], dataIn[3], dataIn[4], dataIn[5], dataIn[6]];
        worker.postMessage(gruntData);
        worker.onmessage = function(e) {
            let receivedData = e.data;
            if (rStart == -1 || receivedData[4] < rAverage) {
                rStart = [receivedData[0], receivedData[1]];
                rEnd = [receivedData[2], receivedData[3]];
                rAverage = receivedData[4];
            }
            goneThrough++;
            worker.terminate();
            if (goneThrough / iterations == 1) {
                // return [start, end, color]
                let dataOut = [rStart[0], rStart[1], rEnd[0], rEnd[1], dataIn[2], dataIn[3], dataIn[4]];
                postMessage(dataOut);
            }
        }
    }

}