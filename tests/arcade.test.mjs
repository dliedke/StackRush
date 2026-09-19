import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,POWER_TYPES,CLASSIC_TYPES,SHAPES,cells,BUFFER} from '../dist/engine.mjs';

const piece = (type,x,y,rotation=0) => ({type,x,y,rotation,matrix:SHAPES[type].map(row=>[...row])});
function playing(mode='zen',cols=10,rows=20) {
  const game=new Game(mode,()=>.25,cols,rows);game.start();game.bonuses=[];game.events=[];return game;
}
const bird = (id,x,y,direction=1) => ({id,x,y,direction,speed:2});

test('power bags include rockets, use all four powers and never repeat across bags',()=>{
  for(const random of [()=>0,()=>.25,()=>.75,()=>.999]){
    const game=new Game('zen',random),powers=[];
    for(let i=0;i<400;i++){if(POWER_TYPES.includes(game.active.type))powers.push(game.active.type);game.spawn();}
    assert.ok(powers.includes('ROCKET'));
    for(let i=1;i<powers.length;i++)assert.notEqual(powers[i],powers[i-1]);
    for(let i=0;i+4<=powers.length;i+=4)assert.equal(new Set(powers.slice(i,i+4)).size,4);
  }
});

test('rocket rotation aims in all four directions, including hidden rows and custom boards',()=>{
  for(let rotation=0;rotation<4;rotation++){
    const game=playing('rush',6,8);game.active=piece('ROCKET',2,3,rotation);
    const path=game.powerPreview().cells;
    const [dx,dy]=[[0,1],[-1,0],[0,-1],[1,0]][rotation];
    assert.deepEqual(path[1],{x:2+dx,y:3+dy});
    if(rotation===2)assert.equal(path.at(-1).y,-BUFFER);
    for(const {x,y} of path.slice(1))game.put(x,y,'O');
    game.board[7][5]='T';game.level=2;game.overdrive=1000;
    assert.equal(game.activatePower(cells(game.active)),path.length-1);
    const event=game.events.find(e=>e.type==='power');
    assert.deepEqual(event.line,path);assert.equal(event.rotation,rotation);
    assert.equal(event.score,(path.length-1)*25*2*2);
    assert.deepEqual(game.stack().flat().filter(Boolean),['T']);
    assert.equal(game.powerUses,1);
  }
  const game=playing();game.active=piece('ROCKET',0,0);
  assert.ok(game.rotate());assert.equal(game.active.rotation,1);
  assert.ok(game.rotate(-1));assert.equal(game.active.rotation,0);
  assert.ok(game.rotate(2));assert.equal(game.active.rotation,2);
});

test('rocket landing consumes it, clears its path, collects bonuses and awards all clear',()=>{
  const game=playing();game.active=piece('ROCKET',4,0);
  game.board[12][4]='I';game.board[19][4]='O';
  game.bonuses=[{id:1,kind:'star',x:4,y:15,ttl:18000}];
  game.birds=[bird(1,4.5,16.5)];
  game.hardDrop();
  assert.ok(game.board.flat().every(cell=>!cell));
  assert.equal(game.stars,1);assert.equal(game.birdsHit,1);assert.equal(game.allClears,1);
  assert.equal(game.events.find(e=>e.type==='power').destroyed.length,2);
  assert.ok(game.score>=5550);
  game.canHold=true;game.active=piece('ROCKET',4,0);assert.ok(game.swap());assert.equal(game.hold,'ROCKET');
});

test('the periodic streak inserts exactly six pieces and preserves the existing queue',()=>{
  const game=playing();game.queue=['Z','T','ROCKET','O','S','J','L'];
  game.pieces=game.nextStreakAt;const oldQueue=[...game.queue];game.spawn();
  const type=game.active.type;assert.ok(CLASSIC_TYPES.includes(type));
  assert.equal(game.pieceStreak.remaining,5);
  assert.deepEqual(game.queue.slice(0,5),Array(5).fill(type));
  for(let i=0;i<5;i++){game.spawn();assert.equal(game.active.type,type);}
  assert.equal(game.pieceStreak.remaining,0);
  game.spawn();assert.equal(game.pieceStreak,null);assert.equal(game.active.type,oldQueue[0]);
  assert.deepEqual(game.queue.slice(0,oldQueue.length-1),oldQueue.slice(1));
  assert.equal(game.events.filter(e=>e.type==='piece-streak').length,1);
  assert.ok(game.nextStreakAt>game.pieces+6);
});

test('streaks trigger through normal locking, and hold plus buddy gifts keep the remaining six-piece run intact',()=>{
  const game=playing();game.nextStreakAt=1;game.active=piece('DOT',0,0);game.hardDrop();
  const type=game.active.type;assert.equal(game.pieceStreak.remaining,5);
  game.hold='ROCKET';assert.ok(game.swap());assert.equal(game.active.type,'ROCKET');
  assert.equal(game.pieceStreak.remaining,5);
  for(const index of [5,9]){
    game.bonuses.push({id:index,kind:'buddy',buddy:index,x:0,y:19,ttl:18000});
    game.collectBonuses([{x:0,y:19}]);
  }
  assert.deepEqual(game.queue.slice(0,5),Array(5).fill(type));
  assert.ok(game.queue.slice(5,10).every(type=>type.startsWith('BUDDY')));
  assert.deepEqual(game.queue.slice(10,16),['I','I','O','I','I','O']);
  game.canHold=true;game.hold=null;assert.ok(game.swap());assert.equal(game.pieceStreak.remaining,4);
});

test('birds spawn in empty lanes, respect board size and stop at newly placed blocks',()=>{
  const game=playing('zen',6,8);game.board[2].fill('T');
  assert.ok(game.spawnBird());
  assert.ok(game.birds.every(b=>game.board[Math.floor(b.y)].every(cell=>!cell)));
  game.birds=[bird(50,.5,5.5)];game.board[5][2]='O';game.advanceBirds(3000);
  assert.equal(game.birds.length,0);assert.equal(game.birdsHit,0);
  for(const row of game.board)row.fill('I');assert.equal(game.spawnBird(),false);
  const small=playing('zen',4,4);assert.ok(small.spawnBird());assert.ok(small.birds[0].y<4);
});

test('birds crossing an active piece are hit even across a long update',()=>{
  const game=playing();game.active=piece('DOT',4,5);game.birds=[bird(1,.5,5.5)];
  game.advanceBirds(3000);assert.equal(game.birdsHit,1);assert.equal(game.birds.length,0);
  assert.equal(game.score,300);
  game.birds=[bird(2,8.5,5.5)];game.advanceBirds(3000);assert.equal(game.birds.length,0);assert.equal(game.birdsHit,1);
});

test('hard drop hits birds along the swept path only, and each bird scores once',()=>{
  const game=playing('rush');game.level=3;game.overdrive=2000;game.active=piece('DOT',4,0);
  game.birds=[bird(1,4.5,5.5),bird(2,6.5,5.5)];game.hardDrop();
  assert.equal(game.birdsHit,1);assert.equal(game.birds[0].id,2);
  assert.equal(game.events.find(e=>e.type==='bird-hit').score,1800);
  const score=game.score;assert.equal(game.hitBird(1),false);assert.equal(game.score,score);
  assert.equal(game.hitBirdAt(NaN,5),false);assert.equal(game.hitBirdAt(4.5,5.5),false);
  assert.ok(game.hitBirdAt(6.5,5.5));assert.equal(game.birdsHit,2);
});

test('movement, rotation and explosions can hit birds',()=>{
  const game=playing();game.active=piece('DOT',3,5);game.birds=[bird(1,4.5,5.5)];
  assert.ok(game.move(1));assert.equal(game.birdsHit,1);
  game.active=piece('T',3,5);game.birds=[bird(2,4.5,7.5)];
  assert.ok(game.rotate());assert.equal(game.birdsHit,2);
  game.birds=[bird(3,2.5,10.5)];game.detonateBomb({x:4,y:8});assert.equal(game.birdsHit,3);
});

test('pause freezes birds and streaks, finish rejects hits, and reset clears all new state',()=>{
  const game=playing();game.pieces=game.nextStreakAt;game.spawn();game.birds=[bird(1,.5,5.5)];
  game.pause();const before=game.snapshot();game.tick(15000);
  assert.deepEqual(game.snapshot(),before);assert.equal(game.hitBirdAt(.5,5.5),false);
  game.resume();game.tick(100);assert.notEqual(game.birds[0].x,.5);
  game.finish(false,'Fim');assert.equal(game.hitBird(1),false);
  game.reset();assert.deepEqual(game.birds,[]);assert.equal(game.birdsHit,0);assert.equal(game.pieceStreak,null);
});

test('Sprint keeps classic bags without rockets, streaks or birds',()=>{
  const game=playing('sprint');game.pieces=100;game.nextStreakAt=0;
  for(let i=0;i<100;i++){game.spawn();assert.ok(CLASSIC_TYPES.includes(game.active.type));}
  game.tick(5000);assert.equal(game.spawnBird(),false);
  assert.equal(game.pieceStreak,null);assert.deepEqual(game.birds,[]);
});
