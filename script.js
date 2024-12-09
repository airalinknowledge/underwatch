const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];

// Initialize mushrooms
for (let i = 0; i < NUM_MUSHROOMS; i++) {
    mushrooms.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        radius: 20 + Math.random() * 10,
        currentColor: { r: 255, g: 165, b: 0 },
        targetColor: { r: 255, g: 165, b: 0 },
        triggered: false,
        recoveryTimer: 0
    });
}

// Linear interpolation function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Update colors
function updateMushroomColors() {
    mushrooms.forEach(m => {
        m.currentColor.r = lerp(m.currentColor.r, m.targetColor.r, 0.02);
        m.currentColor.g = lerp(m.currentColor.g, m.targetColor.g, 0.02);
        m.currentColor.b = lerp(m.currentColor.b, m.targetColor.b, 0.02);
    });
}

// Update positions
function updateMushroomPositions() {
    mushrooms.forEach(m => {
        m.x = lerp(m.x, m.targetX, 0.02);
        m.y = lerp(m.y, m.targetY, 0.02);
    });
}

// Draw mushrooms
function drawMushrooms() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mushrooms.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.round(m.currentColor.r)}, ${Math.round(m.currentColor.g)}, ${Math.round(m.currentColor.b)})`;
        ctx.fill();
        ctx.closePath();
    });
}

// Randomize target colors
function randomizeTargetColors() {
    mushrooms.forEach(m => {
        m.targetColor = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        };
    });
}

// Randomize target positions
function randomizeTargetPositions() {
    mushrooms.forEach(m => {
        m.targetX = Math.random() * canvas.width;
        m.targetY = Math.random() * canvas.height;
    });
}

// Animation loop
function animate() {
    updateMushroomColors();
    updateMushroomPositions();
    drawMushrooms();
    requestAnimationFrame(animate);
}

// Set intervals for randomization
setInterval(randomizeTargetColors, 5000);
setInterval(randomizeTargetPositions, 5000);

// Start animation
animate();
