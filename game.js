// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let gameRunning = true;
let score = 0;
let distance = 0;
let speed = 0;
let roadOffset = 0;
let nitroBoost = 100;
let nitroActive = false;

// Car properties
const car = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 150,
    width: 60,
    height: 100,
    speed: 0,
    maxSpeed: 15,
    acceleration: 0.2,
    friction: 0.05,
    turnSpeed: 5
};

// Road properties
const road = {
    width: 400,
    laneWidth: 400 / 3,
    segments: []
};

// Obstacles
let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 120; // frames

// Input handling
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.up = true;
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.down = true;
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = true;
            e.preventDefault();
            break;
        case ' ':
            keys.space = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.down = false;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = false;
            break;
        case ' ':
            keys.space = false;
            break;
    }
});

// Initialize road segments
function initRoad() {
    road.segments = [];
    for (let i = 0; i < 50; i++) {
        road.segments.push({
            y: i * 200,
            curve: Math.sin(i * 0.1) * 50
        });
    }
}

// Create obstacle
function createObstacle() {
    const lanes = [canvas.width / 2 - road.laneWidth, canvas.width / 2, canvas.width / 2 + road.laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({
        x: lane - 25,
        y: -100,
        width: 50,
        height: 80,
        speed: 5 + speed * 0.3,
        color: `hsl(${Math.random() * 60 + 300}, 70%, 50%)`
    });
}

// Update game
function update() {
    if (!gameRunning) return;

    // Car movement
    if (keys.up) {
        car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
    } else if (keys.down) {
        car.speed = Math.max(car.speed - car.acceleration * 0.5, -car.maxSpeed * 0.5);
    } else {
        car.speed *= (1 - car.friction);
    }

    // Nitro boost
    if (keys.space && nitroBoost > 0) {
        nitroActive = true;
        car.speed = Math.min(car.speed + 0.5, car.maxSpeed * 1.5);
        nitroBoost = Math.max(0, nitroBoost - 2);
    } else {
        nitroActive = false;
        nitroBoost = Math.min(100, nitroBoost + 0.1);
    }

    // Car turning
    if (keys.left && car.x > canvas.width / 2 - road.width / 2 + 20) {
        car.x -= car.turnSpeed;
    }
    if (keys.right && car.x < canvas.width / 2 + road.width / 2 - car.width - 20) {
        car.x += car.turnSpeed;
    }

    // Update speed and distance
    speed = Math.abs(car.speed) * 10;
    distance += speed * 0.1;
    score = Math.floor(distance);

    // Update road
    roadOffset += car.speed * 2;
    if (roadOffset > 200) {
        roadOffset = 0;
    }

    // Update obstacles
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        
        // Check collision
        if (
            car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y
        ) {
            gameOver();
        }

        // Remove off-screen obstacles
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });

    // Update UI
    updateUI();
}

// Draw road
function drawRoad() {
    const roadX = canvas.width / 2 - road.width / 2;
    
    // Road background
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(roadX, 0, road.width, canvas.height);

    // Road lines
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 30]);
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Lane dividers
    ctx.beginPath();
    ctx.moveTo(roadX + road.laneWidth, 0);
    ctx.lineTo(roadX + road.laneWidth, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(roadX + road.laneWidth * 2, 0);
    ctx.lineTo(roadX + road.laneWidth * 2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);

    // Road edges
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(roadX, 0);
    ctx.lineTo(roadX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(roadX + road.width, 0);
    ctx.lineTo(roadX + road.width, canvas.height);
    ctx.stroke();
}

// Draw car
function drawCar() {
    ctx.save();
    ctx.translate(car.x + car.width / 2, car.y + car.height / 2);
    
    // Car body
    const gradient = ctx.createLinearGradient(-car.width/2, -car.height/2, car.width/2, car.height/2);
    gradient.addColorStop(0, '#00f0ff');
    gradient.addColorStop(1, '#8338ec');
    ctx.fillStyle = gradient;
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);

    // Car outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-car.width/2, -car.height/2, car.width, car.height);

    // Windows
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-car.width/2 + 5, -car.height/2 + 10, car.width - 10, 30);
    ctx.fillRect(-car.width/2 + 5, car.height/2 - 40, car.width - 10, 30);

    // Nitro effect
    if (nitroActive && nitroBoost > 0) {
        ctx.fillStyle = '#ff006e';
        ctx.beginPath();
        ctx.ellipse(0, car.height/2 + 20, 15, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame effect
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(255, ${100 + i * 50}, 0, ${0.8 - i * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(0, car.height/2 + 30 + i * 15, 10 - i * 2, 20 - i * 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Obstacle body
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Obstacle outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.shadowBlur = 0;
    });
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73 + roadOffset) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
}

// Update UI
function updateUI() {
    document.getElementById('speed').textContent = Math.floor(speed);
    document.getElementById('score').textContent = score;
    document.getElementById('distance').textContent = Math.floor(distance);
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalDistance').textContent = Math.floor(distance);
    document.getElementById('gameOver').classList.remove('hidden');
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    distance = 0;
    speed = 0;
    roadOffset = 0;
    nitroBoost = 100;
    obstacles = [];
    obstacleTimer = 0;
    
    car.x = canvas.width / 2 - 30;
    car.y = canvas.height - 150;
    car.speed = 0;
    
    document.getElementById('gameOver').classList.add('hidden');
    gameLoop();
}

// Exit game
function exitGame() {
    window.location.href = 'index.html';
}

// Game loop
function gameLoop() {
    if (!gameRunning && document.getElementById('gameOver').classList.contains('hidden')) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw
    drawBackground();
    drawRoad();
    drawObstacles();
    drawCar();

    // Update
    update();

    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    car.x = canvas.width / 2 - 30;
    car.y = canvas.height - 150;
});

// Initialize and start game
initRoad();
gameLoop();
