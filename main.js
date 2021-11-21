const glm = require("gl-matrix");
const mat3 = glm.mat3;
const socket = io();
//const mat3 = require('gl-matrix').mat3;
//import mat3 from 'gl-matrix';

let _x, _y, _z;
let cX, cY, cZ, sX, sY, sZ;

const currentOrientation = {alpha: 0.0, beta: 0.0, gamma: 0.0};
const relativeOrientation = {alpha: 0.0, beta: 0.0, gamma: 0.0};
const initialOrientation = {alpha: 0.0, beta: 0.0, gamma: 0.0};

var outputOrientation = document.querySelector('.orientation');
var initOutputOrientation = document.querySelector('.initOrientation');

var colorButton = document.getElementById('colorButton');
var resetButton = document.getElementById('resetButton');

const fromOrientation = function(out, alpha, beta, gamma) {
	_z = alpha;
	_x = beta;
	_y = -gamma;

	cX = Math.cos( _x );
	cY = Math.cos( _y );
	cZ = Math.cos( _z );
	sX = Math.sin( _x );
	sY = Math.sin( _y );
	sZ = Math.sin( _z );

	out[0] = cZ * cY + sZ * sX * sY,    // row 1, col 1
	out[1] = cX * sZ,                   // row 2, col 1
	out[2] = - cZ * sY + sZ * sX * cY , // row 3, col 1

	out[3] = - cY * sZ + cZ * sX * sY,  // row 1, col 2
	out[4] = cZ * cX,                   // row 2, col 2
	out[5] = sZ * sY + cZ * cY * sX,    // row 3, col 2

	out[6] = cX * sY,                   // row 1, col 3
	out[7] = - sX,                      // row 2, col 3
	out[8] = cX * cY                    // row 3, col 3
};

const currentRotMat=mat3.create(), previousRotMat=mat3.create(), inverseMat=mat3.create(), relativeRotationDelta=mat3.create();
const deg2rad = Math.PI / 180; // Degree-to-Radian conversion
/*
function resetOrientation(){
	window.removeEventListener("deviceorientation", handleOrientation, true);
	window.addEventListener("deviceorientation", setOriginOrientation, false);
	
	setTimeout(() => {
		window.removeEventListener("deviceorientation", setOriginOrientation, false);
		window.addEventListener("deviceorientation", handleOrientation, true);
	}, 100);
}
*/

function resetOrientation() {
	currentOrientation.gamma = 0;
	currentOrientation.beta = 0;
	currentOrientation.alpha = 0;
	console.log("reset orientation");
}


function setOriginOrientation(event){
	fromOrientation(currentRotMat, event.alpha * deg2rad, event.beta * deg2rad, event.gamma * deg2rad);
	//eulerFromRotationMatrix(currentOrientation, relativeRotationDelta);
	// Reset the tracking variables
	resetOrientation();
}


function handleOrientation(event){
	// Compute orientation relative to startin one
	if (!currentRotMat) {
		setOriginOrientation(event);
	}

	mat3.copy(previousRotMat, currentRotMat);

	// get rotation in the previous orientation coordinate
	fromOrientation(currentRotMat, event.alpha * deg2rad, event.beta * deg2rad, event.gamma * deg2rad);
	mat3.transpose(inverseMat, previousRotMat); // for rotation matrix, inverse is transpose
	mat3.multiply(relativeRotationDelta, currentRotMat, inverseMat);

	// add the angular deltas to the cummulative rotation
	// NOTE: exact solution for a general rotation matrix, might be simplified
	// in the case of deltas
	/*
	currentOrientation.gamma += Math.asin(relativeRotationDelta[6]) / deg2rad;
	currentOrientation.beta += Math.asin(relativeRotationDelta[7]) / deg2rad;
	currentOrientation.alpha += Math.asin(relativeRotationDelta[8]) / deg2rad;
	*/
	eulerFromRotationMatrix(relativeOrientation, relativeRotationDelta);
	/*
	currentOrientation.alpha = (360 + relativeOrientation.alpha + currentOrientation.alpha)%360;
	currentOrientation.beta = (360 + relativeOrientation.beta + currentOrientation.beta)%360;
	currentOrientation.gamma = (360 + relativeOrientation.gamma + currentOrientation.gamma) % 360;
	*/
	
	currentOrientation.alpha += relativeOrientation.alpha;
	currentOrientation.beta += relativeOrientation.beta;
	currentOrientation.gamma += relativeOrientation.gamma;

	outputOrientation.textContent = 	`alpha: ${currentOrientation.alpha}\n`;
	outputOrientation.textContent += 	`beta: ${currentOrientation.beta}\n`;
	outputOrientation.textContent += 	`gamma: ${currentOrientation.gamma}\n`;

	socket.emit('deviceOrientation', currentOrientation);
}
// beta=> psi, gamma=> theta, alpha=>phi
function eulerFromRotationMatrix(euler, rotation) {
	let theta, psi, phi;
	if (Math.abs(rotation[6] != 1)) {
		theta = -Math.asin(rotation[6]);
		psi = Math.atan2(rotation[7] / Math.cos(theta), rotation[8] / Math.cos(theta));
		phi = Math.atan2(rotation[3] / Math.cos(theta), rotation[0] / Math.cos(theta));
	}
	else {
		phi = 0;
		if (rotation[6] == -1) {
			theta = Math.PI / 2;
			psi = Math.atan2(rotation[1], rotation[2]);
		}
		else {
			theta = -Math.PI / 2;
			psi = Math.atan2(-rotation[1], -rotation[2]);
		}
	}

	euler.beta = psi / deg2rad;
	euler.gamma = theta / deg2rad;
	euler.alpha = phi / deg2rad;
}

function buttonClicked(btnName){
	let msg = {name: btnName};
	socket.emit('btnClick', msg);
}
/*
colorButton.addEventListener("click", buttonClicked(colorButton.name));
resetButton.addEventListener("click", resetOrientation());
*/

colorButton.onclick = function () { buttonClicked(colorButton.name) };
resetButton.onclick = function () { resetOrientation(); }

// Only if the orientation is available
if (window.DeviceOrientationEvent)
{
	outputOrientation.textContent = "Orientation data available."
	//window.addEventListener("deviceorientation", setOriginOrientation, false);
	//setOriginOrientation();
	//setTimeout(() => {
		//window.removeEventListener("deviceorientation", setOriginOrientation, false);
	window.addEventListener("deviceorientation", handleOrientation, true);
	//}, 100);
}
else{
	outputOrientation.textContent = "Orientation data not available.";
}

socket.on('btnReply', (msg) => {
	document.getElementById('presult').innerHTML = "Click " + msg;
});