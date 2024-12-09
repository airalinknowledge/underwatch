const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let whispers = [];
let globalTimer = 0;

// Initialize mushrooms
for (let i = 0; i < NUM_MUSHROOMS; i++) {
    mushrooms.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 20 + Math.random() * 10,
        color: 'rgba(255, 165, 0, 1)', // Default orange glow
        triggered: false,
        recoveryTimer: 0
    });
}

// Load and play whisper sounds
function loadWhisperSound() {
    fetch('whisper.mp3') // Replace with your sound file path
        .then(response => response.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => {
            mushrooms.forEach(() => {
                const source = audioCtx.createBufferSource();
                const gainNode = audioCtx.createGain();
                source.buffer = buffer;
                source.loop = true;

                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                gainNode.gain.value = 0.5; // Default volume
                source.start();

                whispers.push({ source, gainNode });
            });
        });
}

// Adjust whisper volume dynamically
function adjustWhisperVolume(mushroom, distance) {
    const index = mushrooms.indexOf(mushroom);
    if (index >= 0) {
        const gain = whispers[index].gainNode.gain;
        gain.value = Math.max(0, 1 - distance / 100); // Reduce volume with distance
    }
}

// Draw mushrooms on canvas
function drawMushrooms() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mushrooms.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Handle mushroom interaction
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mushrooms.forEach(m => {
        const distance = Math.sqrt((mouseX - m.x) ** 2 + (mouseY - m.y) ** 2);

        if (distance < m.radius && !m.triggered) {
            m.color = 'rgba(255, 165, 0, 0.2)'; // Dim the color
            m.triggered = true;
            m.recoveryTimer = 100; // Set recovery time
            adjustWhisperVolume(m, distance); // Adjust sound
            propagateEffect(m);
        }
    });
});

// Spread effect to nearby mushrooms
function propagateEffect(triggeredMushroom) {
    mushrooms.forEach(m => {
        const distance = Math.sqrt(
            (triggeredMushroom.x - m.x) ** 2 +
            (triggeredMushroom.y - m.y) ** 2
        );

        if (distance < 150 && !m.triggered) {
            m.color = 'rgba(255, 165, 0, 0.5)'; // Partially dimmed
            m.triggered = true;
            m.recoveryTimer = 150; // Delayed recovery
        }
    });
}

// Recovery logic for mushrooms
function recoverMushrooms() {
    mushrooms.forEach(m => {
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.color = 'rgba(255, 165, 0, 1)'; // Restore original color
            m.triggered = false;
        }
    });
}

// Animate the canvas
function animate() {
    globalTimer++;
    drawMushrooms();
    recoverMushrooms();

    // Gradually degrade interface
    if (globalTimer % 500 === 0) {
        degradeInterface();
    }

    requestAnimationFrame(animate);
}

// Gradual degradation of the interface
function degradeInterface() {
    mushrooms.forEach(m => {
        m.x += (Math.random() - 0.5) * 10; // Add random drift
        m.y += (Math.random() - 0.5) * 10;
        m.color = `rgba(255, ${Math.random() * 255}, 0, 1)`; // Randomize color
    });
}

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Load sounds and start animation
loadWhisperSound();
animate();
