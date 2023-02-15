const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
const animationDuration = 4;

var paddleSpeed = 5;
var ballSpeed = 6;
var currentVolley = 0;
var userAction = false;

// variables to be used for random serve angle
let rangemax = 3.8;
let rangemin = 0.2;
let randangle = 2;
let randserveside = 1;
let curAnimateFrame = animationDuration;
let animateX = 0;
let animateY = 0;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// new functions -- eli mclean
function move(){
// cpu paddle will move slower, so he's not unbeatable
  if(ball.y > leftPaddle.y){
    leftPaddle.dy = paddleSpeed*.75;
  }
  else if(ball.y < leftPaddle.y){
    leftPaddle.dy = -(paddleSpeed*.75);
  }
}
 function endGame(){
    context.fillStyle = 'red';
    context.fillRect(175,200,400,200);
    context.fillStyle = 'Black';
    context.font = '25px arial';
    context.fillText("Game over", 305, 260);
    playAgain();
}
function playAgain(){
   context.fillText("Press Enter to play again",240,350);
   document.addEventListener('keydown', function(e) {
    if (e.which === 13) {
        location.reload();
      }
  });
}

function generateRandomColors() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}


function playSound(){
  if(userAction){
    var audio = new Audio('pong.mp3');
    audio.play();
  }
}

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);
  if(document.getElementById('score2').innerHTML == 7 ||
     document.getElementById('score1').innerHTML == 7){
      ball.dx = 0;
      ball.dy = 0;
      leftPaddle.dy = 0;
      endGame();
     }
  // move paddles by their velocity
  move();
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
    animateX = ball.x;
    animateY = ball.y;
    curAnimateFrame = 0;
    playSound();
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
    animateX = ball.x;
    animateY = ball.y;
    curAnimateFrame = 0;
    playSound();
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;
    if(ball.x < 0 && currentVolley > 0)
      document.getElementById('score2').innerHTML = parseInt(document.getElementById('score2').innerHTML) + 1;
    else if(ball.x > canvas.width && currentVolley > 0)
      document.getElementById('score1').innerHTML = parseInt(document.getElementById('score1').innerHTML) + 1;

    let longestVolley = parseInt(document.getElementById('longestVolley').innerHTML);
     
    if (currentVolley > longestVolley) {
      document.getElementById('longestVolley').innerHTML = currentVolley;
    }

    // generate random number to be used to send ball at random angle from the serve
    randangle = Math.random() * (rangemax - rangemin) + rangemin;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / randangle; // the height at which the ball starts from is randomized


      // randomly change which side the ball is served toward
      randserveside = Math.floor(Math.random() * 2); // generates either 0 or 1
      if (randserveside == 0) {
        ball.dx *= -1; // switch direction ball is heading (serve to winning side)
      }
      else if (randserveside == 1) {
        ball.dx *= 1; // let ball keep going in same direction (serve to losing side)
      }  

    }, 900);

    currentVolley = 0;
  }

  if(curAnimateFrame < animationDuration){

    context.fillStyle = generateRandomColors();

    for (let i = 0; i < 8; i++) {
      let rectAngle = (i / 8) * (2 * Math.PI);
      let rectX = animateX + 20 * Math.cos(rectAngle);
      let rectY = animateY + 20 * Math.sin(rectAngle);
      context.fillRect(rectX - 20 / 2, rectY - 20 / 2, 20, 20);
    }
    curAnimateFrame++;
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    animateX = ball.x;
    animateY = ball.y;
    curAnimateFrame = 0;
    playSound();

    ball.dx *= -1;
   
    currentVolley +=1;
   
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    animateX = ball.x;
    animateY = ball.y;
    curAnimateFrame = 0;
    playSound();

    ball.dx *= -1;
   
    currentVolley +=1;
   
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {
  // up arrow key
  if (e.which === 38) {
    userAction = true;
    rightPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    userAction = true;
    rightPaddle.dy = paddleSpeed;
  }
});
 
// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }
 
});


// start the game
requestAnimationFrame(loop);