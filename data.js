// Point Class Definition
class Point {
  constructor(){
    this.x = null;
    this.y = null
  }

  setX(x){
    this.x = x;
  }

  setY(y){
    this.y = y;
  }

  getX(){
    return this.x;
  }

  getY(){
    return this.y;
  }

  getString(){
    return this.x.toString() + this.y.toString();
  }
}

// Find width of screen. 
var screenWidth = screen.width;
var screenHeight = screen.height;

// Create point on every mouse movement...
var mousePos;

// Create mouse event listener.
document.onmousemove = handleMouseMove;

// Create datastructs for point data.
var dataLength = 10;
var points = [];
var comps = [];
var audio = [];
var hashString = "";

// Init vars for canvas drawing.
var canvas, ctx, flag = false, canvasOn = false, streamOn = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var color = "black",
lW = 2;
var thickness = 5;

var canvas = document.getElementById("imgCanvas");
ctx = canvas.getContext("2d");
w = canvas.width;
h = canvas.height;

//buildRandomNumber() - takes data from entropy sources and builds a generated hash.
function buildRandomNumber(){
  dataLength = document.getElementById("dataLength").value;
  if(dataLength == null || dataLength <= 10 || dataLength > 50){
    dataLength = 10;
  }

  if(points.length != dataLength || comps.length != dataLength || audio.length != dataLength){
    return;
  }

  // Create datastructures for merkle tree hashing.
  var entropy = [];
  var merkleTree = [];

  for(var i = 0; i < dataLength; i++){
    entropy.push(points[i].getString());
    entropy.push(comps[i].getString());
    entropy.push(audio[i]);
  }


  var hash = "";
  while(entropy.length != 0){
    hash = createHashFromKeyAndMessage(entropy.pop(), entropy.pop());
    hash = createHashFromKeyAndMessage(hash.hex(), entropy.pop());
    merkleTree.push(hash);
  }

  while(merkleTree.length != 1){
    hash = createHashFromKeyAndMessage(merkleTree.pop().hex(), merkleTree.pop().hex());
    merkleTree.unshift(hash);
  }

  // Update hash string for export.
  hashString += hash;

  document.getElementById("hash").innerHTML = merkleTree.pop().hex();
}

canvas.addEventListener("mousemove", function (e) {
    findxy('move', e)
}, false);
canvas.addEventListener("mousedown", function (e) {
    findxy('down', e);
    canvasOn = true;
}, false);
canvas.addEventListener("mouseup", function (e) {
    findxy('up', e);
    canvasOn = false;
}, false);
canvas.addEventListener("mouseout", function (e) {
    findxy('out', e);
    canvasOn = false;
}, false);

//
function findxy(res, e) {
    var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop + scrollTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop + scrollTop;
            drawCanvas();
        }
    }
}

function drawCanvas() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lW;
    ctx.stroke();
    ctx.closePath();
}

// Clear data.
function erase() {
    ctx.clearRect(0, 0, w, h);
    points = [];
    comps = [];
    clearPointWindows();
    hashString = "";

    // Remove circle if exists
    if(document.getElementById("zone").hasChildNodes()){
      var node = document.getElementById("zone");
      while (node.hasChildNodes()) {
          node.removeChild(node.lastChild);
      }
    }
    document.getElementById("hash").innerHTML = "###";
}

// Handle mouse event.
function handleMouseMove(event) { 
  if(canvasOn || streamOn){
    mousePos = {
        x: event.pageX,
        y: event.pageY
    };

    // Create point from mouse cursor.
    var p = new Point();
    p.setX(mousePos.x);
    p.setY(mousePos.y);
    points.push(p)

    // Create point from evenly distributed random point generator.
    createDistributedPoints();

    // Bound array size.
    if(points.length > dataLength){
        points.shift();
    }

    // Redraw info box.
    redrawInfoBox();

    // Produce random number.
    buildRandomNumber();
  }
}

// Generates randomly distributed points in a circle. 
function createDistributedPoints(){
    var radius = 125; 
    var c = createPoint(radius);
    comps.push(c);

    // Draw circle with comps to show evenly distributed entropy.
    // Create a div element to represeent a new point on the circle
    var elem = document.createElement('div');
    elem.className += "point";

    // place point on div in relation to center (radius)
    elem.style.top = (Math.round(radius + c.getY())).toString() + "px";
    elem.style.left = (Math.round(radius + c.getX())).toString() + "px";
    elem.style.width = thickness + "px";
    elem.style.height = thickness + "px";
    document.getElementById('zone').appendChild(elem);

    // Bound array size
    if(comps.length > dataLength){
        comps.shift();
    }
}

// Clears data from the data tables. 
function clearPointWindows() {
  // Remove points if exists
  if(document.getElementById("pos_box").hasChildNodes()){
    var node = document.getElementById("pos_box");
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
  }

  // Remove points if exists
  if(document.getElementById("comp_box").hasChildNodes()){
    var node = document.getElementById("comp_box");
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
  }
}

// Draws data to info tables.
function redrawInfoBox(){

  // Clear point data.
  clearPointWindows();

  // Draw points added.
  for(var i = 0; i < points.length; i++){
    var elem = document.getElementById("pos_box");
    elem.className += "point-added";
    elem.innerHTML += "<tr><td>" + points[i].getX() + "</td><td>" + points[i].getY()+ "</td></tr>";
  }

  // Draw comps added.
  for(var i = 0; i < comps.length; i++){
    var elem = document.getElementById("comp_box");
    elem.className += "point-added";
    elem.innerHTML += "<tr><td>" + comps[i].getX() + "</td><td>" + comps[i].getY() + "</td></tr>";
  }
}

// Downloads the generated number.
function download(){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(hashString));
  element.setAttribute('download', "randomHash.txt");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/*
 * createPoint() - function to create random x,y coordinate in unit circle
 *    params:
 *        radius - transformed radius of circle (unit circle -> pixels on display)
 *
 *    return:
 *        p - object of type Point with x and y accessors 
 */
function createPoint(radius){
      var center_x = 0;
      var center_y = 0;

      // get random radius & angle using Math.random() values 0 -> 1
      // radius (width / 2) is transforming unit circle into a pixel representation
      var r = radius*Math.sqrt(Math.random(1)); 
      var angle = Math.random()*Math.PI*2;

      // calculate x,y points on a unit circle using values from above 
      var p = new Point();
      var x = center_x + r*Math.cos(angle);
      var y = center_y + r*Math.sin(angle);
      p.setX(x);
      p.setY(y);

      return p;
}