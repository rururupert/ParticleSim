//Get variables
var canvas = document.getElementById("c");
var context = canvas.getContext("2d");
var canvasTrail = document.getElementById("c_trail");
var contextTrail = canvasTrail.getContext("2d");
var canvasBg = document.getElementById("c_Bg");
var contextBg = canvasBg.getContext("2d");
var bgColorSelect = document.getElementById('bgColorSelect');
var nSlider = document.getElementById('nSlider');
var startButton = document.getElementById('startButton');
var numberSpecies = 1;
var colorTrailCustom = "rgb(255, 255, 255)"

var timestep = 1000/1000;  //Does not seem to do anything
var running = false;

var widthParticle = 3;
var nMax = Number(nSlider.max);				// maximum number of molecules
var N = Number(nSlider.value);									// current number of molecules 
var stepsPerFrame = 2;     //affects trail length
var colorParticle = "red";
var colorTrailG = "rgb(0, 225, 0)"; 
var colorTrailR = "rgb(255, 0, 0)"; 
var trailSize = 1;

//Controller variables
var initialSpeed = 0.6; 
var scanSize = 2;           //size of area particles scan
var scanAngle = 0.785;         //Scan angle (0.785 = 45 degrees)
var scanLength = 9;
var randomTurn = 1; //rads
var senseTurn = 0.785;  //rads

var  x = new Array(nMax),  y = new Array(nMax);
var vx = new Array(nMax), vy = new Array(nMax);
var direction = new Array(nMax);

//Set starting particle parameters
for (var i=0; i<nMax; i++) {
    //x[i] = Math.random() * canvas.width;  
    //y[i] = Math.random() * canvas.height;
    x[i] = canvas.width / 2; 
    y[i] = canvas.height / 2;
    vx[i] = initialSpeed;     
    vy[i] = initialSpeed;     
    direction[i] = Math.random()*2*Math.PI; 
}

// Color background 
function changeBg () {
    contextBg.fillStyle = bgColorSelect.options[bgColorSelect.selectedIndex].value;
    contextBg.fillRect(0, 0, canvas.width, canvas.height);
}
changeBg () 

function simulate() {
    moveSlime()
    if (running){
        window.setTimeout(simulate, timestep);
    }
}

function moveSlime() {
    for (var step=0; step<stepsPerFrame; step++) {
        for (var i=0; i<N; i++) {
            // Check for bounces on border walls
            if ((x[i] < (widthParticle / 2)) || (x[i] > (canvas.width -  (widthParticle / 2)))) {
                vx[i] = -vx[i];
            }
            if ((y[i] < (widthParticle / 2)) || (y[i] > (canvas.width -  (widthParticle / 2)))) {
                vy[i] = -vy[i];
            }        
            // Sense for trail to L and R For a trail         
            var signalStrengthL = 0;
            var signalStrengthR = 0;
            var imageDataR = contextTrail.getImageData(x[i] + Math.sin(direction[i] + scanAngle)*scanLength - scanSize/2 , y[i] + Math.cos(direction[i] + scanAngle)*scanLength - scanSize/2, scanSize, scanSize);
            var imageDataL = contextTrail.getImageData(x[i] + Math.sin(direction[i] - scanAngle)*scanLength - scanSize/2 , y[i] + Math.cos(direction[i] - scanAngle)*scanLength - scanSize/2, scanSize, scanSize);
            var dataL = imageDataL.data;
            var dataR = imageDataR.data;
            for (var j = 0; j < dataR.length; j += 4) {
                if (numberSpecies == 2) {
                    if (i % 2 == 0){
                        signalStrengthR += dataR[j] - dataR[j + 1] + dataR[j + 2] + dataL[j + 3];
                        signalStrengthL += dataL[j] - dataL[j + 1] + dataL[j + 2] + dataL[j + 3];
                    }
                    else{
                        signalStrengthR += -dataR[j] + dataR[j + 1] + dataR[j + 2] + dataL[j + 3];
                        signalStrengthL += -dataL[j] + dataL[j + 1] + dataL[j + 2] + dataL[j + 3];
                    }
                } else {  
                    signalStrengthR += dataR[j] + dataR[j + 1] + dataR[j + 2] + dataR[j + 3];
                    signalStrengthL += dataL[j] + dataL[j + 1] + dataL[j + 2] + dataL[j + 3];
                }
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
    paintCanvas()
}

function paintCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i=0; i<N; i++) {
        //Paint Particles
       // context.beginPath();
       // context.arc(x[i], y[i], widthParticle/2, 0, 2*Math.PI);
       // context.fillStyle = colorParticle;
       // context.fill();
        // Paint Trail 
        if (numberSpecies == 2) {
            if ((i % 2) == 0){
                contextTrail.fillStyle = colorTrailR;    
            } else{
                contextTrail.fillStyle = colorTrailG;
            }   
        } else {
            contextTrail.fillStyle = colorTrailCustom;
        }
        contextTrail.fillRect(x[i] - trailSize/2, y[i] - trailSize/2, trailSize, trailSize); 
    }
    Trailfade()
}

function Trailfade(){
    const imageData = contextTrail.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i + 3] -= 1; // alpha
    }
    contextTrail.putImageData(imageData, 0, 0);
}

//Function to change number of particles being drawn
function changeN(){
    var newN = Number(nSlider.value);
    N = newN;
    paintCanvas();
}

// Function to start or pause the simulation:
function startStop() {
    running = !running;
    if (running) {
        startButton.value = "Pause";
        simulate();
    }else {
        startButton.value = "Resume";
    }
}
