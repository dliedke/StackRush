import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,BUDDIES} from '../dist/engine.mjs';
import {BuddyAlbum,RecordRival,createMissions} from '../dist/progression.mjs';

function game(mode='zen') { const value=new Game(mode,()=>.2);value.start();value.bonuses=[];value.events=[];return value; }
function rescue(value,buddy=0) { value.bonuses.push({id:100+value.rescued,kind:'buddy',buddy,x:0,y:19,ttl:18000});value.collectBonuses([{x:0,y:19}]); }
function clear(value) {
  value.board[19].fill('T');value.board[19][9]=null;
  value.active={type:'DOT',matrix:[[1]],x:9,y:0,rotation:0};value.hardDrop();
}

test('bird mission tracks actual hits, pays once, and rewards are fixed during Overdrive',()=>{
  const value=game('rush');value.level=2;value.overdrive=8000;
  for(let id=1;id<=3;id++){value.birds=[{id,x:2.5,y:5.5,direction:1,speed:2}];value.hitBird(id);}
  const mission=value.missions.find(m=>m.id==='birds');
  assert.equal(mission.progress,3);assert.equal(mission.completed,true);
  assert.equal(value.score,3*300*2*2+750);assert.equal(value.missionPoints,750);
  value.checkMissions();value.checkMissions();assert.equal(value.events.filter(e=>e.type==='mission').length,1);
  value.birds=[{id:4,x:2.5,y:5.5,direction:1,speed:2}];value.hitBird(4);assert.equal(value.missionPoints,750);
});

test('buddy missions reward two rescues immediately without waiting for another lock',()=>{
  const value=game();rescue(value,0);assert.equal(value.missions.find(m=>m.id==='buddies').progress,1);
  rescue(value,1);assert.equal(value.score,2000);assert.equal(value.missionPoints,1000);
  assert.equal(value.missions.find(m=>m.id==='buddies').completed,true);
  rescue(value,2);assert.equal(value.missionPoints,1000);
});

test('a combo of three means three consecutive clearing pieces, not three total lines',()=>{
  const value=game();assert.equal(value.missions.find(m=>m.id==='combo').progress,0);
  clear(value);clear(value);assert.equal(value.missions.find(m=>m.id==='combo').progress,2);
  value.active={type:'DOT',matrix:[[1]],x:0,y:0,rotation:0};value.hardDrop();
  clear(value);clear(value);assert.equal(value.missions.find(m=>m.id==='combo').completed,false);
  clear(value);assert.equal(value.missions.find(m=>m.id==='combo').completed,true);
  assert.equal(value.missionPoints,1500);
});

test('missions survive pause, reset per game, and snapshots cannot mutate live progress',()=>{
  const value=game();rescue(value);const before=value.snapshot();value.pause();value.tick(5000);
  assert.deepEqual(value.snapshot(),{...before,status:'paused'});
  const snapshot=value.snapshot();snapshot.missions[0].completed=true;assert.equal(value.missions[0].completed,false);
  value.reset();assert.ok(value.missions.every(m=>m.progress===0&&!m.completed));assert.equal(value.missionPoints,0);
});

test('Sprint missions use classic actions and final clear rewards count before game ends',()=>{
  const value=game('sprint');assert.deepEqual(value.missions.map(m=>m.id),['lines','pieces','combo']);
  value.lines=39;clear(value);
  assert.equal(value.state,'over');assert.equal(value.missions.find(m=>m.id==='lines').completed,true);
  assert.equal(value.missionPoints,750);assert.ok(value.events.findIndex(e=>e.type==='mission')<value.events.findIndex(e=>e.type==='finish'));
  assert.notEqual(createMissions('rush')[0],createMissions('rush')[0]);
});

test('album finds each friend and equips rewards at 3, 5 and 10 rescues',()=>{
  const album=new BuddyAlbum(BUDDIES);assert.equal(album.found,0);assert.equal(album.next(0).remaining,1);
  const first=album.rescue(0);assert.equal(first.first,true);assert.equal(album.found,1);assert.deepEqual(first.unlocks,[]);
  assert.equal(album.next(0).remaining,2);
  const unlocks=[];
  for(let count=2;count<=10;count++){const result=album.rescue(0);assert.equal(result.first,false);unlocks.push(...result.unlocks);}
  assert.deepEqual(unlocks.map(s=>s.goal),[3,5,10]);
  assert.deepEqual(album.entry(0),{rescues:10,color:'aurora',accessory:'crown',celebration:'hearts'});
  assert.equal(album.next(0),null);assert.equal(album.rescues,10);
  assert.deepEqual(album.rescue(0).unlocks,[]);
  album.rescue(1);assert.equal(album.found,2);assert.equal(album.entry(1).color,'original');
});

test('album rejects locked styles and preserves selected looks across reloads',()=>{
  const album=new BuddyAlbum(BUDDIES);album.rescue(0);
  assert.equal(album.equip(0,'accessory','crown'),false);assert.equal(album.equip(0,'color','unknown'),false);
  assert.equal(album.equip(100,'color','original'),false);
  for(let i=0;i<9;i++)album.rescue(0);
  assert.equal(album.equip(0,'color','original'),true);assert.equal(album.equip(0,'accessory','none'),true);
  const saved=album.snapshot(),restored=new BuddyAlbum(BUDDIES,JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(restored.snapshot(),saved);assert.equal(restored.entry(0).color,'original');
  saved.buddies.Mimi.rescues=0;assert.equal(album.entry(0).rescues,10);
});

test('album validates malformed saved progress and counts friends by stable name',()=>{
  const album=new BuddyAlbum(BUDDIES,{buddies:{Mimi:{rescues:-3,color:'aurora'},Lumi:{rescues:5,color:'aurora',accessory:'crown',celebration:'hearts'},Pip:{rescues:'10'}}});
  assert.equal(album.entry(0).rescues,0);assert.equal(album.entry(0).color,'original');assert.equal(album.entry(2).rescues,0);
  assert.equal(album.entry(1).accessory,'crown');assert.equal(album.entry(1).celebration,'stars');
  assert.equal(album.found,1);assert.equal(album.rescue(-1),null);
  const reordered=new BuddyAlbum([...BUDDIES].reverse(),album.snapshot());assert.equal(reordered.entries.Lumi.rescues,5);
  for(const saved of [null,false,42,'bad',[],{}])assert.doesNotThrow(()=>new BuddyAlbum(BUDDIES,saved));
});

test('record rival warns once near the target and celebrates only a strictly higher score',()=>{
  const rival=new RecordRival('rush',10000);
  assert.equal(rival.update({score:9400}),null);assert.equal(rival.update({score:9500}),'record-near');
  assert.equal(rival.update({score:9700}),null);assert.equal(rival.update({score:10000}),null);
  assert.equal(rival.update({score:10001}),'record-beaten');assert.equal(rival.update({score:12000}),null);
  assert.equal(rival.target,10000);assert.equal(rival.beaten,true);
});

test('record rival handles score jumps, small records and games without a previous record',()=>{
  assert.equal(new RecordRival('zen',1000).update({score:2000}),'record-beaten');
  const small=new RecordRival('zen',100);assert.equal(small.update({score:1}),null);assert.equal(small.update({score:90}),'record-near');
  for(const target of [undefined,null,NaN,Infinity,-1,0,'1000'])assert.equal(new RecordRival('rush',target).update({score:5000}),null);
});

test('Sprint compares completed winning times, never partial games or losses',()=>{
  const rival=new RecordRival('sprint',60000);
  assert.equal(rival.update({elapsed:1000,lines:1}),null);
  assert.equal(rival.update({elapsed:51000,lines:33}),'record-near');
  assert.equal(rival.update({elapsed:55000,lines:38,finished:true,won:false}),null);
  assert.equal(rival.update({elapsed:59000,lines:40,finished:true,won:true}),'record-beaten');
  assert.equal(new RecordRival('sprint',60000).update({elapsed:60000,lines:40,finished:true,won:true}),null);
});
