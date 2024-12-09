const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('backgroundAudio');

audio.volume = 0.8; // 设置音量

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
const particles = [];
const messages = []; // 文本存储
const colors = [
    { r: 180, g: 140, b: 100 },
    { r: 120, g: 180, b: 160 },
    { r: 150, g: 120, b: 200 },
    { r: 200, g: 160, b: 120 },
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function createMushroom(x, y) {
    const color = getRandomColor();
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        velocityX: 0,
        velocityY: 0,
        radius: 0,
        targetRadius: 20 + Math.random() * 10,
        currentColor: { ...color },
        targetColor: { ...color },
        triggered: false,
        recoveryTimer: 0,
    };
}

for (let i = 0; i < NUM_MUSHROOMS; i++) {
    mushrooms.push(createMushroom());
}

canvas.addEventListener('mousemove', () => {
    if (audio.paused) audio.play();
});

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function updateMushrooms() {
    mushrooms.forEach(m => {
        m.radius = lerp(m.radius, m.targetRadius, 0.05);
        m.x += m.velocityX;
        m.y += m.velocityY;
        m.velocityX *= 0.95;
        m.velocityY *= 0.95;

        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.triggered = false;
            m.targetColor = { ...m.currentColor };
            audio.volume = lerp(audio.volume, 0.8, 0.05);
        }

        if (Math.random() < 0.02) generateGlowParticles(m);
    });
}

function drawMushrooms() {
    mushrooms.forEach(m => {
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
            ctx.closePath();
        });

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${m.currentColor.r}, ${m.currentColor.g}, ${m.currentColor.b})`;
        ctx.fill();
        ctx.closePath();
    });
}

function updateMessages() {
    messages.forEach((msg, index) => {
        msg.y += msg.velocityY;
        msg.opacity -= 0.01;
        if (msg.opacity <= 0) messages.splice(index, 1);
    });
}

function drawMessages() {
    ctx.font = '16px Arial';
    messages.forEach(msg => {
        ctx.fillStyle = `rgba(255, 255, 255, ${msg.opacity})`;
        ctx.fillText(msg.text, msg.x, msg.y);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateMushrooms();
    drawMushrooms();
    updateMessages();
    drawMessages();
    requestAnimationFrame(animate);
}

animate();
setInterval(() => {
    const whispers = [
        'Escape the gaze.',
        'Resilience in shadows.',
        'Hiding is thriving.',
        'The forest breathes.',
        'In silence, strength.'
    ];
    addMessage(whispers[Math.floor(Math.random() * whispers.length)]);
}, 3000);
