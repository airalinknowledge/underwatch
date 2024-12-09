const canvas = document.getElementById('mushroomCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_MUSHROOMS = 50;
const NUM_PARTICLES = 100; // 粒子数量
const NUM_FOG_PARTICLES = 50; // 雾粒子数量
const mushrooms = [];
const particles = []; // 粒子数组
const fogParticles = []; // 雾粒子数组
const texts = []; // 文本存储
const mouseTrail = [];//鼠标轨迹记录
const ripples = [];//涟漪效果
const backgroundTexts = [
    "In the hushed sanctuaries beneath the ancient canopies...",
    "I, the humble mushroom, emerge...",
    "Amidst the decaying foliage, I thrive...",
    "My existence is a clandestine ballet...",
    "Beneath the surface, an intricate tapestry unfolds...",
    "In the damp, verdant alcoves, I flourish...",
    "Through the alchemy of decomposition, I liberate...",
    "My spores embark upon journeys dictated by the whims of the wind...",
    "In form, I am a study in diversity...",
    "I am the harbinger of transformation...",
    "I embody the eternal cycle, eluding the grasp of dominion...",
    "In the symphony of the woodland's breath, I am defiance..."
];

let elapsedTime = 0; // 页面停留时间（以帧为单位）

// 线性插值函数
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// 随机颜色生成
function getRandomColor() {
    const colors = [
        { r: 180, g: 140, b: 100 },
        { r: 120, g: 180, b: 160 },
        { r: 150, g: 120, b: 200 },
        { r: 200, g: 160, b: 120 }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 创建蘑菇
function createMushroom(x, y) {
    const color = getRandomColor();
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        velocityX: 0,
        velocityY: 0,
        radius: 0, // 初始半径为 0
        targetRadius: 20 + Math.random() * 10, // 最终半径
        currentColor: { ...color },
        targetColor: { ...color },
        originalColor: { ...color },
        triggered: false,
        recoveryTimer: 0,
    };
}

// 更新蘑菇颜色
function updateMushroomColors() {
    mushrooms.forEach(m => {
        const speed = 0.01; // 减缓颜色变化速度
        m.currentColor.r = lerp(m.currentColor.r, m.targetColor.r, speed);
        m.currentColor.g = lerp(m.currentColor.g, m.targetColor.g, speed);
        m.currentColor.b = lerp(m.currentColor.b, m.targetColor.b, speed);
    });
}





// 鼠标交互逻辑（调整逃逸速度）
canvas.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

 // 记录鼠标轨迹
    mouseTrail.push({ x: mouseX, y: mouseY, opacity: 1 });
    if (mouseTrail.length > 50) mouseTrail.shift(); // 限制轨迹点数量

    mushrooms.forEach(m => {
        const dx = m.x - mouseX;
        const dy = m.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 动态调整逃逸速度，进一步降低速度
        const escapeFactor = 0.05; // 固定逃逸速度因子（更慢）

        if (distance < 50 && !m.triggered) {
            m.triggered = true;
            m.targetColor = { r: 100, g: 50, b: 0 }; // 颜色变暗
            m.recoveryTimer = 300;

            // 根据鼠标位置计算逃逸方向和速度
            m.velocityX = dx * escapeFactor;
            m.velocityY = dy * escapeFactor;

            // 创建涟漪
            createRipple(mouseX, mouseY);
        }
    });
});

// 创建涟漪效果（修复未定义问题）
function createRipple(x, y) {
    ripples.push({ x, y, radius: 0, opacity: 1 });
}

// 更新涟漪
function updateRipples() {
    ripples.forEach((r, index) => {
        r.radius += 2; // 涟漪扩散速度
        r.opacity -= 0.02; // 涟漪逐渐消失
        if (r.opacity <= 0) ripples.splice(index, 1); // 移除消失的涟漪
    });
}

// 绘制涟漪
function drawRipples() {
    ripples.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    });
}

// 绘制鼠标轨迹（去除颤抖）
function drawMouseTrail() {
    mouseTrail.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity})`;
        ctx.fill();
        ctx.closePath();

        // 逐渐减少轨迹透明度
        mouseTrail[index].opacity -= 0.015; // 调整消退速度
        if (mouseTrail[index].opacity <= 0) mouseTrail.shift();
    });
}




// 更新蘑菇状态
function updateMushrooms() {
    mushrooms.forEach((m, index) => {
        m.x += m.velocityX;
        m.y += m.velocityY;

        // 减速效果
        m.velocityX *= 0.96;
        m.velocityY *= 0.96;

        // 恢复逻辑
        if (m.triggered && m.recoveryTimer > 0) {
            m.recoveryTimer--;
        } else if (m.triggered && m.recoveryTimer === 0) {
            m.triggered = false; // 恢复触发状态
            m.targetColor = { ...m.originalColor }; // 恢复原始颜色
        }

        // 增大到目标半径
        m.radius = lerp(m.radius, m.targetRadius, 0.02);

        // 超出屏幕边界时重新生成
        if (m.x < -50 || m.x > canvas.width + 50 || m.y < -50 || m.y > canvas.height + 50) {
            mushrooms.splice(index, 1);
            mushrooms.push(createMushroom());
        }
    });
}







// 绘制蘑菇（调整呼吸效果的周期）
function drawMushrooms() {
    mushrooms.forEach(m => {
        // 绘制阴影
        ctx.beginPath();
        ctx.arc(m.x + 5, m.y + 5, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, 0.2)`; // 阴影颜色
        ctx.fill();
        ctx.closePath();

        // 绘制蘑菇
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);

        // 调整辉光的变化速度（呼吸效果）
        const glow = Math.sin(elapsedTime / 150) * 10 + 30; // 调整为更慢的周期
        ctx.fillStyle = `rgb(${Math.round(m.currentColor.r + glow)}, ${Math.round(m.currentColor.g + glow)}, ${Math.round(m.currentColor.b)})`;
        ctx.fill();
        ctx.closePath();
    });
}


// 创建粒子
function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.5,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5
    };
}

// 创建雾粒子
function createFogParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        opacity: Math.random() * 0.1 + 0.1,
        velocityX: (Math.random() - 0.5) * 0.2,
        velocityY: (Math.random() - 0.5) * 0.2
    };
}

// 初始化蘑菇、粒子、雾
for (let i = 0; i < NUM_MUSHROOMS; i++) mushrooms.push(createMushroom());
for (let i = 0; i < NUM_PARTICLES; i++) particles.push(createParticle());
for (let i = 0; i < NUM_FOG_PARTICLES; i++) fogParticles.push(createFogParticle());

// 添加 2-3 条新背景文本
function addTexts() {
    const count = Math.floor(Math.random() * 2) + 2; // 随机 2-3 条
    const screenHeight = canvas.height;
    const upperLimit = screenHeight * 0.4; // 上半区域
    const lowerLimit = screenHeight * 0.6; // 下半区域

    for (let i = 0; i < count; i++) {
        const content = backgroundTexts[Math.floor(Math.random() * backgroundTexts.length)];
        texts.push({
            text: content,
            opacity: 0, // 初始透明度为 0，淡入效果
            phase: 'fadeIn', // 当前阶段为淡入
            x: Math.random() * canvas.width * 0.8,
            y: i === 0
                ? Math.random() * upperLimit
                : Math.random() * (screenHeight - lowerLimit) + lowerLimit,
            duration: 500,
            fadeInDuration: 100,
            fadeOutDuration: 100
        });
    }
}

// 定期添加背景文本
setInterval(addTexts, 8000);

// 更新背景文本
function updateTexts() {
    texts.forEach((t, index) => {
        if (t.phase === 'fadeIn') {
            t.opacity += 1 / t.fadeInDuration;
            if (t.opacity >= 1) {
                t.opacity = 1;
                t.phase = 'visible';
            }
        } else if (t.phase === 'visible') {
            t.duration--;
            if (t.duration <= t.fadeOutDuration) {
                t.phase = 'fadeOut';
            }
        } else if (t.phase === 'fadeOut') {
            t.opacity -= 1 / t.fadeOutDuration;
            if (t.opacity <= 0) {
                texts.splice(index, 1);
            }
        }
    });
}

// 绘制背景文本
function drawTexts() {
    ctx.font = '16px Courier New';
    texts.forEach(t => {
        ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity})`;
        ctx.fillText(t.text, t.x, t.y);
    });
}

// 更新粒子（增强深度感知）
function updateParticles() {
    particles.forEach(p => {
        p.x += p.velocityX;
        p.y += p.velocityY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
}

// 绘制粒子（增强深度感知）
function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        const depthEffect = Math.sin((p.x + p.y + elapsedTime) / 100) * 0.2 + 0.8; // 动态透明度变化
        ctx.arc(p.x, p.y, p.size * depthEffect, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * depthEffect})`;
        ctx.fill();
        ctx.closePath();
    });
}

// 更新雾粒子
function updateFogParticles() {
    fogParticles.forEach(f => {
        f.x += f.velocityX;
        f.y += f.velocityY;

        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        if (f.y < 0) f.y = canvas.height;
        if (f.y > canvas.height) f.y = 0;
    });
}

// 绘制雾粒子
function drawFogParticles() {
    fogParticles.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.fill();
        ctx.closePath();
    });
}
// 动画循环
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制雾和粒子
    updateFogParticles();
    drawFogParticles();
    updateParticles();
    drawParticles();

    // 绘制鼠标轨迹和涟漪
    drawMouseTrail();
 


    // 更新背景文本
    updateTexts();
    drawTexts();

    // 更新蘑菇
    updateMushroomColors();
    updateMushrooms();
    drawMushrooms();

    // 动态模糊
    elapsedTime++;
    const blurAmount = Math.min(3 * (elapsedTime / (60 * 420)), 30);
    canvas.style.filter = `blur(${blurAmount}px)`;

    requestAnimationFrame(animate);
}

// 启动动画
animate();
