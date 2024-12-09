const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('backgroundAudio');

// Audio volume control
audio.volume = 0.5; // Default volume
audio.play();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
const particles = [];
const fogParticles = [];
const colors = [
    { r: 180, g: 140, b: 100 }, // Soft brown-orange
    { r: 120, g: 180, b: 160 }, // Soft green-cyan
    { r: 150, g: 120, b: 200 }, // Soft lavender
    { r: 200, g: 160, b: 120 }, // Soft beige
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize mushrooms
function createMushroom(x, y) {
    const color = getRandomColor();
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        velocityX: 0,
        velocityY: 0,
        radius: 0, // Start small for growth animation
        targetRadius: 20 + Math.random() * 10, // Full-grown radius
        currentColor: { ...color },
        targetColor: { ...color },
        triggered: false,
        recoveryTimer: 0,
        glowOpacity: Math.random() * 0.5 + 0.5,
        escapeSpeed: Math.random() * 2 + 1,
    };
}

for (let i = 0; i < NUM_MUSHROOMS; i++) {
    mushrooms.push(createMushroom());
}

// Initialize fog particles
for (let i = 0; i < 100; i++) {
    fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 20,
        opacity: Math.random() * 0.2 + 0.1,
        velocityX: (Math.random() - 0.5) * 0.1,
        velocityY: (Math.random() - 0.5) * 0.1,
    });
}

// Linear interpolation function
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Update mushrooms
function updateMushrooms() {
    mushrooms.forEach((m, index) => {
        // Growth animation
        m.radius = lerp(m.radius, m.targetRadius, 0.05);

        m.x += m.velocityX;
        m.y += m.velocityY;

        // Reduce velocity for inertia
        m.velocityX *= 0.95;
        m.velocityY *= 0.95;

        // Recovery logic
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.triggered = false;
            m.targetColor = { ...m.currentColor }; // Restore original color
            audio.volume = lerp(audio.volume, 0.5, 0.05); // Restore audio volume
        }

        // Regenerate mushroom if it leaves the screen
        if (m.x < -50 || m.x > canvas.width + 50 || m.y < -50 || m.y > canvas.height + 50) {
            mushrooms.splice(index, 1);
            mushrooms.push(createMushroom());
        }
    });
}

// Draw mushrooms
function drawMushrooms() {
    mushrooms.forEach(m => {
        // Glow effect
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.currentColor.r}, ${m.currentColor.g}, ${m.currentColor.b}, ${m.glowOpacity * 0.3})`;
        ctx.fill();
        ctx.closePath();

        // Mushroom body
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.round(m.currentColor.r)}, ${Math.round(m.currentColor.g)}, ${Math.round(m.currentColor.b)})`;
        ctx.fill();
        ctx.closePath();
    });
}

// Mouse interaction
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mushrooms.forEach(m => {
        const dx = m.x - mouseX;
        const dy = m.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50 && !m.triggered) {
            m.triggered = true;
            m.targetColor = { r: 100, g: 50, b: 0 };
            m.recoveryTimer = 200;

            // Escape velocity
            const escapeFactor = 2 / distance;
            m.velocityX = dx * m.escapeSpeed * escapeFactor;
            m.velocityY = dy * m.escapeSpeed * escapeFactor;

            // Lower audio volume
            audio.volume = lerp(audio.volume, 0.1, 0.1);
        }
    });
});

// Update and draw fog
function updateFog() {
    fogParticles.forEach(f => {
        f.x += f.velocityX;
        f.y += f.velocityY;

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

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw fog
    updateFog();
    drawFog();

    // Update and draw mushrooms
    updateMushrooms();
    drawMushrooms();

    // Request next frame
    requestAnimationFrame(animate);
}

// Start animation
animate();
