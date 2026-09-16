import { t, getLocale, getLanguage, setLanguage, setText, setLabel, capturePage, translatePage } from './i18n.mjs?v=20260916-2';
import { Game, MODES, SHAPES, COLORS, COLOR_NAMES, SPECIAL_TYPES, POWER_TYPES, POWERS, PIECE_NAMES, BUDDIES, BUDDY_TYPES, cells } from './engine.mjs?v=20260916-2';
import { ArcadeAudio } from './audio.mjs?v=20260916-2';
import { BUDDY_POWERS } from './engine.mjs?v=20260916-2';
import { Fireworks } from './fireworks.mjs?v=20260916-2';
import { drawPowerBlock, drawCharge, PowerEffects } from './power-fx.mjs?v=20260916-2';

const $ = id => document.getElementById(id);
const game = new Game();
const storage = { get(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }, set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} } };
const storedPrefs = storage.get('stack-rush-preferences', {});
const prefs = { sound: typeof storedPrefs.sound === 'boolean' ? storedPrefs.sound : true, music: typeof storedPrefs.music === 'boolean' ? storedPrefs.music : true, volume: Number.isFinite(storedPrefs.volume) ? Math.max(0,Math.min(1,storedPrefs.volume)) : .32, effects: typeof storedPrefs.effects === 'boolean' ? storedPrefs.effects : !matchMedia('(prefers-reduced-motion: reduce)').matches, ghost: typeof storedPrefs.ghost === 'boolean' ? storedPrefs.ghost : true };
let records = storage.get('stack-rush-records', {});
if (!records || typeof records !== 'object') records = {};
const RUSH_MODES = ['rush1','rush','rush5','rush10'];
const isRushMode = mode => Boolean(MODES[mode]?.rush);
let selectedRushMode = 'rush';
let particles = [], flashes = [], dropTrails = [], lastFrame = 0, uiClock = 0, endReason = '', endWon = false, newRecord = false, challengeAnnounced = false;
const audio = new ArcadeAudio();
const fireworks = new Fireworks();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const powerEffects = new PowerEffects();
let powerVisualTime=0, previewClock=0;
let allClearRemaining = 0;
let held = {}, touchGesture = null, calloutTimeout, impactTimeout, cheerTimeout, pickupTimeout, blastTimeout;
let flyers = [], falls = [], explosions = [], buddyIndex = 0, latestPiece = null;
const mascotImage = new Image(); mascotImage.src = new URL("./assets/mascots.png", import.meta.url).href;
const newMascotImage = new Image(); newMascotImage.src = new URL('./assets/power-mascots.png',import.meta.url).href;
const mascotCrops=[[0,135,483,500],[472,60,380,575],[858,87,458,554],[1315,215,376,418],[1693,177,473,455]];
mascotImage.addEventListener("error",()=>document.body.classList.add("mascot-fallback"));
let queuedConfirm = null, dialogWasPlaying = false;
const dpr = Math.min(window.devicePixelRatio || 1, 2);
function configureCanvas(id, width, height) { const el = $(id); el.width = width * dpr; el.height = height * dpr; const context = el.getContext('2d'); context.scale(dpr, dpr); return context; }
const ctx = configureCanvas('board', 300, 600);
const fireworksCtx = configureCanvas('fireworks', 300, 600);
const holdCtx = configureCanvas('hold-canvas', 100, 85);
const nextCtx = configureCanvas('next-canvas', 100, 335);
const mixCtx = configureCanvas('mix-canvas', 450, 56);
const text = (id, value) => setText($(id), value);
const formatNumber = n => Math.floor(n).toLocaleString(getLocale());
const formatTime = ms => { const total = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(total / 60).toString().padStart(2,'0')}:${(total % 60).toString().padStart(2,'0')}`; };
const preciseTime = ms => `${formatTime(Math.floor(ms / 1000) * 1000)}.${Math.floor((ms % 1000) / 10).toString().padStart(2,'0')}`;

function prepareAudio() { void audio.unlock(prefs); }
function sound(type, count = 1) { audio.effect(type, count); }
function drawStar(context, x, y, size, color, rotation = 0) {
  context.save(); context.translate(x,y); context.rotate(rotation); context.beginPath();
  for(let i=0;i<10;i++){const radius=i%2?size*.43:size, angle=-Math.PI/2+i*Math.PI/5;const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius;if(i===0)context.moveTo(px,py);else context.lineTo(px,py);}
  context.closePath();context.fillStyle=color;context.fill();context.restore();
}
function jellyFace(c, eyeY, gap, r) {
  for(const dir of [-1,1]){
    c.fillStyle='#ff8fb070';c.beginPath();c.ellipse(dir*gap*1.6,eyeY+r*1.5,r*.9,r*.55,0,0,Math.PI*2);c.fill();
    c.fillStyle='#1d1630';c.beginPath();c.ellipse(dir*gap,eyeY,r,r*1.12,0,0,Math.PI*2);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(dir*gap-r*.32,eyeY-r*.42,r*.36,0,Math.PI*2);c.fill();c.beginPath();c.arc(dir*gap+r*.35,eyeY+r*.38,r*.15,0,Math.PI*2);c.fill();
  }
  c.fillStyle='#7c2442';c.beginPath();c.moveTo(-r*.8,eyeY+r*.9);c.quadraticCurveTo(0,eyeY+r*2.9,r*.8,eyeY+r*.9);c.closePath();c.fill();
  c.fillStyle='#ff8da6';c.beginPath();c.ellipse(0,eyeY+r*1.75,r*.42,r*.28,0,0,Math.PI*2);c.fill();
}
// Polvi and Nuvi are drawn in code, in the same glossy jelly style as the sprite sheets.
function drawCodeBuddy(c, index, x, y, size) {
  c.save();c.translate(x,y);c.scale(size/100,size/100);c.lineCap='round';
  if(index===8){
    const tentacle=c.createLinearGradient(0,10,0,48);tentacle.addColorStop(0,'#6b7cf5');tentacle.addColorStop(1,'#4453c9');
    c.strokeStyle=tentacle;c.lineWidth=11;
    for(const [sx,cx,ex] of [[-26,-44,-40],[-15,-26,-24],[-5,-8,-8],[5,8,8],[15,26,24],[26,44,40]]){c.beginPath();c.moveTo(sx,14);c.quadraticCurveTo(cx,34,ex,44);c.stroke();}
    c.fillStyle='#c9d0ff99';for(const [sx,ex] of [[-26,-40],[-15,-24],[-5,-8],[5,8],[15,24],[26,40]]){c.beginPath();c.arc((sx+ex*2)/3,37,2.2,0,Math.PI*2);c.fill();}
    const head=c.createRadialGradient(-12,-26,4,0,-6,44);head.addColorStop(0,'#b7c3ff');head.addColorStop(.55,'#7384fb');head.addColorStop(1,'#4b59d6');
    c.fillStyle=head;c.beginPath();c.ellipse(0,-8,37,34,0,0,Math.PI*2);c.fill();
    c.fillStyle='#ffffff8c';c.beginPath();c.ellipse(-15,-30,11,5.5,-.5,0,Math.PI*2);c.fill();
    jellyFace(c,-4,14,7.5);
  } else {
    c.fillStyle='#85e8fa';for(const dx of [-22,0,22]){const dy=dx?38:44;c.beginPath();c.moveTo(dx,dy-9);c.quadraticCurveTo(dx+6,dy,dx,dy+4);c.quadraticCurveTo(dx-6,dy,dx,dy-9);c.fill();}
    const body=c.createRadialGradient(-14,-22,4,0,0,50);body.addColorStop(0,'#ffffff');body.addColorStop(.6,'#e4e8ff');body.addColorStop(1,'#aeb8f0');
    c.fillStyle=body;c.beginPath();
    for(const [cx,cy,r] of [[-30,8,19],[30,8,19],[-14,-12,24],[14,-16,22],[0,8,28]]){c.moveTo(cx+r,cy);c.arc(cx,cy,r,0,Math.PI*2);}
    c.fill();
    c.fillStyle='#ffffffb0';c.beginPath();c.ellipse(-18,-26,9,4.5,-.5,0,Math.PI*2);c.fill();
    jellyFace(c,4,14,7);
  }
  c.restore();
}
function drawBuddy(context, index, x, y, size) {
  if(index>=8){drawCodeBuddy(context,index,x,y,size);return;}
  const sheet=index<3?mascotImage:newMascotImage, slot=index<3?index:index-3, count=index<3?3:5;
  if(sheet.complete&&sheet.naturalWidth){
    const tile=sheet.naturalWidth/count;
    const [sx,sy,sw,sh]=index<3?[slot*tile,0,tile,sheet.naturalHeight]:mascotCrops[slot];
    const scale=size/Math.max(sw,sh),w=sw*scale,h=sh*scale;
    context.drawImage(sheet,sx,sy,sw,sh,x-w/2,y-h/2,w,h);
  } else {context.save();context.font=`${size*.62}px system-ui`;context.textAlign='center';context.textBaseline='middle';context.fillText(['🐱','🦎','🐥','🦇','🐰','🐉','🦔','🐸','🐙','☁️'][index],x,y);context.restore();}
}
function buddyCheer(message, index = buddyIndex) {
  buddyIndex=index;
  document.querySelectorAll('[data-companion]').forEach(el=>{
    el.classList.toggle('power-mascot',index>=3);el.style.setProperty('--buddy',String(index));setLabel(el,BUDDIES[index]);el.replaceChildren();
    if(index>=3){const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;canvas.setAttribute('aria-hidden','true');el.append(canvas);drawBuddy(canvas.getContext('2d'),index,80,80,160);}
  });
  text('buddy-message',message);text('buddy-name',BUDDIES[index]+' está na torcida');
  document.querySelectorAll('.companion').forEach(el=>{el.classList.remove('cheering');void el.offsetWidth;el.classList.add('cheering');});
  clearTimeout(cheerTimeout);cheerTimeout=setTimeout(()=>document.querySelectorAll('.companion').forEach(el=>el.classList.remove('cheering')),1500);
}
function bonusCelebration(event) {
  const {bonus}=event, star=bonus.kind==='star';
  sound(star?'star':'buddy');
  text('pickup-notice',star?`Estrela! ${formatNumber(event.score)} pontos`:`${BUDDIES[bonus.buddy]} resgatado! ${formatNumber(event.score)} pontos`);
  $('pickup-notice').classList.add('visible');clearTimeout(pickupTimeout);pickupTimeout=setTimeout(()=>$('pickup-notice').classList.remove('visible'),2200);
  if(star)buddyCheer('Você brilhou!');else buddyCheer('Valeu pelo resgate!',bonus.buddy);
  if(prefs.effects){
    for(let i=0;i<20;i++){const life=500+Math.random()*500;particles.push({x:bonus.x*30+15,y:bonus.y*30+15,vx:(Math.random()-.5)*7,vy:-Math.random()*7-2,size:3+Math.random()*4,color:star?'#ffe27c':'#ff9edd',life,max:life,star:true,rotation:Math.random()*6});}
    if(!star)flyers.push({x:Math.max(40,Math.min(260,bonus.x*30+15)),y:bonus.y*30,buddy:bonus.buddy,life:1500,max:1500});
  }
  announce(star?`Estrela coletada. ${event.score} pontos.`:`${BUDDIES[bonus.buddy]} resgatado. ${event.score} pontos.`);
}
function block(context, x, y, size, type, alpha = 1, ghost = false, charged = true) {
  const color = COLORS[type] || type;
  context.save(); context.globalAlpha = alpha;
  if(BUDDY_TYPES.includes(type)) {
    context.fillStyle=ghost?'#f49ed80c':'#f49ed838';context.strokeStyle=ghost?'#f49ed877':'#f49ed8aa';context.lineWidth=1.5;
    context.beginPath();context.arc(x+size/2,y+size/2,size*.46,0,Math.PI*2);context.fill();context.stroke();
    if(!ghost)drawBuddy(context,BUDDY_TYPES.indexOf(type),x+size/2,y+size/2,size*1.2);
    context.restore();return;
  }
  if(charged && POWER_TYPES.includes(type)) {
    drawPowerBlock(context,x,y,size,type,powerVisualTime,prefs.effects&&!reducedMotion.matches,ghost);
    context.restore();return;
  }
  if(type==='BOMB'){
    const cx=x+size*.48,cy=y+size*.58,r=size*.33;
    context.strokeStyle=ghost?'#ffb17d99':'#ffbb77';context.lineWidth=ghost?1.3:Math.max(1,size*.055);
    context.beginPath();context.arc(cx,cy,r,0,Math.PI*2);
    if(!ghost){const bombFill=context.createRadialGradient(cx-r*.35,cy-r*.35,1,cx,cy,r);bombFill.addColorStop(0,'#666176');bombFill.addColorStop(1,'#242333');context.fillStyle=bombFill;context.fill();}
    context.stroke();context.beginPath();context.moveTo(cx+r*.45,cy-r*.9);context.lineTo(cx+r*.8,cy-r*1.35);context.lineTo(cx+r*1.2,cy-r*1.12);context.stroke();
    if(!ghost){drawStar(context,cx+r*1.35,cy-r*1.3,size*.12,'#ffdb80');context.fillStyle='#ffffff70';context.beginPath();context.arc(cx-r*.3,cy-r*.25,r*.16,0,Math.PI*2);context.fill();}
    context.restore();return;
  }
  if (ghost) {
    context.fillStyle = `${color}0b`; context.strokeStyle = `${color}77`; context.lineWidth = 1.5;
    context.beginPath(); context.roundRect(x+2, y+2, size-4, size-4, 3); context.fill(); context.stroke();
    context.restore(); return;
  }
  const gradient = context.createLinearGradient(x,y,x,y+size); gradient.addColorStop(0,color); gradient.addColorStop(1,color+'bb');
  context.fillStyle = gradient; context.beginPath(); context.roundRect(x+1.5,y+1.5,size-3,size-3,3); context.fill();
  context.strokeStyle = '#ffffff3b'; context.lineWidth = .8; context.beginPath(); context.roundRect(x+2,y+2,size-4,size-4,2); context.stroke();
  context.fillStyle = '#ffffff24'; context.fillRect(x+5,y+5,size-10,2);
  context.fillStyle = '#00000015'; context.fillRect(x+5,y+size-6,size-10,2);
  if(SPECIAL_TYPES.includes(type)&&size>=18){context.fillStyle='#ffffff65';context.beginPath();context.arc(x+size/2,y+size/2,2,0,Math.PI*2);context.fill();}
  context.restore();
}
function mini(context, type, centerX, centerY, size, alpha = 1) {
  if (!type) return;
  if(type==='BOMB'||BUDDY_TYPES.includes(type)){block(context,centerX-size*.8,centerY-size*.8,size*1.6,type,alpha);return;}
  const matrix = SHAPES[type]; const parts = [];
  matrix.forEach((row,y) => row.forEach((v,x) => { if(v) parts.push({x,y}); }));
  const minX = Math.min(...parts.map(p=>p.x)), maxX = Math.max(...parts.map(p=>p.x));
  const minY = Math.min(...parts.map(p=>p.y)), maxY = Math.max(...parts.map(p=>p.y));
  const ox = centerX - (maxX-minX+1)*size/2, oy = centerY-(maxY-minY+1)*size/2;
  parts.forEach(p => block(context,ox+(p.x-minX)*size,oy+(p.y-minY)*size,size,type,alpha));
}
const demo = [
  [0,17,'S'],[1,17,'S'],[1,16,'S'],[2,16,'S'],[0,18,'J'],[0,19,'J'],[1,19,'J'],[2,19,'J'],
  [2,18,'O'],[3,18,'O'],[3,19,'O'],[2,17,'O'],[3,17,'L'],[4,18,'L'],[4,19,'L'],[5,19,'L'],
  [6,19,'T'],[7,19,'T'],[8,19,'T'],[7,18,'T'],[9,19,'I'],[9,18,'I'],[9,17,'I'],[9,16,'I'],
  [7,17,'Z'],[8,17,'Z'],[8,18,'Z']
];
function render(dt) {
  if(!document.hidden && (game.state==='playing'||game.state==='ready'))powerVisualTime+=dt;
  ctx.clearRect(0,0,300,600); ctx.fillStyle = '#0f1114'; ctx.fillRect(0,0,300,600);
  ctx.strokeStyle = '#22272d77'; ctx.lineWidth = .6; ctx.beginPath();
  for(let x=0;x<=10;x++){ctx.moveTo(x*30,0);ctx.lineTo(x*30,600);}
  for(let y=0;y<=20;y++){ctx.moveTo(0,y*30);ctx.lineTo(300,y*30);} ctx.stroke();
  if(game.mode!=='sprint'){
    for(let i=0;i<13;i++){ctx.globalAlpha=prefs.effects?.08+(.05*Math.sin(game.elapsed/800+i)):.1;drawStar(ctx,(i*71+23)%300,(i*137+25)%530,2,'#c8b3ff');}ctx.globalAlpha=1;
  }
  if(game.state === 'ready') {
    demo.forEach(([x,y,t])=>block(ctx,x*30,y*30,30,t,.68));
    mini(ctx,game.mode==='sprint'?'T':'U',150,111,30,.8);
    [[4,15],[3,16],[4,16],[5,16]].forEach(([x,y])=>block(ctx,x*30,y*30,30,'T',.6,true));
  } else {
    game.board.forEach((row,y)=>row.forEach((type,x)=>{ if(type)block(ctx,x*30,y*30,30,type); }));
    if(prefs.effects){falls=falls.filter(f=>f.life>0);falls.forEach(f=>{f.life-=dt;const p=1-Math.max(0,f.life)/f.max,e=p*p;block(ctx,f.x*30,(f.from+(f.to-f.from)*e)*30,30,f.type,.55*(1-p));});}
    if(game.state !== 'over') {
      const powered=POWER_TYPES.includes(game.active.type);
      if(powered && prefs.ghost) {
        const preview=game.powerPreview();ctx.save();ctx.strokeStyle=COLORS[game.active.type]+'80';ctx.lineWidth=1;
        if(game.active.type==='VOLT')for(const x of preview.columns){ctx.fillStyle='#ffe27c0d';ctx.fillRect(x*30,0,30,600);ctx.setLineDash([4,7]);ctx.strokeRect(x*30+1,1,28,598);}
        if(game.active.type==='PRISM')for(const cell of preview.cells){ctx.strokeRect(cell.x*30+4,cell.y*30+4,22,22);}
        ctx.restore();
      }
      if(prefs.ghost&&game.active.type==='BOMB'){
        const blast=game.blastArea(game.ghost()),xs=blast.cells.map(c=>c.x),ys=blast.cells.map(c=>c.y);
        const bx=Math.min(...xs)*30,by=Math.min(...ys)*30,bw=(Math.max(...xs)-Math.min(...xs)+1)*30,bh=(Math.max(...ys)-Math.min(...ys)+1)*30;
        ctx.save();ctx.fillStyle='#ff925013';ctx.fillRect(bx,by,bw,bh);ctx.strokeStyle='#ffaa6266';ctx.setLineDash([6,6]);ctx.lineWidth=1;ctx.strokeRect(bx+1,by+1,bw-2,bh-2);ctx.restore();
      }
      if(prefs.ghost) cells(game.ghost()).forEach(({x,y})=>{if(y>=0)block(ctx,x*30,y*30,30,game.active.type,1,true);});
      cells(game.active).forEach(({x,y})=>{if(y>=0)block(ctx,x*30,y*30,30,game.active.type);});
      if(powered)drawCharge(ctx,cells(game.active),game.active.type,powerVisualTime,prefs.effects&&!reducedMotion.matches);
    }
  }
  if(game.state!=='ready'&&game.state!=='over'){
    for(const bonus of game.bonuses){
      const bob=prefs.effects?Math.sin(game.elapsed/260+bonus.id)*2:0,x=bonus.x*30+15,y=bonus.y*30+15+bob;
      ctx.save();ctx.globalAlpha=bonus.ttl<3000?.65:1;ctx.shadowColor=bonus.kind==='star'?'#ffd866':'#f394e8';ctx.shadowBlur=prefs.effects?13:0;
      if(bonus.kind==='star'){drawStar(ctx,x,y,11,'#ffe27c',prefs.effects?Math.sin(game.elapsed/650)*.17:0);ctx.fillStyle='#fff8d6';ctx.beginPath();ctx.arc(x-2,y-3,2,0,Math.PI*2);ctx.fill();}
      else {ctx.fillStyle='#f49ed833';ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;drawBuddy(ctx,bonus.buddy,x,y,38);}
      ctx.restore();
    }
  }
  if (game.overdrive>0 && prefs.effects) { ctx.strokeStyle=`rgba(210,248,106,${.15+Math.sin(performance.now()/180)*.08})`; ctx.lineWidth=6; ctx.strokeRect(2,2,296,596); }
  if(prefs.effects&&!reducedMotion.matches){powerEffects.update(game.state==='paused'||document.hidden?0:dt);powerEffects.draw(ctx);}else powerEffects.reset();
  if (prefs.effects) {
    explosions=explosions.filter(e=>e.life>0);
    explosions.forEach(e=>{
      e.life-=dt;const progress=Math.max(0,1-e.life/e.max),cx=e.x*30+15,cy=e.y*30+15,radius=20+progress*200;
      ctx.save();ctx.globalAlpha=Math.max(0,1-progress);
      if(progress<.48){const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);glow.addColorStop(0,'#fff0b866');glow.addColorStop(.45,'#ff994633');glow.addColorStop(1,'#ff754000');ctx.fillStyle=glow;ctx.fillRect(0,0,300,600);}
      ctx.strokeStyle='#ffc986';ctx.lineWidth=Math.max(1,7*(1-progress));ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ff866e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,radius*.65,0,Math.PI*2);ctx.stroke();ctx.restore();
    });
    flashes = flashes.filter(f=>f.life>0); flashes.forEach(f=>{f.life-=dt;ctx.fillStyle=`rgba(220,255,173,${Math.max(0,f.life/f.max)*.7})`;f.rows.forEach(y=>ctx.fillRect(0,y*30,300,30));});
    dropTrails = dropTrails.filter(t=>t.life>0); dropTrails.forEach(t=>{t.life-=dt;ctx.fillStyle=`rgba(205,242,255,${Math.max(0,t.life/200)*.15})`; t.cells.forEach(p=>ctx.fillRect(p.x*30+4,Math.max(0,(p.y-t.distance)*30),22,t.distance*30));});
    particles=particles.filter(p=>p.life>0); particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;p.vy+=.045*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;if(p.star)drawStar(ctx,p.x,p.y,p.size,p.color,(p.rotation||0)+p.life/180);else ctx.fillRect(p.x,p.y,p.size,p.size);}); ctx.globalAlpha=1;
    flyers=flyers.filter(f=>f.life>0);flyers.forEach(f=>{f.life-=dt;const progress=1-f.life/f.max;ctx.save();ctx.globalAlpha=Math.min(1,Math.max(0,f.life/350));drawBuddy(ctx,f.buddy,f.x,f.y-progress*105,70+Math.sin(progress*Math.PI)*15);ctx.restore();});
  }
}
function renderPieces() {
  holdCtx.clearRect(0,0,100,85); mini(holdCtx,game.hold,50,41,19,game.canHold?1:.4);
  $('empty-hold').style.display=game.hold?'none':'flex';
  setLabel($('hold-canvas'),game.hold?`Peça ${PIECE_NAMES[game.hold]} na reserva`:'Reserva vazia');
  nextCtx.clearRect(0,0,100,335);
  const next=game.queue.slice(0,5);
  next.forEach((type,i)=>{mini(nextCtx,type,50,30+i*66,19,i===0?1:.68);if(i<4){nextCtx.strokeStyle='#292c32';nextCtx.beginPath();nextCtx.moveTo(20,63+i*66);nextCtx.lineTo(80,63+i*66);nextCtx.stroke();}});
  setLabel($('next-canvas'),`Próximas peças: ${next.map(type=>PIECE_NAMES[type]).join(', ')}`);
}
function announce(message) { text('announcer',message); }
function callout(label, sub = '') {
  if(allClearRemaining > 0)return;
  const el=$('game-callout'), heading=document.createTextNode('');setText(heading,label);el.replaceChildren(heading);
  if(sub){const small=document.createElement('small');setText(small, sub);el.append(small);}
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(calloutTimeout);calloutTimeout=setTimeout(()=>el.classList.remove('show'),1200);
}
function burst(rows, color, large = false) {
  if(!prefs.effects)return;
  rows.forEach(y=>{for(let i=0;i<(large?40:22);i++){const life=350+Math.random()*400;particles.push({x:Math.random()*300,y:y*30+15,vx:(Math.random()-.5)*6,vy:-Math.random()*6-1,size:2+Math.random()*4,color,life,max:life,star:Math.random()<.35,rotation:Math.random()*6});}});
  flashes.push({rows,life:240,max:240});
}
function impact() { if(!prefs.effects)return;const el=$('board-frame');el.classList.remove('impact');void el.offsetWidth;el.classList.add('impact');clearTimeout(impactTimeout);impactTimeout=setTimeout(()=>el.classList.remove('impact'),220); }
function bombCelebration(event) {
  sound('bomb');buddyCheer('KABOOM! Abriu espaço!');
  if(prefs.effects){
    explosions.push({...event,life:720,max:720});
    const el=$('board-frame');el.classList.remove('detonating');void el.offsetWidth;el.classList.add('detonating');clearTimeout(blastTimeout);blastTimeout=setTimeout(()=>el.classList.remove('detonating'),460);
    const points=event.destroyed.length?event.destroyed:[{x:event.x,y:event.y,type:'L'}];
    for(const point of points){for(let i=0;i<3;i++){const life=450+Math.random()*550;particles.push({x:point.x*30+15,y:point.y*30+15,vx:(point.x-event.x)*1.1+(Math.random()-.5)*7,vy:-3-Math.random()*8,size:3+Math.random()*5,color:COLORS[point.type]||'#ffd397',life,max:life,star:i===0,rotation:Math.random()*6});}}
    particles=particles.slice(-500);
  }
  announce(`Bomba! ${event.destroyed.length} blocos destruídos. ${event.score} pontos.`);
}
function powerCelebration(event) {
  sound(event.power);
  buddyCheer(event.power==='VOLT'?'Vai, raio! Abre caminho!':event.power==='PRISM'?'Um arco-íris de espaço!':'Corta pela diagonal!');
  if(prefs.effects&&!reducedMotion.matches) {
    powerEffects.trigger(event);
    for(const point of event.destroyed.slice(0,90))for(let i=0;i<2;i++) {
      const life=450+Math.random()*500;
      particles.push({x:point.x*30+15,y:point.y*30+15,vx:(Math.random()-.5)*7,vy:-2-Math.random()*6,size:2+Math.random()*4,color:['#ffe27c','#ff9edd','#85e8fa','#d2f86a'][Math.floor(Math.random()*4)],life,max:life,star:true,rotation:Math.random()*6});
    }
    particles=particles.slice(-500);
  }
  announce(`${PIECE_NAMES[event.power]}! ${event.destroyed.length} blocos removidos. ${event.score} pontos.`);
}
function celebrateAllClear(event) {
  allClearRemaining = 3600;
  const banner = $('all-clear'); banner.classList.remove('visible'); void banner.offsetWidth; banner.classList.add('visible');
  text('all-clear-score',event?.score?`+${formatNumber(event.score)} PONTOS`:'BÔNUS DE PERFEIÇÃO');
  $('game-callout').classList.remove('show'); clearTimeout(calloutTimeout);
  fireworks.reset(); if(prefs.effects && !reducedMotion.matches)fireworks.start();
  buddyCheer('ZEROU TUDO! Que jogada!'); sound('all-clear');
  announce(`All clear! Tabuleiro zerado! +${event?.score||0} pontos.${game.state==='over'?' '+endReason:''}`);
}
function renderAllClear(dt) {
  fireworksCtx.clearRect(0,0,300,600);
  if(allClearRemaining <= 0)return;
  const elapsed = game.state==='paused' || document.hidden ? 0 : dt;
  allClearRemaining = Math.max(0, allClearRemaining - elapsed);
  if(allClearRemaining === 0){$('all-clear').classList.remove('visible');fireworks.reset();return;}
  if(prefs.effects && !reducedMotion.matches){fireworks.update(elapsed);fireworks.draw(fireworksCtx);}
  else fireworks.reset();
}
function saveRecord() {
  const previous = records[game.mode];
  const value = game.mode==='sprint' ? (endWon ? game.elapsed : null) : game.score;
  newRecord = value!==null && value>0 && (!Number.isFinite(previous) || (game.mode==='sprint'?value<previous:value>previous));
  if(newRecord){records[game.mode]=value;storage.set('stack-rush-records',records);}
}
function renderRecords() {
  const list = $('records-list');
  list.replaceChildren();
  for (const mode of RUSH_MODES) {
    const config = MODES[mode], row = document.createElement('div'), copy = document.createElement('div'), title = document.createElement('strong'), note = document.createElement('small'), value = document.createElement('b');
    row.className = 'record-row';
    copy.className = 'record-row-copy';
    setText(title, config.title);
    setText(note, mode === game.mode ? 'modo atual' : 'melhor score');
    setText(value, Number.isFinite(records[mode]) ? formatNumber(records[mode]) : '—');
    copy.append(title, note); row.append(copy, value); list.append(row);
  }
}
function processEvents() {
  const events=game.events.splice(0);
  const allClearEvent = events.find(event=>event.type==='all-clear');
  const allClear = Boolean(allClearEvent);
  for(const event of events){
    if(event.type==='drop'){impact();if(prefs.effects)dropTrails.push({...event,life:180});sound('drop');}
    if(event.type==='rotate'||event.type==='hold'||event.type==='start')sound(event.type);
    if(event.type==='bomb')bombCelebration(event);
    if(event.type==='power')powerCelebration(event);
    if(event.type==='bonus')bonusCelebration(event);
    if(event.type==='buddy-power'){
      callout(BUDDIES[event.buddy]+'!',event.duration?event.label+' · '+event.duration/1000+'s':event.label);
      buddyCheer(event.label+'!',event.buddy);announce(event.duration?BUDDIES[event.buddy]+': '+event.label+' por '+event.duration/1000+' segundos.':BUDDIES[event.buddy]+' · '+event.label);
    }
    if(event.type==='gravity'){sound('gravity');if(prefs.effects)falls.push(...event.moves.map(m=>({...m,life:260,max:260})));}
    if(event.type==='drill'&&event.destroyed.length){burst([...new Set(event.destroyed.map(c=>c.y))],'#ff987a');sound('bomb');}
    if(event.type==='bonus-spawn'&&event.bonus.kind==='buddy'){buddyCheer(event.bonus.dropped?'Cheguei! Me pega depois!':'Me resgata? Encaixe aqui!',event.bonus.buddy);if(event.bonus.dropped)sound('buddy');}
    if(event.type==='clear'){
      buddyCheer(event.combo>0?'Isso! Mais um combo!':'Que encaixe lindo!');
      burst(event.rows,event.color,event.count>=4);sound('clear',event.count);
      const label=event.tSpin?'T-SPIN!':event.count>4?`${event.count} LINHAS!`:event.count===4?'QUAD!':event.combo>0?`COMBO ×${event.combo+1}`:event.count===3?'TRIPLE!':event.count===2?'DOUBLE!':'BOA LINHA!';
      callout(label,`${formatNumber(event.score)} PONTOS`); announce(`${event.count} linhas. ${label} ${event.score} pontos.`);
    }
    if(event.type==='pulse'){buddyCheer('Festa no Overdrive!');burst(event.rows,'#d2f86a',true);impact();sound('pulse');callout('OVERDRIVE','PONTOS ×2 · 8 SEGUNDOS');announce('Pulso ativado. Pontos de linhas em dobro por oito segundos.');}
    if(event.type==='finish'){buddyCheer('Bora mais uma?');held={};endReason=event.reason;endWon=event.won;saveRecord();if(!allClear)sound('finish');announce(`${event.reason} ${game.score} pontos, ${game.lines} linhas.`);}
  }
  const bombEvent=events.find(e=>e.type==='bomb');
  if(bombEvent){const cleared=events.find(e=>e.type==='clear');callout('KABOOM!',`${bombEvent.destroyed.length} BLOCOS${cleared?' · '+cleared.count+' LINHAS':''}`);}
  const powerEvent=events.find(e=>e.type==='power');
  if(powerEvent){const cleared=events.find(e=>e.type==='clear');callout(POWERS[powerEvent.power].label+'!',`${powerEvent.destroyed.length} BLOCOS${cleared?' · '+cleared.count+' LINHAS':''}`);}
  if(allClear)celebrateAllClear(allClearEvent);
  if(events.length){syncUI();renderPieces();}
}
let previousOverlay = '';
function updateOverlay() {
  const signature=`${getLanguage()}-${game.state}-${game.mode}-${endReason}`;
  if(signature===previousOverlay)return;
  previousOverlay=signature;
  const el=$('game-overlay');el.hidden=game.state==='playing';el.classList.toggle('paused',game.state==='paused');el.classList.toggle('over',game.state==='over');
  $('end-stats').hidden=game.state!=='over';
  setText($('play-button').querySelector('span'), game.state==='paused'?'Continuar':game.state==='over'?'Jogar de novo':'Jogar agora');
  if(game.state==='ready'){
    const rush=isRushMode(game.mode);
    text('overlay-eyebrow',rush?`${MODES[game.mode].rushLabel} · SEU MELHOR SCORE.`:game.mode==='sprint'?'40 LINHAS. SEU MELHOR TEMPO.':'UM MIX DE BOAS SURPRESAS.');
    const title=$('overlay-title');title.replaceChildren();title.append(document.createTextNode(t(game.mode==='zen'?'ENTRE NO':game.mode==='sprint'?'ACELERA':'PRONTO')),document.createElement('br'));
    const em=document.createElement('em');setText(em, game.mode==='zen'?'SEU FLOW.':game.mode==='sprint'?'NO SPRINT.':'PRO RUSH?');title.append(em);
    text('overlay-description',rush?`${MODES[game.mode].rushLabel}. Peças com poderes, bombas e bichinhos. Prepare o seu melhor combo!`:game.mode==='sprint'?'40 linhas. Supere seu melhor tempo.':'Peças com poderes e amigos pelo caminho. Sem pressa.');
  } else if(game.state==='paused') {
    text('overlay-eyebrow','UMA PAUSA FAZ PARTE.');text('overlay-title','RESPIRA.');text('overlay-description','Seu próximo encaixe pode esperar.');
  } else if(game.state==='over') {
    text('overlay-eyebrow',newRecord?'NOVO RECORDE PESSOAL!':'TODA PARTIDA É UM RECOMEÇO.');
    text('overlay-title',endWon?'BOM DEMAIS.':'MAIS UMA?');text('overlay-description',endReason);
    const stats=$('end-stats');stats.replaceChildren();
    for(const [label,value] of [['PONTOS',formatNumber(game.score)],['LINHAS',String(game.lines)],...(game.mode==='sprint'?[]:[['RESGATES',String(game.rescued)]])]){const div=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');setText(strong, value);setText(span, label);div.append(strong,span);stats.append(div);}
    if(game.mode==='sprint'&&endWon)text('overlay-description',`40 linhas em ${preciseTime(game.elapsed)}. Belo ritmo!`);
  }
}
function syncUI() {
  const flipped=game.buddyEffects.flip>0&&game.state!=='ready'&&game.state!=='over';
  $('board').classList.toggle('upside-down',flipped);
  $('fireworks').classList.toggle('upside-down',flipped);
  const effectText=Object.entries(BUDDY_POWERS).filter(([,p])=>game.buddyEffects[p.key]>0).map(([i,p])=>`${BUDDIES[i]} · ${p.label} · ${Math.ceil(game.buddyEffects[p.key]/1000)}s`).join('  |  ');
  text('buddy-effects',effectText);$('buddy-effects').hidden=!effectText||game.state==='over';
  text('score',String(game.score).padStart(6,'0'));text('level',String(game.level).padStart(2,'0'));text('lines',String(game.lines).padStart(2,'0'));
  const config=MODES[game.mode], isRush=isRushMode(game.mode), duration=config.duration, remaining=duration?Math.max(0,duration-game.elapsed):0;
  text('timer',formatTime(duration?remaining:game.elapsed));text('timer-label',duration?'Tempo restante':'Tempo de jogo');
  $('time-progress').value=duration?remaining:game.mode==='sprint'?game.lines:game.elapsed%60000;
  $('time-progress').max=duration?duration:game.mode==='sprint'?40:60000;
  setLabel($('time-progress'),duration?'Tempo restante':game.mode==='sprint'?'Linhas de 40':'Tempo no modo Zen');
  document.querySelector('.timer-row').classList.toggle('urgent',isRush&&remaining<=15000&&game.state!=='ready');
  text('mode-tag',isRush?`RUSH ${config.rushLabel}`:game.mode==='sprint'?'SPRINT':'ZEN');text('mode-caption',config.label);
  document.querySelectorAll('[data-mode]').forEach(el=>{const active=el.dataset.mode==='rush'?isRush:el.dataset.mode===game.mode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('[data-rush-mode]').forEach(el=>{const active=isRush&&el.dataset.rushMode===game.mode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  const rushButton=document.querySelector('[data-mode="rush"] .mode-mini');
  if(rushButton)setText(rushButton, MODES[isRush?game.mode:selectedRushMode].rushLabel);
  setLabel($('records-button'),`Ver recordes de Rush, ${isRush?config.rushLabel:'todas as durações'}`);
  text('record-label',isRush?`Seu recorde · Rush ${config.rushLabel.toLowerCase()}`:game.mode==='sprint'?'Seu melhor tempo':'Seu recorde neste dispositivo');
  const over=game.overdrive>0, ready=game.energy>=100;
  text('energy-number',over?`${Math.ceil(game.overdrive/1000)}s`:isRush?`${game.energy}%`:'—');
  document.querySelectorAll('.energy-segments i').forEach((el,i)=>el.classList.toggle('filled',isRush&&(over?i<Math.ceil(game.overdrive/800):i<Math.floor(game.energy/10))));
  $('power-button').disabled=!ready||!isRush||game.state!=='playing'||over;
  text('power-label',!isRush?'Exclusivo do Rush':over?'Overdrive ativo':ready?'Ativar pulso':'Carregando pulso');
  text('power-description',!isRush?(game.mode==='zen'?'Peças com poderes, estrelas e bichinhos. Jogue no seu tempo, sem pulso.':'Sete peças clássicas. Complete as 40 linhas no seu melhor tempo.'):over?'Aproveite: os pontos das linhas estão valendo o dobro!':ready?'Sua energia está no máximo. Solte o pulso e abra espaço!':'Encaixe peças e limpe linhas para carregar seu pulso.');
  $('play-stage').classList.toggle('playing',game.state==='playing');
  const rail=$('rail-power-button');rail.hidden=!isRush;rail.disabled=$('power-button').disabled;rail.classList.toggle('active',over);
  text('rail-power-value',over?`${Math.ceil(game.overdrive/1000)}s`:`${game.energy}%`);
  $('rail-power-fill').style.width=(over?game.overdrive/80:game.energy)+'%';
  setLabel(rail,over?'Overdrive ativo':ready?'Ativar pulso do Overdrive':'Carregando pulso');
  $('power-panel').classList.toggle('unavailable',!isRush);$('board-frame').classList.toggle('overdrive',over);
  text('game-state',game.state==='playing'?(over?'OVERDRIVE · PONTOS ×2':'NO FLOW · PARTIDA EM ANDAMENTO'):game.state==='paused'?'PARTIDA PAUSADA':game.state==='over'?'PARTIDA ENCERRADA':'PRONTO PARA JOGAR');
  const target=game.mode==='sprint'?40:8, completed=game.lines>=target;
  text('challenge-title',completed?'Ritmo encontrado!':game.mode==='sprint'?'Uma linha de cada vez':'Encontre seu ritmo');
  text('challenge-description',completed?'Desafio completo. Continue o seu flow!':game.mode==='sprint'?'Complete as 40 linhas. O tempo é seu adversário.':'Limpe 8 linhas em uma partida. O flow começa aqui.');
  text('challenge-count',`${Math.min(game.lines,target)} / ${target}`);$('challenge-progress').value=Math.min(game.lines,target);$('challenge-progress').max=target;
  if(completed&&!challengeAnnounced&&game.state!=='ready'){challengeAnnounced=true;announce('Desafio da partida concluído!');}
  const record=records[game.mode];text('record',Number.isFinite(record)?game.mode==='sprint'?preciseTime(record):formatNumber(record):'—');
  $('pause-button').disabled=game.state==='ready'||game.state==='over';setLabel($('pause-button'),game.state==='paused'?'Continuar partida':'Pausar partida');$('pause-button').querySelector('use').setAttribute('href',game.state==='paused'?'#i-play':'#i-pause');
  const classic=game.mode==='sprint';
  text('mix-label',classic?'MIX CLÁSSICO':'MIX SURPRESA');
  text('mix-description',classic?'7 peças. Uma corrida contra o tempo.':'Raio. Prisma. Diagonal. E mais surpresas.');
  text('stars-count',game.stars);text('buddies-count',game.rescued);text('bombs-count',game.bombs);
  $('loot-bar').hidden=classic;
  const special=SPECIAL_TYPES.includes(game.active.type);
  const powered=POWER_TYPES.includes(game.active.type), power=POWERS[game.active.type];
  text('piece-name',powered?power.symbol+' '+PIECE_NAMES[game.active.type]:game.active.type==='BOMB'?'Bomba 9 × 9. Solte!':BUDDY_TYPES.includes(game.active.type)?PIECE_NAMES[game.active.type]+' cai e espera o resgate!':special?PIECE_NAMES[game.active.type]+' surpresa':'Encaixe sobre os bônus!');
  const showPower=!classic&&game.state!=='over'&&powered;
  $('piece-power').hidden=!showPower;
  $('piece-power').style.setProperty('--power-color',powered?COLORS[game.active.type]:COLORS.DIAG);
  setText($('piece-power-symbol'), powered?power.symbol:POWERS.DIAG.symbol);
  text('piece-power-name',powered?PIECE_NAMES[game.active.type]+' · ativa ao encaixar':'');
  let description=powered?power.description:'';
  if(game.active.type==='PRISM') { const preview=game.powerPreview();description=preview.target?`Cor-alvo: ${COLOR_NAMES[preview.target]||PIECE_NAMES[preview.target]}. ${preview.cells.length} blocos vão sumir!`:'Ainda sem cor-alvo. Guarde na reserva para usar depois!'; }
  if(game.active.type==='VOLT') { const count=game.powerPreview().columns.length;description=`Vai limpar ${count===1?'1 coluna inteira':count+' colunas inteiras'}. Gire para mudar o alcance!`; }
  text('piece-power-description',description);
  $('board-frame').classList.toggle('charged-piece',powered);
  $('board-frame').style.setProperty('--power-color',powered?COLORS[game.active.type]:COLORS.DIAG);
  $('piece-name').classList.toggle('special',special);
  if(latestPiece!==game.active){latestPiece=game.active;$('board-frame').classList.toggle('special-piece',special);}
  text('music-track',audio.track.title);
  $('music-button').title=`${audio.track.title} · ${audio.track.genre} · ${audio.track.bpm} BPM`;
  const musicActive=prefs.music&&game.state==='playing'&&audio.context?.state==='running';
  $('music-button').classList.toggle('is-playing',musicActive);
  text('music-state',!prefs.music?'desligada':game.state==='paused'?'pausada':musicActive?'tocando':'ao jogar');
  $('music-button').setAttribute('aria-pressed',String(prefs.music));
  setLabel($('music-button'),prefs.music?'Desativar música':'Ativar música');
  audio.setState({playing:game.state==='playing',mode:game.mode,overdrive:game.overdrive>0,level:game.level},prefs);
  updateOverlay();
}
function startGame() {
  prepareAudio();held={};
  if(game.state==='paused'){game.resume();syncUI();return;}
  if(game.state==='over')resetGame(game.mode);
  game.start();processEvents();syncUI();lastFrame=performance.now();
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
}
function resetGame(mode=game.mode) {
  if(isRushMode(mode))selectedRushMode=mode;
  audio.reset();game.reset(mode);particles=[];flashes=[];dropTrails=[];flyers=[];explosions=[];held={};touchGesture=null;latestPiece=null;
  powerEffects.reset();powerVisualTime=0;previewClock=0;
  allClearRemaining=0;fireworks.reset();fireworksCtx.clearRect(0,0,300,600);$('all-clear').classList.remove('visible');
  clearTimeout(blastTimeout);$('board-frame').classList.remove('detonating');
  clearTimeout(pickupTimeout);$('pickup-notice').classList.remove('visible');buddyCheer('Bora encaixar?',0);endReason='';endWon=false;newRecord=false;challengeAnnounced=false;previousOverlay='';
  $('game-callout').classList.remove('show');document.querySelectorAll('[data-mode]').forEach(el=>{const active=el.dataset.mode===mode;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});syncUI();renderPieces();
}
function togglePause(){held={};if(game.state==='playing'){game.pause();announce('Partida pausada.');}else if(game.state==='paused'){game.resume();announce('Partida retomada.');}syncUI();}
function openDialog(dialog) {
  if(document.querySelector('dialog[open]'))return;
  dialogWasPlaying=game.state==='playing';if(dialogWasPlaying)game.pause();held={};syncUI();dialog.returnValue='';dialog.showModal();
}
function confirmThen(action, modeChange=false) {
  if(game.state!=='playing'&&game.state!=='paused'){action();return;}
  queuedConfirm=action;text('confirm-text',modeChange?'Trocar de modo encerra a partida atual. Seu recorde anterior continua salvo.':'Recomeçar descarta o progresso desta partida. Seu recorde anterior continua salvo.');text('confirm-button',modeChange?'Trocar de modo':'Recomeçar');openDialog($('confirm-dialog'));
}
function requestMode(mode) { if(!MODES[mode])throw new Error('Modo inválido.');if(mode===game.mode)return;confirmThen(()=>resetGame(mode),true); }
function doAction(action) {
  if(game.state!=='playing')return;
  if(game.buddyEffects.flip>0){if(action==='left')action='right';else if(action==='right')action='left';}
  if(action==='left')game.move(-1);if(action==='right')game.move(1);if(action==='rotate')game.rotate(1);if(action==='counter')game.rotate(-1);if(action==='rotate180')game.rotate(2);
  if(action==='down'){if(game.move(0,1))game.score++;}
  if(action==='drop')game.hardDrop();if(action==='hold')game.swap();if(action==='pulse')game.pulse();processEvents();syncUI();
}
function touchBoardDown(event) {
  if(game.state!=='playing'||!['touch','pen'].includes(event.pointerType))return;
  if(event.target.closest('button'))return;
  const rect=$('board').getBoundingClientRect();
  if(event.clientY<rect.top-36||event.clientY>rect.bottom+36)return;
  event.preventDefault(); prepareAudio();
  const surface=event.currentTarget;
  try{surface.setPointerCapture(event.pointerId);}catch{}
  touchGesture={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,axis:'',movedCells:0,dropped:false,softDrop:false,started:performance.now(),surface};
}
function touchBoardMove(event) {
  const gesture=touchGesture;
  if(!gesture||gesture.pointerId!==event.pointerId)return;
  event.preventDefault();
  if(gesture.dropped||game.state!=='playing')return;
  const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY,absX=Math.abs(dx),absY=Math.abs(dy);
  if(!gesture.axis&&(absX>=18||absY>=18))gesture.axis=absX>absY?'horizontal':'vertical';
  if(gesture.axis==='horizontal'){
    const step=Math.max(16,$('board').getBoundingClientRect().width/10*.68),desired=Math.max(-9,Math.min(9,Math.trunc(dx/step))),delta=desired-gesture.movedCells;
    for(let i=0;i<Math.abs(delta);i++)doAction(delta>0?'right':'left');
    gesture.movedCells=desired;
  } else if(gesture.axis==='vertical'&&dy>Math.max(16,$('board').getBoundingClientRect().height*.025)&&dy>absX*1.15){
    if(!gesture.softDrop){gesture.softDrop=true;held['touch-soft-drop']={action:'down',since:performance.now(),last:performance.now()};}
    if(dy>Math.max(72,$('board').getBoundingClientRect().height*.1)){gesture.dropped=true;delete held['touch-soft-drop'];doAction('drop');}
  }
}
function touchBoardUp(event) {
  const gesture=touchGesture;
  if(!gesture||gesture.pointerId!==event.pointerId)return;
  event.preventDefault(); touchGesture=null;delete held['touch-soft-drop'];
  try{gesture.surface.releasePointerCapture(event.pointerId);}catch{}
  if(gesture.dropped||game.state!=='playing')return;
  const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
  const dropThreshold=Math.max(72,$('board').getBoundingClientRect().height*.1);
  if(gesture.axis==='vertical'&&dy>dropThreshold&&dy>Math.abs(dx)*1.15){doAction('drop');return;}
  if(!gesture.axis&&Math.hypot(dx,dy)<16&&performance.now()-gesture.started<420)doAction('rotate');
}
function touchBoardCancel(event) {
  if(touchGesture?.pointerId!==event.pointerId)return;
  delete held['touch-soft-drop']; touchGesture=null;
}
function applyPrefs() {
  document.body.classList.toggle('reduced-motion',!prefs.effects);if(!prefs.effects){particles=[];flashes=[];dropTrails=[];flyers=[];explosions=[];}
  if(!prefs.effects || reducedMotion.matches){fireworks.reset();fireworksCtx.clearRect(0,0,300,600);}
  if(!prefs.effects || reducedMotion.matches)powerEffects.reset();
  $('sound-button').querySelector('use').setAttribute('href',prefs.sound?'#i-volume':'#i-muted');setLabel($('sound-button'),prefs.sound?'Desativar som':'Ativar som');$('sound-button').setAttribute('aria-pressed',String(prefs.sound));
  ['sound','music','effects','ghost'].forEach(name=>$(name+'-setting').checked=prefs[name]);$('music-volume').value=Math.round(prefs.volume*100);text('music-volume-label',Math.round(prefs.volume*100)+'%');storage.set('stack-rush-preferences',prefs);syncUI();
}
$('play-button').addEventListener('click',startGame);
$('pause-button').addEventListener('click',togglePause);
$('restart-button').addEventListener('click',()=>confirmThen(()=>{resetGame();startGame();}));
['power-button','rail-power-button'].forEach(id=>$(id).addEventListener('click',()=>doAction('pulse')));
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>requestMode(button.dataset.mode==='rush'?selectedRushMode:button.dataset.mode)));
document.querySelectorAll('[data-rush-mode]').forEach(button=>button.addEventListener('click',()=>requestMode(button.dataset.rushMode)));
$('records-button').addEventListener('click',()=>{renderRecords();openDialog($('records-dialog'));});
$('play-stage').addEventListener('pointerdown',touchBoardDown,{passive:false});
$('play-stage').addEventListener('pointermove',touchBoardMove,{passive:false});
$('play-stage').addEventListener('pointerup',touchBoardUp,{passive:false});
$('play-stage').addEventListener('pointercancel',touchBoardCancel,{passive:false});
['help-nav','all-controls'].forEach(id=>$(id).addEventListener('click',()=>openDialog($('help-dialog'))));
$('settings-button').addEventListener('click',()=>openDialog($('settings-dialog')));
$('sound-button').addEventListener('click',()=>{prefs.sound=!prefs.sound;prepareAudio();applyPrefs();if(prefs.sound)sound('hold');});
['sound','music','effects','ghost'].forEach(name=>$(name+'-setting').addEventListener('change',e=>{prefs[name]=e.target.checked;prepareAudio();applyPrefs();}));
$('music-button').addEventListener('click',()=>{prefs.music=!prefs.music;prepareAudio();applyPrefs();});
$('shuffle-music-button').addEventListener('click',()=>{prepareAudio();audio.nextTrack();syncUI();announce('Música: '+audio.track.title);});
$('music-volume').addEventListener('input',e=>{prefs.volume=Number(e.target.value)/100;applyPrefs();});
window.addEventListener('pagehide',e=>{if(e.persisted)audio.stopMusic();else audio.destroy();});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close('cancel')));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close('cancel');}});
  dialog.addEventListener('close',()=>{const shouldResume=dialogWasPlaying;dialogWasPlaying=false;if(dialog.id==='confirm-dialog'&&dialog.returnValue==='confirm'&&queuedConfirm){const action=queuedConfirm;queuedConfirm=null;action();}else{queuedConfirm=null;if(shouldResume&&game.state==='paused')game.resume();}held={};syncUI();});
});
$('confirm-button').addEventListener('click',()=>$('confirm-dialog').close('confirm'));
$('fullscreen-button').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game-app').requestFullscreen();}
  catch{announce('A tela cheia não está disponível neste navegador.');}
});
if(!document.fullscreenEnabled)$('fullscreen-button').hidden=true;
const keyActions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',KeyX:'rotate',KeyZ:'counter',KeyA:'rotate180',ArrowDown:'down',Space:'drop',KeyC:'hold',ShiftLeft:'hold',ShiftRight:'hold',KeyF:'pulse'};
window.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
  if(e.code==='Enter' && e.target instanceof Element && e.target.closest('button,a'))return;
  if(e.code==='Space' && e.target instanceof Element && e.target.closest('button,a'))return;
  if(e.code==='Enter'){if(game.state!=='playing'){e.preventDefault();if(!e.repeat)startGame();}return;}
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!e.repeat)togglePause();return;}
  if(e.code==='KeyR'){e.preventDefault();if(!e.repeat)confirmThen(()=>{resetGame();startGame();});return;}
  const action=keyActions[e.code];if(!action||game.state!=='playing')return;e.preventDefault();if(e.repeat)return;
  doAction(action);if(['left','right','down'].includes(action))held[e.code]={action,since:performance.now(),last:performance.now()};
});
window.addEventListener('keyup',e=>{delete held[e.code];});
function releaseAll(){held={};touchGesture=null;if(game.state==='playing'){game.pause();syncUI();}}
window.addEventListener('blur',releaseAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
document.querySelectorAll('[data-action]').forEach(button=>{
  button.addEventListener('pointerdown',e=>{e.preventDefault();prepareAudio();button.setPointerCapture(e.pointerId);const action=button.dataset.action;doAction(action);if(['left','right','down'].includes(action))held['touch-'+e.pointerId]={action,since:performance.now(),last:performance.now()};});
  const release=e=>{delete held['touch-'+e.pointerId];};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
});
function frame(now){
  const dt=lastFrame?Math.min(now-lastFrame,100):16;lastFrame=now;
  if(game.state==='playing'){
    for(const control of Object.values(held)){if(control.action!=='down'&&now-control.since>145&&now-control.last>40){doAction(control.action);control.last=now;}}
    game.tick(dt,Object.values(held).some(h=>h.action==='down'));processEvents();
  }
  render(dt);renderAllClear(dt);uiClock+=dt;if(uiClock>75){syncUI();uiClock=0;}
  previewClock+=dt;
  if(previewClock>=80){previewClock=0;if(prefs.effects&&!reducedMotion.matches&&(game.state==='ready'||game.state==='playing')&&[game.hold,...game.queue.slice(0,5)].some(type=>POWER_TYPES.includes(type)))renderPieces();}
  requestAnimationFrame(frame);
}
function registerAgentTools(){
  const context=document.modelContext;if(!context?.registerTool)return;
  const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'read_game_state',title:'Ler partida de Stack Rush',description:'Lê o modo, a pontuação, o tempo, as próximas peças, o poder ativo, os ALL CLEAR, as estrelas e os bichinhos da partida atual.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Envie um objeto vazio.');return game.snapshot();}});
  register({name:'start_game',title:'Iniciar partida de Stack Rush',description:'Inicia uma partida no modo indicado. Rush aceita 1, 2, 5 ou 10 minutos; recusa substituir uma partida em andamento.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['rush1','rush','rush5','rush10','sprint','zen']}},required:['mode'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>key!=='mode')||!Object.hasOwn(MODES,input.mode))throw new Error('Escolha Rush 1, Rush 2, Rush 5, Rush 10, Sprint ou Zen.');if(document.querySelector('dialog[open]'))throw new Error('Feche a janela aberta primeiro.');if(game.state==='playing'||game.state==='paused')throw new Error('Já existe uma partida em andamento.');resetGame(input.mode);startGame();return game.snapshot();}});
  register({name:'set_game_paused',title:'Pausar ou retomar partida',description:'Pausa ou retoma a partida atual, sem alterar o progresso.',inputSchema:{type:'object',properties:{paused:{type:'boolean'}},required:['paused'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>key!=='paused')||typeof input.paused!=='boolean')throw new Error('paused deve ser verdadeiro ou falso.');if(document.querySelector('dialog[open]'))throw new Error('Feche a janela aberta primeiro.');if(!['playing','paused'].includes(game.state))throw new Error('Nenhuma partida em andamento.');held={};if(input.paused)game.pause();else game.resume();syncUI();return game.snapshot();}});
}
capturePage(document);
translatePage(document);
$('language-setting').value=getLanguage();
$('language-setting').addEventListener('change',event=>{
  setLanguage(event.target.value);
  translatePage(document);
  previousOverlay='';
  syncUI();renderPieces();renderRecords();
});
SPECIAL_TYPES.forEach((type,i)=>mini(mixCtx,type,(i+.5)*450/SPECIAL_TYPES.length,27,13));
applyPrefs();syncUI();renderPieces();render(0);registerAgentTools();requestAnimationFrame(frame);
