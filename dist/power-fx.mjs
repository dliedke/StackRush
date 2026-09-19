import { COLORS } from './engine.mjs?v=20260919-4';

const HUES = { VOLT: 45, PRISM: 305, DIAG: 185, ROCKET: 20 };

export function drawRocket(context, x, y, size, rotation = 0, time = 0, animate = true, ghost = false) {
  context.save();context.translate(x,y);context.rotate(rotation*Math.PI/2);context.scale(size,size);
  context.globalAlpha*=ghost?.45:1;
  if(!ghost){
    const flame=animate?.14+Math.sin(time/65)*.07:.14;
    context.fillStyle='#ff8855';context.beginPath();context.moveTo(-.13,-.18);context.lineTo(0,-.45-flame);context.lineTo(.13,-.18);context.fill();
    context.fillStyle='#fff0a1';context.beginPath();context.moveTo(-.065,-.18);context.lineTo(0,-.39-flame*.5);context.lineTo(.065,-.18);context.fill();
  }
  context.fillStyle='#ff786d';context.strokeStyle='#fff4d8';context.lineWidth=.025;
  context.beginPath();context.moveTo(-.12,-.23);context.lineTo(-.32,-.29);context.lineTo(-.2,.08);context.lineTo(.2,.08);context.lineTo(.32,-.29);context.lineTo(.12,-.23);context.closePath();context.fill();
  context.fillStyle=ghost?'#ffbc91':'#e9f7ff';context.beginPath();context.moveTo(0,.43);context.bezierCurveTo(-.27,.19,-.2,-.17,-.12,-.26);context.lineTo(.12,-.26);context.bezierCurveTo(.2,-.17,.27,.19,0,.43);context.fill();context.stroke();
  context.fillStyle='#ff786d';context.beginPath();context.moveTo(0,.43);context.quadraticCurveTo(-.12,.32,-.15,.2);context.lineTo(.15,.2);context.quadraticCurveTo(.12,.32,0,.43);context.fill();
  context.fillStyle='#4adcf0';context.beginPath();context.arc(0,-.02,.09,0,Math.PI*2);context.fill();context.stroke();
  context.restore();
}

export function drawBird(context, bird, time, animate) {
  context.save();context.translate(bird.x*30,bird.y*30);context.scale(bird.direction,1);
  const flap=animate?Math.sin(time/95+bird.id)*5:0;
  context.fillStyle='#ffb973';context.beginPath();context.moveTo(-7,1);context.lineTo(-14,-4);context.lineTo(-11,5);context.closePath();context.fill();
  context.fillStyle='#7edff0';context.beginPath();context.ellipse(0,2,9,7,0,0,Math.PI*2);context.fill();
  context.fillStyle='#d8fcff';context.beginPath();context.ellipse(2,4,5,3,0,0,Math.PI*2);context.fill();
  context.fillStyle='#46aecb';context.beginPath();context.moveTo(0,2);context.quadraticCurveTo(-12,-11+flap,-8,-7+flap);context.quadraticCurveTo(7,-6,0,2);context.fill();
  context.fillStyle='#ffd176';context.beginPath();context.moveTo(8,0);context.lineTo(14,3);context.lineTo(8,5);context.closePath();context.fill();
  context.fillStyle='#172b3e';context.beginPath();context.arc(5,-1,1.6,0,Math.PI*2);context.fill();
  context.fillStyle='#fff';context.beginPath();context.arc(5.4,-1.6,.5,0,Math.PI*2);context.fill();context.restore();
}

export function drawPowerBlock(context, x, y, size, type, time, animate, ghost) {
  const hue = HUES[type] + (animate ? time * .036 : 0) + x * .3 + y * .13;
  const pulse = animate ? .75 + Math.sin(time / 320) * .25 : .8;
  const gradient = context.createLinearGradient(x,y,x+size,y+size);
  gradient.addColorStop(0,`hsl(${hue} 95% 77%)`);
  gradient.addColorStop(.48,`hsl(${hue+80} 90% 68%)`);
  gradient.addColorStop(1,`hsl(${hue+185} 95% 73%)`);
  context.save();
  context.beginPath(); context.roundRect(x+1.5,y+1.5,size-3,size-3,Math.min(4,size*.15));
  if(ghost) {
    context.strokeStyle=gradient; context.lineWidth=1.7; context.globalAlpha*=.6; context.stroke();
  } else {
    context.shadowColor=COLORS[type]; context.shadowBlur=animate?7+pulse*9:4;
    context.fillStyle=gradient; context.fill(); context.shadowBlur=0;
    context.strokeStyle=`rgba(255,255,255,${.45+pulse*.35})`; context.lineWidth=1.2; context.stroke();
    context.save(); context.clip();
    const shine=animate?(time/24+x+y)%(size*2)-size:size*.1;
    context.fillStyle='#ffffff45'; context.beginPath();
    context.moveTo(x+shine,y);context.lineTo(x+shine+size*.24,y);context.lineTo(x+shine+size*1.24,y+size);context.lineTo(x+shine+size,y+size);context.closePath();context.fill();
    context.restore();
  }
  context.translate(x+size/2,y+size/2); context.scale(size,size);
  context.strokeStyle=ghost?'#e9f7ff':'#15223acc';context.fillStyle=ghost?'#e9f7ff':'#15223acc';context.lineWidth=.055;
  if(type==='VOLT') {
    context.beginPath(); context.moveTo(.04,-.3);context.lineTo(-.24,.04);context.lineTo(-.02,.04);context.lineTo(-.06,.3);context.lineTo(.24,-.07);context.lineTo(.03,-.07);context.closePath();context.fill();
  } else if(type==='PRISM') {
    context.beginPath();context.moveTo(0,-.26);context.lineTo(.23,0);context.lineTo(0,.26);context.lineTo(-.23,0);context.closePath();context.stroke();
    context.beginPath();context.moveTo(-.23,0);context.lineTo(.23,0);context.moveTo(0,-.26);context.lineTo(0,.26);context.stroke();
  } else if(type==='DIAG') {
    context.beginPath();context.moveTo(-.27,-.26);context.lineTo(.27,.26);context.stroke();
    context.beginPath();context.moveTo(-.27,.02);context.lineTo(0,.29);context.moveTo(0,-.29);context.lineTo(.27,-.02);context.stroke();
  } else {
    context.beginPath();context.arc(0,0,.24,0,Math.PI*2);context.stroke();
    context.beginPath();context.moveTo(0,-.16);context.lineTo(0,0);context.lineTo(.13,.08);context.stroke();
  }
  context.restore();
}

export function drawCharge(context, occupied, type, time, animate) {
  if(!animate || !occupied.length)return;
  const left=Math.min(...occupied.map(c=>c.x))*30-3, right=(Math.max(...occupied.map(c=>c.x))+1)*30+3;
  const top=Math.min(...occupied.map(c=>c.y))*30-4, bottom=(Math.max(...occupied.map(c=>c.y))+1)*30+3;
  context.save();context.strokeStyle=COLORS[type];context.shadowColor=COLORS[type];context.shadowBlur=11;context.lineWidth=1.3;
  context.globalAlpha=.55+Math.sin(time/320)*.2;
  context.beginPath();
  for(let i=0;i<=12;i++) { const x=left+(right-left)*i/12,y=top+Math.sin(time/150+i*2)*3; if(i===0)context.moveTo(x,y);else context.lineTo(x,y); }
  context.stroke();context.beginPath();
  for(let i=0;i<=12;i++) { const x=right+Math.sin(time/170+i*2.1)*3,y=top+(bottom-top)*i/12; if(i===0)context.moveTo(x,y);else context.lineTo(x,y); }
  context.stroke();context.restore();
}

export class PowerEffects {
  constructor(random=Math.random) { this.random=random; this.reset(); }
  reset() { this.effects=[]; }
  trigger(event) {
    const rows=event.rows||20,bolts=event.columns.map(x=>Array.from({length:rows+1},(_,i)=>({x:x*30+15+(i===0||i===rows?0:(this.random()-.5)*13),y:i*30})));
    this.effects.push({...event,age:0,life:1300,bolts});this.effects=this.effects.slice(-3);
  }
  update(dt) { for(const effect of this.effects)effect.age+=dt;this.effects=this.effects.filter(effect=>effect.age<effect.life); }
  draw(context) {
    for(const effect of this.effects) {
      const progress=effect.age/effect.life, fade=Math.max(0,1-progress);
      const ox=effect.origin.x*30+15,oy=effect.origin.y*30+15;
      context.save();context.globalCompositeOperation='lighter';context.globalAlpha=fade;context.lineCap='round';
      context.shadowColor=COLORS[effect.power];context.shadowBlur=15;
      if(effect.power==='ROCKET') {
        const line=effect.line,travel=Math.min(1,effect.age/750),end=line.at(-1)||effect.origin;
        const x=ox+(end.x-effect.origin.x)*30*travel,y=oy+(end.y-effect.origin.y)*30*travel;
        context.strokeStyle='#ff995577';context.lineWidth=13;context.beginPath();context.moveTo(ox,oy);context.lineTo(x,y);context.stroke();
        context.strokeStyle='#fff1b8';context.lineWidth=3;context.stroke();
        context.globalCompositeOperation='source-over';context.shadowBlur=0;
        drawRocket(context,x,y,35,effect.rotation,effect.age,true);
      } else if(effect.power==='VOLT') {
        for(const bolt of effect.bolts) {
          const count=Math.max(2,Math.ceil(Math.min(1,effect.age/170)*bolt.length));
          context.beginPath();bolt.slice(0,count).forEach((p,i)=>{if(i===0)context.moveTo(p.x,p.y);else context.lineTo(p.x,p.y);});
          context.strokeStyle='#ffe27c55';context.lineWidth=12;context.stroke();context.strokeStyle='#fff8de';context.lineWidth=2.6;context.stroke();
        }
      } else if(effect.power==='PRISM') {
        context.globalAlpha=fade*.6;context.lineWidth=1.3;
        for(const target of effect.destroyed.slice(0,70)) { context.strokeStyle=COLORS[target.type];context.beginPath();context.moveTo(ox,oy);context.lineTo(target.x*30+15,target.y*30+15);context.stroke(); }
        context.globalAlpha=fade;
        for(let i=0;i<3;i++) { context.strokeStyle=['#ff9edd','#8becff','#ffe393'][i];context.lineWidth=2.5;context.beginPath();context.arc(ox,oy,15+progress*190+i*12,0,Math.PI*2);context.stroke(); }
      } else if(effect.power==='DIAG') {
        const line=effect.line||[];
        context.strokeStyle='#85e8fa55';context.lineWidth=12;context.beginPath();
        line.forEach((point,i)=>{const x=point.x*30+15,y=point.y*30+15+(i%2?2:-2);if(i===0)context.moveTo(x,y);else context.lineTo(x,y);});context.stroke();
        context.strokeStyle='#e9fbff';context.lineWidth=2.8;context.beginPath();
        line.forEach((point,i)=>{const x=point.x*30+15,y=point.y*30+15+(i%2?2:-2);if(i===0)context.moveTo(x,y);else context.lineTo(x,y);});context.stroke();
        for(let i=1;i<line.length;i+=2){const point=line[i];context.beginPath();context.moveTo(point.x*30+7,point.y*30+7);context.lineTo(point.x*30+24,point.y*30+23);context.stroke();}
      }
      context.restore();
    }
  }
}
