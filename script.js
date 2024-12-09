const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
const particles = []; // Particle system for effects
const fogDensity = 200; // Number of fog particles
const fogParticles = [];

// Initialize mushrooms
for (let i = 0; i < NUM_MUSHROOMS; i++) {
    mushrooms.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocityX: 0, // Velocity for smooth movement
        velocityY: 0,
        radius: 20 + Math.random() * 10,
        currentColor: { r: 255, g: 165, b: 0 },
        targetColor: { r: 255, g: 165, b: 0 },
        triggered: false,
        escapeSpeed: Math.random() * 2 + 1, // Random escape speed
        recoveryTimer: 0
    });
}

// Initialize fog particles
for (let i = 0; i < fogDensity; i++) {
    fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.2 + 0.1,
        size: Math.random() * 50 + 20,
        velocityX: (Math.random() - 0.5) * 0.2,
        velocityY: (Math.random() - 0.5) * 0.2
    });
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

// Update mushroom positions based on velocity
function updateMushroomPositions() {
    mushrooms.forEach(m => {
        m.x += m.velocityX;
        m.y += m.velocityY;

        // Gradually reduce velocity to create inertia effect
        m.velocityX *= 0.95;
        m.velocityY *= 0.95;
    });
}

// Draw mushrooms
function drawMushrooms() {
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

            // Set velocity for smooth escape
            const escapeFactor = 2 / distance; // Adjust escape factor
            m.velocityX = dx * m.escapeSpeed * escapeFactor;
            m.velocityY = dy * m.escapeSpeed * escapeFactor;

            // Add particle effects
            for (let i = 0; i < 20; i++) {
                particles.push({
                    x: m.x,
                    y: m.y,
                    velocityX: (Math.random() - 0.5) * 4,
                    velocityY: (Math.random() - 0.5) * 4,
                    opacity: 1,
                    size: Math.random() * 5 + 2
                });
            }
        }
    });
});

// Update and draw particle effects
function updateParticles() {
    particles.forEach((p, index) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.opacity -= 0.02; // Fade out particles

        if (p.opacity <= 0) particles.splice(index, 1); // Remove faded particles
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        ctx.closePath();
    });
}

// Update and draw fog particles
function updateFog() {
    fogParticles.forEach(f => {
        f.x += f.velocityX;
        f.y += f.velocityY;

        // Wrap fog particles around screen
        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        if (f.y < 0) f.y = canvas.height;
        if (f.y > canvas.height) f.y = 0;
    });
}

function drawFog() {
    fogParticles.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();
        ctx.closePath();
    });
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw fog first for depth
    updateFog();
    drawFog();

    // Update and draw mushrooms
    updateMushroomColors();
    updateMushroomPositions();
    drawMushrooms();

    // Update and draw particles
    updateParticles();
    drawParticles();

    requestAnimationFrame(animate);
}

// Start animation
animate();
