navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var stream;

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
analyser.fftSize = 128;
var bufferLength = analyser.frequencyBinCount;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();
var canvas2 = document.getElementById("audiocanvas");

if (navigator.getUserMedia) {
    navigator.getUserMedia(
        {audio: true},
        function(stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.connect(distortion);
            distortion.connect(biquadFilter);
            biquadFilter.connect(convolver);
            convolver.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            readAudioData();
        },
        function(err) {
            console.log(err);
        }
    );
} else {
    console.log('UserMedia not supported on your browser');
}

// Rads audio data from stream and updates data arrays.
function readAudioData() {
    requestAnimationFrame(readAudioData);
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray);

    // Add data to audio array.
    audio.push(dataArray.toString());

    // Bound array size
    if(audio.length > dataLength){
        audio.shift();
    }

    // Create distributed points with every audio update for additional entry. 
    if(streamOn){
        createDistributedPoints();
        buildRandomNumber();
    }
}

// Draws data to info window. 
function draw(dataArray) {
    var rect = canvas2.getBoundingClientRect();
    canvas2.width = rect.width;
    canvas2.height = rect.height;
    var context = canvas2.getContext("2d");
    context.fillStyle = "#000000";
    var barWidth = rect.width / bufferLength;
    for (var i = 0; i < bufferLength; i++) {
        var barHeight = (rect.height * dataArray[i])/256;
        context.fillRect(i * barWidth, rect.height - barHeight, barWidth, barHeight);
    }
}