const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

let bird = { x: 50, y: 250, radius: 15, velocity: 0, gravity: 0.6, lift: -10 };
let pipes = [];
let gameOver = false;
let score = 0;
let pipeSpeed = 2;
let gameStarted = false;
let gameRunning = false;

// Load assets
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeTop = new Image();
pipeTop.src = "pipe_top.png";

const pipeBottom = new Image();
pipeBottom.src = "pipe_bottom.png";

// Load high scores
let highScores = JSON.parse(localStorage.getItem("flappyHighScores")) || [];

// Start Game Function
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("leaderboard").style.display = "none";
    gameStarted = true;
    gameOver = false;
    gameRunning = true;
    pipes = [];
    bird.y = 250;
    bird.velocity = 0;
    score = 0;
    loop();
}

// Bird Movement
function flap() {
    if (!gameRunning) return;
    bird.velocity = bird.lift;
}

// Pipe Generator (Increased Gap)
function generatePipe() {
    if (!gameRunning) return;
    let gap = 150; // Increased from 100 to 150
    let topHeight = Math.random() * (canvas.height / 2);
    let bottomHeight = canvas.height - topHeight - gap;

    pipes.push({ x: canvas.width, topHeight, bottomHeight });
}

// Game Loop
function loop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bird
    ctx.drawImage(birdImg, bird.x - bird.radius, bird.y - bird.radius, 30, 30);

    // Apply Gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Ground Collision
    if (bird.y + bird.radius >= canvas.height) {
        endGame();
    }

    // Move & Draw Pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Draw pipes
        ctx.drawImage(pipeTop, pipes[i].x, 0, 50, pipes[i].topHeight);
        ctx.drawImage(pipeBottom, pipes[i].x, canvas.height - pipes[i].bottomHeight, 50, pipes[i].bottomHeight);

        // Check Collision
        if (
            bird.x + bird.radius > pipes[i].x &&
            bird.x - bird.radius < pipes[i].x + 50 &&
            (bird.y - bird.radius < pipes[i].topHeight || bird.y + bird.radius > canvas.height - pipes[i].bottomHeight)
        ) {
            endGame();
        }

        // Score Counting
        if (pipes[i].x + 50 === bird.x) {
            score++;
        }
    }

    // Remove off-screen pipes
    pipes = pipes.filter((p) => p.x > -50);

    // Display Score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    requestAnimationFrame(loop);
}

// End Game Function
function endGame() {
    gameRunning = false;
    saveHighScore(score);
    showLeaderboard();
    alert("Game Over! Score: " + score);
    document.getElementById("startScreen").style.display = "block";
}

// Save High Score
function saveHighScore(newScore) {
    highScores.push(newScore);
    highScores.sort((a, b) => b - a); // Sort scores in descending order
    highScores = highScores.slice(0, 5); // Keep top 5 scores
    localStorage.setItem("flappyHighScores", JSON.stringify(highScores));
}

// Show Leaderboard
function showLeaderboard() {
    let leaderboardDiv = document.getElementById("leaderboard");
    let leaderboardList = document.getElementById("leaderboard-list");

    leaderboardList.innerHTML = ""; // Clear previous scores
    highScores.forEach((score, index) => {
        let li = document.createElement("li");
        li.textContent = `#${index + 1}: ${score}`;
        leaderboardList.appendChild(li);
    });

    leaderboardDiv.style.display = "flex"; // Make it visible
}

// Pipe Spawner
setInterval(generatePipe, 2000);

// Event Listeners
document.addEventListener("keydown", flap);
document.addEventListener("click", flap);
