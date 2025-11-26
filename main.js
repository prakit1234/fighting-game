const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- UI Elements ---
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const victoryScreen = document.getElementById('victory-screen');
const gameOverModal = document.getElementById('game-over-modal');
const startBtn = document.getElementById('start-game-btn');
const playerNameInput = document.getElementById('player-name-input');
const playerNameDisplay = document.getElementById('player-name-display');
const bossNameDisplay = document.getElementById('boss-name-display');
const timerEl = document.getElementById('timer');
const finalTimeEl = document.getElementById('final-time');
const playerHealthBar = document.getElementById('player-health-bar');
const bossHealthBar = document.getElementById('boss-health-bar');
const staminaBar = document.getElementById('stamina-bar');

// --- Mobile Controls ---
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const punchBtn = document.getElementById('punch-btn');
const kickBtn = document.getElementById('kick-btn');
const specialBtn = document.getElementById('special-btn');

// --- Game Constants & State ---
const GRAVITY = 0.7;
const JUMP_STRENGTH = -16;
const GROUND_Y = canvas.height - 90;
const PUNCH_DAMAGE = 6;
const KICK_DAMAGE = 9;
const SPECIAL_DAMAGE = 35;
const STAMINA_COST = 50;
const SPECIAL_COOLDOWN = 4000;

let gameState = 'loading';
let playerName = 'Hero';
let player = {};
let currentBossIndex = 0;
let boss = {};
let timer = 0;
let stamina = 100;
let specialReady = true;
let comboSequence = [];
let comboTimeout;
let sprites = {}; 
let sounds = {};
let background = {};
let camera = { x: 0, y: 0, shakeTime: 0, shakeMagnitude: 0 };
let particles = [];

// --- Asset Paths ---
const assetPaths = {
    player: { idle: './assets/player/idle.png', punch: './assets/player/punch.png', kick: './assets/player/kick.png' },
    bosses: { boss1: './assets/bosses/boss1.png', boss2: './assets/bosses/boss2.png', boss3: './assets/bosses/boss3.png', boss4: './assets/bosses/boss4.png', boss5: './assets/bosses/boss5.png' },
    background: './assets/background.jpg'
};

const soundPaths = { punch: './assets/audio/punch.mp3', kick: './assets/audio/kick.mp3', jump: './assets/audio/jump.mp3', special: './assets/audio/special.mp3', bgmMain: './assets/audio/bgm-main.mp3', bgmBoss: './assets/audio/bgm-boss.mp3' };

// --- Boss Definitions ---
const bosses = [
    { name: 'YASII MIYA', width: 80, height: 150, imageKey: 'boss1', maxHealth: 120, ai: (self) => { if (Math.random() < 0.018 && self.health > 0) self.projectiles.push({ x: self.x, y: self.y + 75, width: 28, height: 10, color: '#ffc107', dx: -10 }); } },
    { name: 'JUPITER KA BETA', width: 100, height: 120, imageKey: 'boss2', maxHealth: 180, shielded: false, shieldTimer: 0, shieldCooldown: 320, ai: (self) => { if (self.shieldTimer > 0) self.shieldTimer--; else self.shielded = false; if (self.shieldCooldown > 0) self.shieldCooldown--; if (!self.shielded && self.shieldCooldown <= 0 && self.health > 0 && Math.random() < 0.025) { self.shielded = true; self.shieldTimer = 200; self.shieldCooldown = 500; } if (!self.shielded && Math.random() < 0.012) { self.isAttacking = true; self.attackBox = { x: self.x - 65, y: self.y + 45, width: 65, height: 35, active: true }; setTimeout(() => { self.isAttacking = false; self.attackBox.active = false; }, 320); } } },
    { name: 'ARJYA SULTAN', width: 90, height: 140, imageKey: 'boss3', maxHealth: 250, teleportCooldown: 0, ai: (self) => { if (self.teleportCooldown > 0) self.teleportCooldown--; if (self.teleportCooldown <= 0 && Math.random() < 0.015) { self.x = Math.random() * (canvas.width - 220) + 110; self.teleportEffect = 25; self.teleportCooldown = 260; } if (Math.random() < 0.02) self.projectiles.push({ x: self.x, y: self.y + 65, width: 85, height: 25, color: 'rgba(110, 0, 160, 0.75)', dx: -14, type: 'shadow-punch' }); } },
    { name: 'JUNAK BLACK BELT', width: 120, height: 110, imageKey: 'boss4', maxHealth: 350, rageMode: false, groundSmashCooldown: 0, ai: (self) => { if (!self.rageMode && self.health < self.maxHealth / 2) { self.rageMode = true; } if (self.groundSmashCooldown > 0) self.groundSmashCooldown--; if (self.groundSmashCooldown <= 0 && Math.random() < 0.012) { self.projectiles.push({ x: self.x + self.width/2, y: GROUND_Y, radius: 12, maxRadius: canvas.width / 2.8, aoe: true, groundSmashImpact: true }); self.groundSmashCooldown = self.rageMode ? 230 : 420; } } },
    { name: 'HELLBLADE HIDANSHU', width: 100, height: 160, imageKey: 'boss5', maxHealth: 450, parryChance: 0.3, dx: 0, ai: (self) => { if (Math.random() < 0.025) self.dx = (Math.random() > 0.5 ? 1 : -1) * 3.5; self.x += self.dx; if (self.x < 0 || self.x + self.width > canvas.width) self.dx *= -1; if (Math.random() < 0.022) self.projectiles.push({ x: self.x, y: self.y + 85, width: 105, height: 18, color: '#ff6600', dx: -11, type: 'fire-slash' }); } }
];

// --- Asset Loading & Game Flow ---
function loadAssets(paths, callback) { let l=0,t=0;Object.values(paths).forEach(p=>t+=typeof p==='string'?1:Object.keys(p).length);const ol=()=>(++l===t)&&callback();Object.entries(paths).forEach(([c,p])=>{if(typeof p==='string'){const i=new Image();i.src=p;i.onload=ol;sprites[c]=i}else{sprites[c]={};Object.entries(p).forEach(([n,a])=>{const i=new Image();i.src=a;i.onload=ol;sprites[c][n]=i})}})}
function loadSounds(paths, callback) { let l=0,t=Object.keys(paths).length;const ol=()=>(++l===t)&&callback();Object.entries(paths).forEach(([n,p])=>{sounds[n]=new Audio(p);sounds[n].oncanplaythrough=ol;});}
function init() { startBtn.disabled = true; startBtn.textContent = 'Loading...'; loadAssets(assetPaths, () => { loadSounds(soundPaths, () => { gameState = 'menu'; startBtn.disabled = false; startBtn.textContent = 'Start Game'; background.img = sprites.background; background.x = 0; gameLoop(); }); }); }
function startGame() { playerName = playerNameInput.value || 'Hero'; playerNameDisplay.innerText = playerName; mainMenu.classList.add('hidden'); gameContainer.classList.remove('hidden'); initPlayer(); currentBossIndex = 0; loadBoss(currentBossIndex); timer = 0; stamina = 100; gameState = 'playing'; playBGM(); if (gameState === 'playing') gameLoop(); }
function initPlayer() { player = { x: 150, y: GROUND_Y - 100, width: 50, height: 100, speed: 5, dx: 0, dy: 0, health: 100, maxHealth: 100, isJumping: false, isAttacking: false, attackBox: { active: false }, isHit: false, hitTimer: 0, sprites: sprites.player, image: sprites.player.idle }; }
function loadBoss(i) { const d=bosses[i];boss={...d,x:750,y:GROUND_Y-d.height,health:d.maxHealth,projectiles:[],isStunned:false,stunTimer:0,isHit:false,hitTimer:0,attackBox:{active:false},image:sprites.bosses[d.imageKey]};bossNameDisplay.innerText=boss.name;playBGM();}
function nextBoss() { currentBossIndex++; if (currentBossIndex < bosses.length) { loadBoss(currentBossIndex); player.health = player.maxHealth; stamina = 100; } else { gameState = 'victory'; finalTimeEl.innerText = timer.toFixed(2); updateLeaderboard(playerName, timer); displayLeaderboard(); victoryScreen.classList.remove('hidden'); playSound('bgmMain', true); } }
startBtn.addEventListener('click', startGame);

// --- Audio ---
function playSound(name, loop = false) { if (sounds[name]) { sounds[name].currentTime = 0; sounds[name].loop = loop; sounds[name].play(); } }
function playBGM() { Object.values(sounds).forEach(s=>s.pause()); const bgm = boss.name === 'HELLBLADE HIDANSHU' ? 'bgmBoss' : 'bgmMain'; playSound(bgm, true); }

// --- Leaderboard ---
function updateLeaderboard(n, t){let s=JSON.parse(localStorage.getItem('hkkmspeedrun'))||[];s.push({name:n,time:t});s.sort((a,b)=>a.time-b.time);localStorage.setItem('hkkmspeedrun',JSON.stringify(s.slice(0,5)))}
function displayLeaderboard(){const s=JSON.parse(localStorage.getItem('hkkmspeedrun'))||[];document.getElementById('leaderboard-list').innerHTML=s.length?s.map(sc=>`<li>${sc.name} - ${sc.time.toFixed(2)}s</li>`).join(''):'<li>No scores yet!</li>'}

// --- Main Loop & Update ---
function gameLoop() { if(gameState!=='loading'){if(gameState==='playing')update();render()}requestAnimationFrame(gameLoop);}
function update() {
    player.x+=player.dx;player.dy+=GRAVITY;player.y+=player.dy;if(player.y+player.height>GROUND_Y){player.y=GROUND_Y-player.height;player.dy=0;player.isJumping=false}player.x=Math.max(0,Math.min(player.x,canvas.width-player.width));if(player.hitTimer>0)player.hitTimer--;if(boss.hitTimer>0)boss.hitTimer--;if(boss.stunTimer>0)boss.stunTimer--;else boss.isStunned=false;if(boss.teleportEffect>0)boss.teleportEffect--;stamina=Math.min(100,stamina+0.25);
    if(boss.ai&&!boss.isStunned)boss.ai(boss);
    (boss.projectiles||[]).forEach((p,i)=>{if(p.aoe){if(p.groundSmashImpact){createGroundDebrisParticles(p.x);p.groundSmashImpact=false}p.radius+=18;if(p.radius>=p.maxRadius)boss.projectiles.splice(i,1);else if(isPlayerInAOE(p))handleDamage(player,25)}else{p.x+=p.dx;if(p.x<0||p.x>canvas.width)boss.projectiles.splice(i,1);else if(detectCollision(p,player)){handleDamage(player,p.type==='shadow-punch'?18:12);boss.projectiles.splice(i,1)}}});
    if(boss.attackBox.active&&detectCollision(boss.attackBox,player)){handleDamage(player,boss.rageMode?28:18);boss.attackBox.active=false}
    if(player.attackBox.active&&detectCollision(player.attackBox,boss)){if(boss.hitTimer<=0)handleDamage(boss,0,player.attackBox.type);if(player.attackBox.type==='heavy-combo'){boss.isStunned=true;boss.stunTimer=130}player.attackBox.active=false;camera.shakeTime=12;camera.shakeMagnitude=4}
    if(boss.health<=0)nextBoss();background.x=(background.x-player.dx*0.1)%canvas.width;if(camera.shakeTime>0){camera.shakeTime--;camera.x=(Math.random()-0.5)*camera.shakeMagnitude;camera.y=(Math.random()-0.5)*camera.shakeMagnitude}else{camera.x=0;camera.y=0}
    particles.forEach((p,i)=>{p.x+=p.dx;p.y+=p.dy;p.dy+=p.gravity||0.1;p.alpha-=0.02;if(p.alpha<=0)particles.splice(i,1)});timer+=1/60;timerEl.innerText=`Time: ${timer.toFixed(2)}`;playerHealthBar.style.width=`${player.health/player.maxHealth*100}%`;bossHealthBar.style.width=`${Math.max(0,boss.health)/boss.maxHealth*100}%`;staminaBar.style.width=`${stamina}%`
}

// --- Render ---
function render() { ctx.save(); ctx.translate(camera.x, camera.y); ctx.fillStyle = '#101010'; ctx.fillRect(-camera.x, -camera.y, canvas.width, canvas.height); for (let i=0; i<2; i++){ctx.drawImage(background.img, background.x + i * canvas.width, 0, canvas.width, canvas.height)} ctx.fillStyle='#2a2a2a'; ctx.fillRect(-camera.x, GROUND_Y, canvas.width, canvas.height - GROUND_Y); drawImage(player.image, player.x, player.y, player.width, player.height, false, player.hitTimer > 0); drawImage(boss.image, boss.x, boss.y, boss.width, boss.height, true, boss.hitTimer > 0, boss.rageMode ? '#e83e8c' : null); renderEffects(); ctx.restore(); }
function drawImage(img,x,y,w,h,flip,isHit,overlay){ctx.save();if(isHit)ctx.filter='brightness(3)';if(flip){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(img,0,0,w,h)}else{ctx.drawImage(img,x,y,w,h)}if(overlay){ctx.globalCompositeOperation='source-atop';ctx.fillStyle=overlay;ctx.fillRect(flip?0:x,flip?0:y,w,h)}ctx.restore()}

function renderEffects() {
    particles.forEach(p=>{ctx.fillStyle=`rgba(${p.r},${p.g},${p.b},${p.alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()});
    if(boss.isParrying){const x=boss.x-20,y=boss.y,w=20,h=boss.height;ctx.fillStyle='rgba(0,255,255,0.6)';ctx.strokeStyle='#00ffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=20;ctx.shadowColor='#00ffff';ctx.stroke();ctx.shadowBlur=0}
    if(boss.shielded){ctx.fillStyle='rgba(0,210,255,0.45)';ctx.fillRect(boss.x-12,boss.y-12,boss.width+24,boss.height+24)}
    if(boss.teleportEffect>0){ctx.fillStyle=`rgba(160,60,255,${boss.teleportEffect/25*0.75})`;ctx.beginPath();ctx.arc(boss.x+boss.width/2,boss.y+boss.height/2,85,0,Math.PI*2);ctx.fill()}
    if(boss.isStunned){ctx.font='bold 36px sans-serif';ctx.fillStyle='#ffc107';ctx.fillText('⚡',boss.x+boss.width/2,boss.y-35)}
    (boss.projectiles||[]).forEach(p=>{if(p.aoe){const op=1-p.radius/p.maxRadius;ctx.strokeStyle=`rgba(255,110,0,${op})`;ctx.lineWidth=8;ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.stroke();const swr=p.radius+40;if(swr<p.maxRadius){const swo=op*0.5;ctx.strokeStyle=`rgba(255,150,50,${swo})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,swr,0,Math.PI*2);ctx.stroke()}}else{ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.width,p.height)}})
}

// --- Core Mechanics ---
function detectCollision(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}
function isPlayerInAOE(aoe){return Math.hypot(player.x+player.width/2-aoe.x,player.y+player.height/2-aoe.y)<aoe.radius}
function handleDamage(target,baseDmg,type){if(target===boss&&boss.name==='HELLBLADE HIDANSHU'&&!boss.isStunned&&Math.random()<boss.parryChance){boss.isParrying=true;createParrySparkParticles(boss.x,boss.y+boss.height/2);playSound('kick');setTimeout(()=>boss.isParrying=false,320);return}if(target===boss&&boss.shielded)return;let damage=baseDmg;if(type){damage=type==='punch'?PUNCH_DAMAGE:(type==='kick'?KICK_DAMAGE:SPECIAL_DAMAGE)}target.health-=damage;target.hitTimer=12;if(target.health<=0&&target===player){gameState='gameover';gameOverModal.classList.remove('hidden')}if(damage>0)createHitParticles(target.x+target.width/2,target.y+target.height/2)}

// --- Particle Effects ---
function createHitParticles(x,y){for(let i=0;i<15;i++){const a=Math.random()*Math.PI*2,s=Math.random()*4+1;particles.push({x,y,dx:Math.cos(a)*s,dy:Math.sin(a)*s,size:Math.random()*3+1,alpha:1,r:255,g:255,b:255})}}
function createSpecialAttackParticles(x,y){for(let i=0;i<50;i++){const a=Math.random()*Math.PI*2,s=Math.random()*8+2;particles.push({x,y,dx:Math.cos(a)*s,dy:Math.sin(a)*s,size:Math.random()*4+2,alpha:1,r:0,g:220,b:255})}}
function createParrySparkParticles(x,y){for(let i=0;i<25;i++){const a=Math.random()*Math.PI-Math.PI/2,s=Math.random()*5+2;particles.push({x,y,dx:Math.cos(a)*s,dy:Math.sin(a)*s,size:Math.random()*3+1,alpha:1,r:0,g:255,b:255})}}
function createGroundDebrisParticles(x){for(let i=0;i<40;i++){const a=-Math.PI*Math.random(),s=Math.random()*8+3;particles.push({x:x+(Math.random()-0.5)*50,y:GROUND_Y,dx:Math.cos(a)*s*0.5,dy:Math.sin(a)*s,size:Math.random()*4+2,alpha:1,r:150,g:100,b:50,gravity:0.4})}}

// --- Player Actions ---
function performAttack(type){if(player.isAttacking)return;player.isAttacking=true;player.attackBox.active=true;player.attackBox.type=type;let img=player.sprites.idle,dur=260,w=75;if(type==='punch'){img=player.sprites.punch;playSound('punch')}else if(type==='kick'){img=player.sprites.kick;w=85;playSound('kick')}player.image=img;player.attackBox={...player.attackBox,width:w,height:35,y:player.y+35,x:player.x+player.width};setTimeout(()=>{player.isAttacking=false;player.attackBox.active=false;player.image=player.sprites.idle},dur)}
function performSpecialAttack(){if(stamina<STAMINA_COST||!specialReady)return;stamina-=STAMINA_COST;specialReady=false;setTimeout(()=>specialReady=true,SPECIAL_COOLDOWN);player.isAttacking=true;createSpecialAttackParticles(player.x+player.width/2,player.y+player.height/2);playSound('special');setTimeout(()=>{player.attackBox={active:true,type:'special',width:140,height:60,y:player.y+15,x:player.x+player.width};setTimeout(()=>player.attackBox.active=false,120);player.isAttacking=false;camera.shakeTime=25;camera.shakeMagnitude=12},300)}
function handleCombo(k){comboSequence.push(k);clearTimeout(comboTimeout);comboTimeout=setTimeout(()=>comboSequence=[],750);const s=comboSequence.join('');if(s.endsWith('JJK')){performAttack('kick');comboSequence=[]}else if(s.endsWith('KKL')){performAttack('heavy-combo');comboSequence=[]}}

// --- Input Handlers ---
document.addEventListener('keydown',e=>{if(gameState!='playing')return;const k=e.key.toLowerCase();switch(k){case'a':player.dx=-player.speed;break;case'd':player.dx=player.speed;break;case'w':case' ':if(!player.isJumping){player.dy=JUMP_STRENGTH;player.isJumping=true;playSound('jump')}break;case'j':performAttack('punch');handleCombo('J');break;case'k':performAttack('kick');handleCombo('K');break;case'l':performSpecialAttack();handleCombo('L');break}});document.addEventListener('keyup',e=>{if(gameState!='playing')return;const k=e.key.toLowerCase();if((k==='a'&&player.dx<0)||(k==='d'&&player.dx>0))player.dx=0});const touch=(e,a)=>{e.preventDefault();a()};leftBtn.addEventListener('touchstart',e=>touch(e,()=>player.dx=-player.speed));rightBtn.addEventListener('touchstart',e=>touch(e,()=>player.dx=player.speed));leftBtn.addEventListener('touchend',e=>touch(e,()=>{if(player.dx<0)player.dx=0}));rightBtn.addEventListener('touchend',e=>touch(e,()=>{if(player.dx>0)player.dx=0}));jumpBtn.addEventListener('touchstart',e=>touch(e,()=>{if(!player.isJumping){player.dy=JUMP_STRENGTH;player.isJumping=true;playSound('jump')}}));punchBtn.addEventListener('touchstart',e=>touch(e,()=>{performAttack('punch');handleCombo('J')}));kickBtn.addEventListener('touchstart',e=>touch(e,()=>{performAttack('kick');handleCombo('K')}));specialBtn.addEventListener('touchstart',e=>touch(e,()=>{performSpecialAttack();handleCombo('L')}));

init();
