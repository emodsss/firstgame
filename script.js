const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timerEl = document.getElementById("timer");
const toastEl = document.querySelector(".toast");
const restartBtn = document.getElementById("restart");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = new Set();
const stars = Array.from({ length: 70 }, () => createStar());
const glitchSprites = ["#ff5fd8", "#46f2ff", "#ffe066", "#8e5bff"];
const orbColors = ["#ffe066", "#ff9ed8", "#9dfffd", "#d7a0ff"];

function drawRoundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

const state = {
  score: 0,
  combo: 1,
  comboTimer: 0,
  timeLeft: 60,
  playing: true,
  elapsed: 0,
};

const player = {
  width: 48,
  height: 48,
  x: WIDTH / 2 - 24,
  y: HEIGHT - 90,
  speed: 280,
  dashSpeed: 640,
  dashTimer: 0,
  dashCooldown: 0,
  trail: [],
};

let orbSpawn = 1.2;
let glitchSpawn = 1.6;
const orbs = [];
const glitches = [];

let lastTime = 0;
let frameDelta = 0;
let toastTimeout;

const fx = {
  shockwave: 0,
};

function resetGame() {
  state.score = 0;
  state.combo = 1;
  state.comboTimer = 0;
  state.timeLeft = 60;
  state.playing = true;
  state.elapsed = 0;
  player.x = WIDTH / 2 - player.width / 2;
  player.dashCooldown = 0;
  player.dashTimer = 0;
  player.trail = [];
  orbs.length = 0;
  glitches.length = 0;
  orbSpawn = 0.8;
  glitchSpawn = 1.4;
  hideToast();
}

function createStar() {
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 30 + 20,
    alpha: Math.random() * 0.6 + 0.2,
  };
}

function spawnOrb() {
  const radius = 11 + Math.random() * 6;
  orbs.push({
    x: Math.random() * (WIDTH - radius * 2) + radius,
    y: -radius,
    radius,
    speed: 130 + Math.random() * 60,
    pulse: Math.random() * Math.PI,
    color: orbColors[Math.floor(Math.random() * orbColors.length)],
  });
}

function spawnGlitch() {
  const size = 26 + Math.random() * 26;
  glitches.push({
    x: Math.random() * (WIDTH - size),
    y: -size,
    width: size,
    height: size,
    speed: 170 + Math.random() * 80,
    shake: Math.random() * Math.PI * 2,
    color: glitchSprites[Math.floor(Math.random() * glitchSprites.length)],
  });
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove("visible"), 1800);
}

function hideToast() {
  toastEl.classList.remove("visible");
  clearTimeout(toastTimeout);
}

function updateHUD() {
  scoreEl.textContent = Math.floor(state.score);
  comboEl.textContent = `x${state.combo.toFixed(1)}`;
  timerEl.textContent = Math.max(0, Math.ceil(state.timeLeft));
}

function updatePlayer(dt) {
  let velocity = player.speed;
  if (player.dashTimer > 0) {
    velocity = player.dashSpeed;
    player.dashTimer -= dt;
  }

  if (player.dashCooldown > 0) {
    player.dashCooldown -= dt;
  }

  let direction = 0;
  if (keys.has("ArrowLeft")) direction -= 1;
  if (keys.has("ArrowRight")) direction += 1;

  player.x += direction * velocity * dt;
  player.x = Math.min(Math.max(player.x, 12), WIDTH - player.width - 12);

  player.trail.unshift({ x: player.x + player.width / 2, y: player.y + player.height / 2, life: 0.35 });
  if (player.trail.length > 25) player.trail.pop();
}

function attemptDash() {
  if (player.dashCooldown <= 0 && state.playing) {
    player.dashTimer = 0.22;
    player.dashCooldown = 2.4;
    fx.shockwave = 0.45;
    showToast("Dash éclair !");
  }
}

function updateEntities(dt) {
  orbSpawn -= dt;
  glitchSpawn -= dt;

  if (orbSpawn <= 0) {
    spawnOrb();
    orbSpawn = 0.6 + Math.random() * 0.6;
  }

  if (glitchSpawn <= 0) {
    spawnGlitch();
    glitchSpawn = 1 + Math.random() * 0.9;
  }

  orbs.forEach((orb) => {
    orb.y += orb.speed * dt;
    orb.pulse += dt * 3;
  });

  glitches.forEach((glitch) => {
    glitch.y += glitch.speed * dt;
    glitch.shake += dt * 6;
  });

  removeOffscreen(orbs, (orb) => orb.y - orb.radius > HEIGHT + 40);
  removeOffscreen(glitches, (glitch) => glitch.y - glitch.height > HEIGHT + 40);
}

function removeOffscreen(collection, predicate) {
  for (let i = collection.length - 1; i >= 0; i -= 1) {
    if (predicate(collection[i])) collection.splice(i, 1);
  }
}

function detectCollisions() {
  for (let i = orbs.length - 1; i >= 0; i -= 1) {
    const orb = orbs[i];
    if (circleRectCollision(orb, player)) {
      handleOrbPickup(orb);
      orbs.splice(i, 1);
    }
  }

  for (let i = glitches.length - 1; i >= 0; i -= 1) {
    const glitch = glitches[i];
    if (rectIntersect(glitch, player)) {
      handleGlitchHit();
      glitches.splice(i, 1);
    }
  }
}

function circleRectCollision(circle, rect) {
  const distX = Math.abs(circle.x - (rect.x + rect.width / 2));
  const distY = Math.abs(circle.y - (rect.y + rect.height / 2));

  if (distX > rect.width / 2 + circle.radius) return false;
  if (distY > rect.height / 2 + circle.radius) return false;

  if (distX <= rect.width / 2) return true;
  if (distY <= rect.height / 2) return true;

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function rectIntersect(a, b) {
  return !(
    a.x + a.width < b.x + 4 ||
    a.x > b.x + b.width - 4 ||
    a.y + a.height < b.y + 8 ||
    a.y > b.y + b.height - 8
  );
}

function handleOrbPickup() {
  const boost = Math.min(state.combo + 0.25, 6);
  state.score += 120 * state.combo;
  state.combo = boost;
  state.comboTimer = 3.2;
  state.timeLeft = Math.min(state.timeLeft + 0.6, 75);
  showToast("Combo +");
}

function handleGlitchHit() {
  fx.shockwave = 0.65;
  state.combo = Math.max(1, state.combo - 0.8);
  state.comboTimer = 1.2;
  state.timeLeft = Math.max(0, state.timeLeft - 5);
  state.score = Math.max(0, state.score - 180);
  showToast("Glitch ! Combo reset");
}

function updateCombo(dt) {
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
  } else if (state.combo > 1) {
    state.combo = Math.max(1, +(state.combo - 0.2).toFixed(1));
    state.comboTimer = 1.1;
  }
}

function updateTime(dt) {
  if (!state.playing) return;
  state.timeLeft -= dt;
  state.elapsed += dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.playing = false;
    showToast(`Fin de partie ! Score ${Math.floor(state.score)}`);
  }
}

function updateTrail(dt) {
  player.trail.forEach((segment) => {
    segment.life -= dt;
  });
  for (let i = player.trail.length - 1; i >= 0; i -= 1) {
    if (player.trail[i].life <= 0) player.trail.splice(i, 1);
  }
}

function updateFX(dt) {
  if (fx.shockwave > 0) {
    fx.shockwave = Math.max(0, fx.shockwave - dt * 1.2);
  }
}

function update(dt) {
  if (state.playing) {
    updatePlayer(dt);
    updateEntities(dt);
    detectCollisions();
  }
  updateCombo(dt);
  updateTime(dt);
  updateTrail(dt);
  updateFX(dt);
  updateHUD();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "rgba(12, 12, 38, 0.95)");
  gradient.addColorStop(1, "rgba(10, 10, 25, 0.75)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.speed * frameDelta;
    if (star.y > HEIGHT) {
      star.y = -star.size;
      star.x = Math.random() * WIDTH;
    }
  });
}

function drawShockwave() {
  if (fx.shockwave <= 0) return;
  const radius = (1 - fx.shockwave) * 260 + 60;
  const alpha = fx.shockwave * 0.6;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  const radial = ctx.createRadialGradient(centerX, centerY, 12, centerX, centerY, radius);
  radial.addColorStop(0, `rgba(70, 242, 255, ${alpha})`);
  radial.addColorStop(0.8, "rgba(70, 242, 255, 0)");

  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  player.trail.forEach((segment, index) => {
    const progress = 1 - segment.life / 0.35;
    const radius = 10 + index * 0.3;
    ctx.fillStyle = `rgba(70, 242, 255, ${Math.max(0, segment.life * 2)})`;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  const gradient = ctx.createLinearGradient(player.x, player.y, player.x + player.width, player.y + player.height);
  gradient.addColorStop(0, "#46f2ff");
  gradient.addColorStop(1, "#ff8ee0");

  ctx.fillStyle = gradient;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(255, 142, 224, 0.7)";
  drawRoundedRect(ctx, player.x, player.y, player.width, player.height, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawOrbs() {
  orbs.forEach((orb) => {
    const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.1);
    glow.addColorStop(0, `${orb.color}88`);
    glow.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius * 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = orb.color;
    const wobble = Math.sin(orb.pulse) * 0.2;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius * (0.85 + wobble), 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGlitches() {
  glitches.forEach((glitch) => {
    const shakeX = Math.sin(glitch.shake) * 4;
    const shakeY = Math.cos(glitch.shake * 0.7) * 3;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.fillStyle = glitch.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `${glitch.color}aa`;
    drawRoundedRect(ctx, glitch.x, glitch.y, glitch.width, glitch.height, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(glitch.x + 6, glitch.y + 6, glitch.width - 12, glitch.height - 12);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  });
}

function drawUI() {
  if (!state.playing) {
    ctx.save();
    ctx.fillStyle = "rgba(6, 6, 12, 0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(247, 249, 255, 0.95)";
    ctx.font = "700 46px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FIN DE PARTIE", WIDTH / 2, HEIGHT / 2 - 20);
    ctx.font = "500 24px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(255, 142, 224, 0.9)";
    ctx.fillText(`Score ${Math.floor(state.score)}`, WIDTH / 2, HEIGHT / 2 + 22);
    ctx.font = "500 18px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(247, 249, 255, 0.8)";
    ctx.fillText("Appuie sur ↻ ou Espace pour relancer", WIDTH / 2, HEIGHT / 2 + 60);
    ctx.restore();
  }
}

function render() {
  drawBackground();
  drawShockwave();
  drawOrbs();
  drawGlitches();
  drawPlayer();
  drawUI();
}

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.04);
  lastTime = timestamp;
  frameDelta = dt;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

restartBtn.addEventListener("click", () => {
  resetGame();
  showToast("Nouvelle manche !");
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Space") {
    if (!state.playing) {
      resetGame();
      showToast("C'est parti !");
      return;
    }
    attemptDash();
  }
  if (event.code.startsWith("Arrow")) {
    event.preventDefault();
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

resetGame();
requestAnimationFrame((timestamp) => {
  lastTime = timestamp;
  loop(timestamp);
});
