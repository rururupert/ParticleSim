
var canvas = document.getElementById("c");
var context = canvas.getContext("2d");

var canvasTrail = document.getElementById("c_trail");
var contextTrail = canvasTrail.getContext("2d");

var canvasBg = document.getElementById("c_Bg");
var contextBg = canvasBg.getContext("2d");

var timestep = 30/1000;
timer = window.setTimeout(moveSlime, timestep);

var bgColorSelect = document.getElementById('bgColorSelect');
var nSlider = document.getElementById('nSlider');

var widthParticle = 3;
var nMax = Number(nSlider.max);				// maximum number of molecules
var N = 100;									// current number of molecules
var InitialSpeed = 0.6;  
var stepsPerFrame = 2;
var colorParticle = "red";
var colorTrail = "rgb(255, 200, 200)";  
var trailSize = 1;

var scanSize = 2;           //size of area particles scan
var scanAngle = 0.785;         //Scan angle (0.785 = 45 degrees)
var scanLength = 9;

var randomTurn = 1; //rads
var senseTurn = 0.785;  //rads

var  x = new Array(nMax),  y = new Array(nMax);
var vx = new Array(nMax), vy = new Array(nMax);
var direction = new Array(nMax);

changeN ()
for (var i=0; i<N; i++) {
    //x[i] = Math.random() * canvas.width;  //small bug when particles spawn at edge
    //y[i] = Math.random() * canvas.height;
    x[i] = canvas.width / 2;  //Position of particle
    y[i] = canvas.height / 2;
    vx[i] = InitialSpeed;     //Velocity of particles (maybe change this...)
    vy[i] = InitialSpeed;     
    direction[i] = Math.random()*2*Math.PI; 
}


// Color background 
function changeBg () {
    contextBg.fillStyle = bgColorSelect.options[bgColorSelect.selectedIndex].value;
    contextBg.fillRect(0, 0, canvas.width, canvas.height);
}
changeBg () 
 
function moveSlime() {

    for (var step=0; step<stepsPerFrame; step++) {
        for (var i=0; i<N; i++) {

            //Check for bounces on border walls
            if ((x[i] < (widthParticle / 2)) || (x[i] > (canvas.width -  (widthParticle / 2)))) {
                vx[i] = -vx[i];
            }
            if ((y[i] < (widthParticle / 2)) || (y[i] > (canvas.width -  (widthParticle / 2)))) {
                vy[i] = -vy[i];
            }

            // Sense for trail to L and R For a trail
            // L
            var signalStrengthL = 0;
            var signalStrengthR = 0;
            var imageDataL = contextTrail.getImageData(x[i] + Math.sin(direction[i] - scanAngle)*scanLength - scanSize/2 , y[i] + Math.cos(direction[i] - scanAngle)*scanLength - scanSize/2, scanSize, scanSize);
            var dataL = imageDataL.data;
            for (var j = 0; j < dataL.length; j += 4) {
                signalStrengthL += dataL[j] + dataL[j + 1] + dataL[j + 2] + dataL[j + 3];
            }
            // R
            var imageDataR = contextTrail.getImageData(x[i] + Math.sin(direction[i] + scanAngle)*scanLength - scanSize/2 , y[i] + Math.cos(direction[i] + scanAngle)*scanLength - scanSize/2, scanSize, scanSize);
            var dataR = imageDataR.data;
            for (var jj = 0; jj < dataR.length; jj += 4) {
                signalStrengthR += dataR[jj] + dataR[jj + 1] + dataR[jj + 2] + dataL[jj + 3];
            } 
            //Turn towards stronger signal
            if (signalStrengthL > signalStrengthR) {
                direction[i] += -senseTurn;
            }
            else if (signalStrengthR > signalStrengthL) {
                direction[i] += senseTurn;
            }
            // Change direction randomly

            direction[i] += Math.random() * randomTurn - (randomTurn / 2);

            
            //Calculate new position
            x[i] = x[i] + vx[i]*Math.sin(direction[i]);
            y[i] = y[i] + vy[i]*Math.cos(direction[i]);
        }
    }
    paintCanvas();
    window.setTimeout(moveSlime, timestep);
}

function paintCanvas() {

    context.clearRect(0, 0, canvas.width, canvas.height);

    //Paint particles
    for (var i=0; i<N; i++) {
       // context.beginPath();
       // context.arc(x[i], y[i], widthParticle/2, 0, 2*Math.PI);
       // context.fillStyle = colorParticle;
       // context.fill();

        // Paint Trail
        contextTrail.fillStyle = colorTrail;
        contextTrail.fillRect(x[i] - trailSize/2, y[i] - trailSize/2, trailSize, trailSize);
        
    }
    Trailfade()
}

function Trailfade(){

    const imageData = contextTrail.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        //data[i]     = data[i] + 5; // red
        //data[i + 1] = data[i + 1] + 3; // green
        //data[i + 2] = data[i + 2] + 5; // blue
        data[i + 3] = data[i + 3] - 1; // alpha
    }
    contextTrail.putImageData(imageData, 0, 0);

}

function changeN(){

}

paintCanvas();
window.setTimeout(moveSlime, 1000/30);

