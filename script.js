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
        originalX: null, // Store initial position
        originalY: null, // Store initial position
        radius: 20 + Math.random() * 10,
        currentColor: { r: 255, g: 165, b: 0 },
        targetColor: { r: 255, g: 165, b: 0 },
        triggered: false,
        escapeSpeed: Math.random() * 2 + 1, // Random escape speed
        recoveryTimer: 0
    });
    mushrooms[mushrooms.length - 1].originalX = mushrooms[mushrooms.length - 1].x;
    mushrooms[mushrooms.length - 1].originalY = mushrooms[mushrooms.length - 1].y;
}

// Linear interpolation function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Smoothly update colors
function updateMushroomColors() {
    mushrooms.forEach(m => {
        const speed = 0.02;
        m.currentColor.r = lerp(m.currentColor.r, m.targetColor.r, speed);
        m.currentColor.g = lerp(m.currentColor.g, m.targetColor.g, speed);
        m.currentColor.b = lerp(m.currentColor.b, m.targetColor.b, speed);
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

// Handle mouse interactions
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mushrooms.forEach(m => {
        const dx = m.x - mouseX;
        const dy = m.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50 && !m.triggered) { // Trigger condition
            m.triggered = true;
            m.targetColor = { r: 100, g: 50, b: 0 }; // Dim color
            m.recoveryTimer = 200; // Escape duration

            // Neighboring mushrooms
            mushrooms.forEach(neighbor => {
                const nx = neighbor.x - m.x;
                const ny = neighbor.y - m.y;
                const neighborDistance = Math.sqrt(nx * nx + ny * ny);

                if (neighborDistance < 150 && !neighbor.triggered) {
                    neighbor.triggered = true;
                    neighbor.targetColor = { r: 150, g: 100, b: 50 }; // Slightly dimmer
                    neighbor.recoveryTimer = 200;

                    // Escape direction for neighbors
                    const escapeFactor = 1.5 / neighborDistance;
                    neighbor.x += nx * neighbor.escapeSpeed * escapeFactor;
                    neighbor.y += ny * neighbor.escapeSpeed * escapeFactor;
                }
            });

            // Escape direction for triggered mushroom
            const escapeFactor = 2 / distance; // Adjust escape factor
            m.x += dx * m.escapeSpeed * escapeFactor;
            m.y += dy * m.escapeSpeed * escapeFactor;
        }
    });
});

// Recover mushrooms gradually
function recoverMushrooms() {
    mushrooms.forEach(m => {
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            // Restore original state
            m.triggered = false;
            m.targetColor = { r: 255, g: 165, b: 0 };
            m.x = lerp(m.x, m.originalX, 0.1); // Gradually return
            m.y = lerp(m.y, m.originalY, 0.1); // Gradually return
        }
    });
}

// Animation loop
function animate() {
    updateMushroomColors();
    recoverMushrooms();
    drawMushrooms();
    requestAnimationFrame(animate);
}

// Start animation
animate();
