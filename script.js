const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
const particles = []; // Particle system for triggered effects
const backgroundParticles = []; // Background firefly particles
const colors = [
    { r: 200, g: 150, b: 100 }, // Soft brown-orange
    { r: 100, g: 180, b: 200 }, // Soft cyan
    { r: 150, g: 100, b: 200 }, // Soft purple
    { r: 180, g: 200, b: 120 }, // Soft green
    { r: 200, g: 180, b: 100 }  // Soft yellow
];

// Initialize mushrooms
for (let i = 0; i < NUM_MUSHROOMS; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    mushrooms.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 20 + Math.random() * 10,
        currentColor: { ...color },
        originalColor: { ...color }, // Store original color for recovery
        targetColor: { ...color },
        velocityX: 0, // Velocity for smooth movement
        velocityY: 0,
        triggered: false,
        recoveryTimer: 0,
        glowOpacity: Math.random() * 0.5 + 0.5 // Random initial glow
    });
}

// Initialize background particles (fireflies)
for (let i = 0; i < 100; i++) {
    backgroundParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.5,
        velocityX: (Math.random() - 0.5) * 0.2,
        velocityY: (Math.random() - 0.5) * 0.2
    });
}

// Linear interpolation function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Smoothly update mushroom colors
function updateMushroomColors() {
    mushrooms.forEach(m => {
        const speed = 0.02;
        m.currentColor.r = lerp(m.currentColor.r, m.targetColor.r, speed);
        m.currentColor.g = lerp(m.currentColor.g, m.targetColor.g, speed);
        m.currentColor.b = lerp(m.currentColor.b, m.targetColor.b, speed);
    });
}

// Update mushroom positions and glow opacity
function updateMushrooms() {
    mushrooms.forEach(m => {
        m.x += m.velocityX;
        m.y += m.velocityY;

        // Gradually reduce velocity for inertia
        m.velocityX *= 0.95;
        m.velocityY *= 0.95;

        // Recover position and color
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.triggered = false;
            m.targetColor = { ...m.originalColor };
        }

        // Smooth glow effect
        m.glowOpacity = lerp(m.glowOpacity, 0.8, 0.01);
    });
}

// Draw mushrooms with glow effect
function drawMushrooms() {
    mushrooms.forEach(m => {
        // Draw glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.currentColor.r}, ${m.currentColor.g}, ${m.currentColor.b}, ${m.glowOpacity * 0.3})`;
        ctx.fill();
        ctx.closePath();

        // Draw mushroom
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
            m.velocityX = dx * escapeFactor;
            m.velocityY = dy * escapeFactor;

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

// Update and draw particles
function updateParticles() {
    particles.forEach((p, index) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.opacity -= 0.02; // Fade out particles

        if (p.opacity <= 0) particles.splice(index, 1); // Remove faded particles
    });
}

function drawParticle
