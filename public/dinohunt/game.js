const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const waveEl = document.getElementById('wave');
const attackZone = document.getElementById('attack-zone');
const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const endSummary = document.getElementById('end-summary');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const spikeBtn = document.getElementById('spike-btn');
const fireBtn = document.getElementById('fire-btn');
const spikeCdText = document.getElementById('spike-cd');
const fireCdText = document.getElementById('fire-cd');

const INITIAL_HEALTH = 5;
const TRAP_COOLDOWN = { spike: 8000, fire: 12000 };
const SPEAR_SPEED = 520;

const DINO_TYPES = [
    { img: '/dino.png',           className: 'dino-regular', hp: 1, speed: 42, points: 6 },
    { img: '/dino2.png', className: 'dino-tough',   hp: 1, speed: 34, points: 14 },
    { img: '/dino3.png',        className: 'dino-tough',   hp: 1, speed: 28, points: 22 }
];

let score = 0;
let health = INITIAL_HEALTH;
let wave = 0;
let running = false;
let lastFrameTime = 0;
let dinos = [];
let spears = [];
let trapEffects = [];
let nextSpawnAt = 0;
let waveState = null;
let trapReady = { spike: true, fire: true };

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function setStats() {
    scoreEl.textContent = score;
    healthEl.textContent = health;
    waveEl.textContent = wave;
}

function startGame() {
    score = 0;
    health = INITIAL_HEALTH;
    wave = 0;
    dinos.length = 0;
    spears.length = 0;
    trapEffects.length = 0;
    running = true;
    nextSpawnAt = 0;
    trapReady.spike = true;
    trapReady.fire = true;
    spikeCdText.textContent = 'Ready';
    fireCdText.textContent = 'Ready';
    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    followWave();
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    running = false;
    endSummary.textContent = `Wave ${wave}, Score ${score}`;
    endOverlay.classList.remove('hidden');
}

function followWave() {
    wave += 1;
    setStats();
    const isBossWave = wave % 3 === 0;
    const regularCount = Math.min(24, 2 + wave * 1.8);
    waveState = {
        regularToSpawn: Math.floor(regularCount),
        regularSpawned: 0,
        bossSpawned: false,
        bossAlive: false,
        isBossWave,
        spawnDelay: Math.max(1200, 2100 - wave * 30)
    };
}

function spawnDino(type, isBoss = false) {
    const rect = attackZone.getBoundingClientRect();
    const x = 32 + Math.random() * (rect.width - 64);
    const y = -60;
    let dino;

    if (isBoss) {
        dino = {
            id: crypto.randomUUID(),
            x,
            y,
            hp: 1,
            maxHp: 1,
            speed: Math.max(18, 24 - wave * 0.8),
            points: 45 + wave * 25,
            size: 88,
            className: 'dino-boss',
            img: '/dino.png',
            boss: true
        };
    } else {
        const selection = DINO_TYPES[Math.floor(Math.random() * DINO_TYPES.length)];
        dino = {
            id: crypto.randomUUID(),
            x,
            y,
            hp: 1,
            maxHp: 1,
            speed: Math.max(12, selection.speed + wave * 1.0),
            points: selection.points + Math.floor(wave * 1.2),
            size: selection.className === 'dino-regular' ? 44 : 56,
            className: selection.className,
            img: selection.img,
            boss: false
        };
    }

    const element = document.createElement('div');
    element.className = `dino ${dino.className}`;
    const imgEl = document.createElement('img');
    imgEl.src = dino.img;
    imgEl.alt = 'dino';
    imgEl.style.cssText = 'width:100%;height:100%;object-fit:contain;pointer-events:none;';
    element.appendChild(imgEl);
    element.style.left = `${dino.x}px`;
    element.style.top = `${dino.y}px`;
    element.style.transform = 'translate(-50%, -50%)';

    dino.element = element;
    attackZone.appendChild(element);
    dinos.push(dino);
}

function spawnStep(delta) {
    if (!waveState) return;
    nextSpawnAt -= delta;

    if (nextSpawnAt > 0) return;

    if (waveState.regularSpawned < waveState.regularToSpawn) {
        spawnDino(null, false);
        waveState.regularSpawned += 1;
        nextSpawnAt = waveState.spawnDelay;
        return;
    }

    if (waveState.isBossWave && !waveState.bossSpawned) {
        spawnDino(null, true);
        waveState.bossSpawned = true;
        waveState.bossAlive = true;
        nextSpawnAt = 2200;
        return;
    }

    nextSpawnAt = 1200;
}

function removeDino(dino) {
    dinos = dinos.filter((d) => d.id !== dino.id);
    if (dino.element && dino.element.parentNode) dino.element.remove();
    if (dino.boss) waveState.bossAlive = false;
}

function damageDino(dino, amount) {
    dino.hp -= amount;
    if (dino.hp <= 0) {
        score += dino.points;
        setStats();
        showFloatingText(dino.x, dino.y, `+${dino.points}`, '#2fffa2');
        removeDino(dino);
    } else {
        dino.element.style.opacity = 0.6;
        setTimeout(() => { if (dino.element) dino.element.style.opacity = 1; }, 120);
    }
}

function doTrap(type) {
    if (!trapReady[type] || !running) return;
    trapReady[type] = false;
    const now = performance.now();
    const cooldown = TRAP_COOLDOWN[type];

    const rect = attackZone.getBoundingClientRect();
    const center = { x: rect.width * (0.25 + Math.random() * 0.5), y: rect.height * (0.2 + Math.random() * 0.45) };
    const radius = type === 'spike' ? 110 : 150;
    const damage = type === 'spike' ? 2 : 3;
    const color = type === 'spike' ? '#f88' : '#ffb766';

    const effect = document.createElement('div');
    effect.className = 'trap-zone';
    effect.style.left = `${center.x}px`;
    effect.style.top = `${center.y}px`;
    effect.style.width = `${radius * 2}px`;
    effect.style.height = `${radius * 2}px`;
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.borderColor = color;
    attackZone.appendChild(effect);

    trapEffects.push({ element: effect, expire: now + 350, x: center.x, y: center.y, r: radius });

    dinos.slice().forEach((dino) => {
        const dx = dino.x - center.x;
        const dy = dino.y - center.y;
        if (Math.hypot(dx, dy) <= radius + dino.size * 0.5) {
            damageDino(dino, damage);
        }
    });

    const timer = setInterval(() => {
        const elapsed = performance.now() - now;
        if (elapsed >= cooldown) {
            trapReady[type] = true;
            if (type === 'spike') spikeCdText.textContent = 'Ready';
            if (type === 'fire') fireCdText.textContent = 'Ready';
            clearInterval(timer);
        } else {
            const remaining = Math.ceil((cooldown - elapsed) / 1000);
            if (type === 'spike') spikeCdText.textContent = `${remaining}s`;
            if (type === 'fire') fireCdText.textContent = `${remaining}s`;
        }
    }, 200);
}

function throwSpear(targetX, targetY) {
    const rect = attackZone.getBoundingClientRect();
    if (!running || !rect.width) return;

    const startX = rect.width * 0.5;
    const startY = rect.height - 24;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) return;

    const vx = (dx / dist) * SPEAR_SPEED;
    const vy = (dy / dist) * SPEAR_SPEED;

    const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;

    const spearEl = document.createElement('img');
    spearEl.src = '/spear.png';
    spearEl.alt = 'spear';
    spearEl.className = 'spear';
    spearEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    attackZone.appendChild(spearEl);

    spears.push({ x: startX, y: startY, vx, vy, angle, element: spearEl });
}

function showFloatingText(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'effect-text';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerText = text;
    el.style.color = color;
    el.style.opacity = '1';
    attackZone.appendChild(el);

    const start = performance.now();
    const duration = 800;
    function animate() {
        const now = performance.now();
        const t = (now - start) / duration;
        if (t >= 1) { el.remove(); return; }
        el.style.top = `${y - t * 45}px`;
        el.style.opacity = `${1 - t}`;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

function updateDinos(delta) {
    const zoneHeight = attackZone.getBoundingClientRect().height;
    dinos.slice().forEach((dino) => {
        dino.y += dino.speed * delta;
        dino.element.style.top = `${dino.y}px`;

        const healthFraction = dino.hp / dino.maxHp;
        dino.element.style.filter = `brightness(${0.8 + 0.2 * healthFraction})`;

        if (dino.y > zoneHeight - 16) {
            removeDino(dino);
            health -= 1;
            setStats();
            showFloatingText(dino.x, zoneHeight - 20, '-1 HP', '#ff5555');
            if (health <= 0) {
                endGame();
            }
        }
    });
}

function updateSpears(delta) {
    spears.slice().forEach((spear) => {
        spear.x += spear.vx * delta;
        spear.y += spear.vy * delta;
        spear.element.style.left = `${spear.x}px`;
        spear.element.style.top = `${spear.y}px`;

        const rect = attackZone.getBoundingClientRect();
        if (spear.x < -20 || spear.x > rect.width + 20 || spear.y < -20 || spear.y > rect.height + 20) {
            spear.element.remove();
            spears = spears.filter((s) => s !== spear);
            return;
        }

        for (const dino of dinos) {
            const distance = Math.hypot(dino.x - spear.x, dino.y - spear.y);
            if (distance < dino.size * 0.5 + 8) {
                spear.element.remove();
                spears = spears.filter((s) => s !== spear);
                damageDino(dino, 1);
                break;
            }
        }
    });
}

function updateTraps() {
    const now = performance.now();
    trapEffects.slice().forEach((effect) => {
        if (now >= effect.expire) {
            effect.element.remove();
            trapEffects = trapEffects.filter((e) => e !== effect);
        }
    });
}

function tryNextWave() {
    if (!waveState) return;
    if (!running) return;
    const noDinos = dinos.length === 0;
    const regularDone = waveState.regularSpawned >= waveState.regularToSpawn;
    const bossDead = !waveState.isBossWave || (waveState.isBossWave && !waveState.bossAlive);

    if (noDinos && regularDone && bossDead) {
        setTimeout(() => {
            if (running && dinos.length === 0) {
                followWave();
            }
        }, 800);
    }
}

function gameLoop(time) {
    if (!running) return;
    const delta = Math.min(0.05, (time - lastFrameTime) / 1000);
    lastFrameTime = time;

    spawnStep(delta * 1000);
    updateDinos(delta);
    updateSpears(delta);
    updateTraps();
    tryNextWave();

    if (running) requestAnimationFrame(gameLoop);
}

attackZone.addEventListener('click', (event) => {
    if (!running) return;
    const rect = attackZone.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    throwSpear(x, y);
});

spikeBtn.addEventListener('click', () => doTrap('spike'));
fireBtn.addEventListener('click', () => doTrap('fire'));
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

setStats();
