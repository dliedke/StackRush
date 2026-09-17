import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,BUDDY_POWERS,BUDDY_TYPES,COLS,ROWS} from '../dist/engine.mjs';

const buddyIndex = key => Number(Object.keys(BUDDY_POWERS).find(i => BUDDY_POWERS[i].key === key));
function rescue(game, key) {
  game.bonuses.push({x:0,y:ROWS-1,id:999,kind:'buddy',buddy:buddyIndex(key),ttl:18000});
  game.collectBonuses([{x:0,y:ROWS-1}]);
}

test('custom board sizes are clamped and used for spawning, clears and snapshots',()=>{
  const small=new Game('zen',Math.random,4,4);
  assert.equal(small.board.length,4);assert.ok(small.board.every(row=>row.length===4));
  assert.deepEqual([new Game('zen',Math.random,1,500).cols,new Game('zen',Math.random,1,500).rows],[4,100]);
  const game=new Game('zen',Math.random,6,8);game.start();
  for(let x=0;x<5;x++)game.board[7][x]='L';
  game.active={type:'DOT',matrix:[[1]],x:5,y:0,rotation:0};game.hardDrop();
  assert.equal(game.lines,1);assert.equal(game.board.length,8);
  assert.deepEqual([game.snapshot().cols,game.snapshot().rows],[6,8]);
  game.reset('rush');assert.deepEqual([game.cols,game.rows],[6,8]);
  game.reset('rush',COLS,ROWS);assert.deepEqual([game.cols,game.rows],[COLS,ROWS]);
});

test('Lino queues 4 I pieces and 2 O pieces',()=>{
  const game=new Game('zen');game.start();rescue(game,'onlyI');
  const next=game.queue.slice(0,6);
  assert.deepEqual([...next].sort(),['I','I','I','I','O','O']);
  assert.equal(game.buddyEffects.onlyI,undefined);
  assert.deepEqual(game.snapshot().nextPieces,game.queue.slice(0,5));
});

test('Polvi drops loose blocks into holes and clears completed rows',()=>{
  const game=new Game('zen');game.start();rescue(game,'gravity');
  assert.ok(game.buddyEffects.gravity>0);
  for(let x=0;x<COLS;x++)if(x!==4)game.board[ROWS-1][x]='L';
  game.board[ROWS-5][4]='T';
  game.board[ROWS-3][7]='S';
  game.active={type:'DOT',matrix:[[1]],x:0,y:0,rotation:0};game.hardDrop();
  assert.ok(game.lines>=1);
  assert.equal(game.board[ROWS-1][0],'DOT');assert.equal(game.board[ROWS-1][7],'S');
  for(let x=0;x<COLS;x++){let seen=false;for(let y=0;y<ROWS;y++){if(game.board[y][x])seen=true;else assert.ok(!seen,`hole in column ${x}`);}}
});

test('Nuvi turns the next 5 pieces into buddies that stay on the board',()=>{
  const game=new Game('zen');game.start();game.bonuses=[];rescue(game,'rain');
  const drops=game.queue.slice(0,5);
  assert.ok(drops.every(type=>BUDDY_TYPES.includes(type)));
  assert.ok(drops.every(type=>!BUDDY_POWERS[BUDDY_TYPES.indexOf(type)]?.drops));
  game.spawn();for(let i=0;i<5;i++)game.hardDrop();
  const dropped=game.bonuses.filter(b=>b.dropped);
  assert.equal(dropped.length,5);
  assert.ok(game.board.every(row=>row.every(cell=>!cell)));
  assert.equal(new Set(dropped.map(b=>`${b.x},${b.y}`)).size,5);
  game.active={type:'DOT',matrix:[[1]],x:9,y:0,rotation:0};game.tick(60000);
  assert.equal(game.bonuses.filter(b=>b.dropped).length,5);
  const target=dropped[0];
  game.active={type:'DOT',matrix:[[1]],x:target.x,y:0,rotation:0};game.hardDrop();
  assert.equal(game.bonuses.filter(b=>b.dropped).length,4);
  assert.ok(game.rescued>=1);
});
