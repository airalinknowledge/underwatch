const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('backgroundAudio');

audio.volume = 0.8; // 设置音量

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const mushrooms = [];
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
        radius: 0, // 从小开始生长
        targetRadius: 20 + Math.random() * 10, // 最终半径
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
    mushrooms.forEach((m, index) => {
        // 生长动画
        m.radius = lerp(m.radius, m.targetRadius, 0.05);

        m.x += m.velocityX;
        m.y += m.velocityY;

        // 慢慢减速
        m.velocityX *= 0.95;
        m.velocityY *= 0.95;

        // 恢复逻辑
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.triggered = false;
            m.targetColor = { ...m.currentColor };
            audio.volume = lerp(audio.volume, 0.8, 0.05);
        }

        // 如果蘑菇离开屏幕，重新生成
        if (m.x < -50 || m.x > canvas.width + 50 || m.y < -50 || m.y > canvas.height + 50) {
            mushrooms.splice(index, 1);
            mushrooms.push(createMushroom());
        }
    });
}

function drawMushrooms() {
    mushrooms.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.round(m.currentColor.r)}, ${Math.round(m.currentColor.g)}, ${Math.round(m.currentColor.b)})`;
        ctx.fill();
        ctx.closePath();
    });
}

canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    mushrooms.forEach(m => {
        const dx = m.x - mouseX;
        const dy = m.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50 && !m.triggered) {
            m.triggered = true;
            m.targetColor = { r: 100, g: 50, b: 0 }; // 触发时变暗
            m.recoveryTimer = 200;

            // 设置逃逸速度
            const escapeFactor = 2 / distance;
            m.velocityX = dx * escapeFactor;
            m.velocityY = dy * escapeFactor;

            // 音量降低
            audio.volume = lerp(audio.volume, 0.2, 0.1);
        }
    });
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateMushrooms();
    drawMushrooms();
    requestAnimationFrame(animate);
}

animate();
