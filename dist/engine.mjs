export const COLS = 10;
export const ROWS = 20;
export const MIN_BOARD = 4, MAX_BOARD = 100;
const boardSize = (value, fallback) => Number.isFinite(value) ? Math.max(MIN_BOARD, Math.min(MAX_BOARD, Math.round(value))) : fallback;
export const COLORS = { I: '#38d6ee', O: '#f6d454', T: '#ae79f7', S: '#a5db5e', Z: '#f17a9b', J: '#6e92f3', L: '#f5a35b', DOT: '#fff5ad', DUO: '#75f4d3', CORNER: '#ff95d5', BOMB: '#ff9b68', U: '#ffbc72', VOLT: '#ffe27c', PRISM: '#ff8bd1', DIAG: '#85e8fa' };
export const COLOR_NAMES = { I:'ciano', O:'amarelo', T:'roxo', S:'verde', Z:'rosa', J:'azul', L:'laranja', DOT:'creme', DUO:'menta', CORNER:'rosa-claro', U:'pêssego', DIAG:'azul-gelo' };
export const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]],
  DOT: [[1]], DUO: [[1,1],[0,0]], CORNER: [[1,0],[1,1]],
  BOMB: [[1]], U: [[1,0,1],[1,1,1],[0,0,0]],
  VOLT: [[0,1,0],[0,1,0],[0,1,0]], PRISM: [[1,1],[1,1]], DIAG: [[1,0,0],[0,1,0],[0,0,1]]
};
export const BUDDIES = ['Mimi', 'Lumi', 'Pip', 'Nox', 'Turbo', 'Lino', 'Broca', 'Sexto', 'Polvi', 'Nuvi'];
export const BUDDY_TYPES = BUDDIES.map((_,i)=>`BUDDY${i}`);
BUDDY_TYPES.forEach((type,i)=>{SHAPES[type]=[[1]];COLORS[type]='#f49ed8';});
export const CLASSIC_TYPES = ['I','O','T','S','Z','J','L'];
export const EXTRA_TYPES = ['DOT','DUO','CORNER','U'];
export const POWER_TYPES = ['VOLT','PRISM','DIAG'];
export const SPECIAL_TYPES = [...EXTRA_TYPES,'BOMB',...POWER_TYPES];
export const PIECE_NAMES = { I:'I', O:'O', T:'T', S:'S', Z:'Z', J:'J', L:'L', DOT:'Mini', DUO:'Dupla', CORNER:'Cantinho', U:'Ferradura', BOMB:'Bomba', VOLT:'Raio', PRISM:'Prisma', DIAG:'Diagonal', ...Object.fromEntries(BUDDY_TYPES.map((type,i)=>[type,BUDDIES[i]])) };
export const POWERS = {
  VOLT: { label:'RAIO', symbol:'ϟ', description:'Limpa as colunas tocadas pela peça. Gire para atingir até 3!' },
  PRISM: { label:'PRISMA', symbol:'◇', description:'Apaga todos os blocos da cor mais presente.' },
  DIAG: { label:'DIAGONAL', symbol:'╲', description:'Limpa uma linha diagonal atravessando o tabuleiro. Gire para trocar a inclinação!' }
};
export const BOMB_RADIUS = 4;
const HALF_TURN_KICKS = [[0,0],[0,-1],[-1,0],[1,0],[0,1],[-2,0],[2,0],[-1,-1],[1,-1],[0,-2]];
export const BUDDY_POWERS = {
  3: { key:'flip', label:'De cabeça para baixo', duration:10000 },
  4: { key:'speed', label:'Queda turbo', duration:10000 },
  5: { key:'onlyI', label:'4 peças I e 2 O', pieces:['I','I','O','I','I','O'] },
  6: { key:'drill', label:'Perfuração até o fundo', duration:10000 },
  7: { key:'six', label:'Linhas com 6 blocos', duration:15000 },
  8: { key:'gravity', label:'Gravidade nos blocos', duration:10000 },
  9: { key:'rain', label:'Chuva de bichinhos', drops:5 }
};
const SPECIAL_KICKS = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[0,-2]];
export const MODES = {
  rush1: { title: 'Rush · 1 min', shortTitle: 'Rush 1 min', rushLabel: '1 MIN', label: 'UM MINUTO. TUDO OU NADA.', description: 'Peças surpresa, poderes multicoloridos, estrelas, bichinhos e um pulso especial.', duration: 60000, target: 0, rush: true },
  rush: { title: 'Rush · 2 min', shortTitle: 'Rush 2 min', rushLabel: '2 MIN', label: 'DOIS MINUTOS. TUDO OU NADA.', description: 'Peças surpresa, poderes multicoloridos, estrelas, bichinhos e um pulso especial.', duration: 120000, target: 0, rush: true },
  rush5: { title: 'Rush · 5 min', shortTitle: 'Rush 5 min', rushLabel: '5 MIN', label: 'CINCO MINUTOS. SEGURE O FLOW.', description: 'Peças surpresa, poderes multicoloridos, estrelas, bichinhos e um pulso especial.', duration: 300000, target: 0, rush: true },
  rush10: { title: 'Rush · 10 min', shortTitle: 'Rush 10 min', rushLabel: '10 MIN', label: 'DEZ MINUTOS. RESISTA AO RITMO.', description: 'Peças surpresa, poderes multicoloridos, estrelas, bichinhos e um pulso especial.', duration: 600000, target: 0, rush: true },
  sprint: { title: 'Sprint 40', shortTitle: 'Sprint', label: '40 LINHAS. O SEU MELHOR TEMPO.', description: 'Limpe 40 linhas o mais rápido que conseguir.', duration: 0, target: 40, rush: false },
  zen: { title: 'Zen', shortTitle: 'Zen', label: 'SEM PRESSA. SÓ O FLOW.', description: 'Poderes multicoloridos e bônus no seu ritmo.', duration: 0, target: 0, rush: false }
};
const JLSTZ_KICKS = {
  '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]], '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]], '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]], '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]], '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]]
};
const I_KICKS = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]], '1>0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]], '2>1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]], '3>2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]], '0>3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
};
export function cells(piece) {
  const result = [];
  piece.matrix.forEach((row, y) => row.forEach((v, x) => { if (v) result.push({ x: piece.x + x, y: piece.y + y }); }));
  return result;
}
function rotateMatrix(matrix, dir) {
  const n = matrix.length;
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => dir === 1 ? matrix[n - 1 - x][y] : matrix[x][n - 1 - y]));
}
export class Game {
  constructor(mode = 'rush', random = Math.random, cols = COLS, rows = ROWS) { this.random = random; this.reset(mode, cols, rows); }
  reset(mode = this.mode, cols = this.cols, rows = this.rows) {
    if (!Object.hasOwn(MODES, mode)) throw new Error('Modo inválido.');
    this.cols = boardSize(cols, COLS); this.rows = boardSize(rows, ROWS);
    this.mode = mode; this.state = 'ready'; this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.queue = []; this.specialBag = []; this.bonuses = []; this.bonusSerial = 0; this.bonusSpawns = 0; this.nextBonusAt = 4; this.stars = 0; this.rescued = 0; this.bombs = 0; this.blastBlocks = 0; this.hold = null; this.canHold = true; this.score = 0; this.lines = 0; this.level = 1;
    this.elapsed = 0; this.combo = -1; this.maxCombo = 0; this.pieces = 0; this.energy = 0; this.overdrive = 0;
    this.powerBag = []; this.lastPower = null; this.powerUses = 0; this.allClears = 0;
    this.buddyEffects = {}; this.buddyBag = [];
    this.gravity = 0; this.lockTime = 0; this.lockResets = 0; this.events = []; this.backToBack = false; this.lastRotate = false;
    this.fillQueue(); this.spawn(); this.events = [];
  }
  fillQueue() {
    while (this.queue.length < 7) {
      const bag = [...CLASSIC_TYPES];
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (this.mode !== 'sprint') {
        const takeSpecial = () => {
          if (!this.specialBag.length) {
            this.specialBag = [...EXTRA_TYPES];
            for (let i = this.specialBag.length - 1; i > 0; i--) {
              const j = Math.floor(this.random() * (i + 1));
              [this.specialBag[i],this.specialBag[j]] = [this.specialBag[j],this.specialBag[i]];
            }
          }
          return this.specialBag.pop();
        };
        bag.splice(2 + Math.floor(this.random() * 2), 0, takeSpecial());
        bag.splice(5 + Math.floor(this.random() * 3), 0, 'BOMB');
        if (!this.powerBag.length) {
          this.powerBag = [...POWER_TYPES];
          for (let i=this.powerBag.length-1;i>0;i--) { const j=Math.floor(this.random()*(i+1)); [this.powerBag[i],this.powerBag[j]]=[this.powerBag[j],this.powerBag[i]]; }
          if (this.powerBag.at(-1) === this.lastPower) [this.powerBag[0],this.powerBag[2]] = [this.powerBag[2],this.powerBag[0]];
        }
        this.lastPower = this.powerBag.pop();
        bag.splice(3 + Math.floor(this.random() * 3), 0, this.lastPower);
      }
      this.queue.push(...bag);
    }
  }
  spawn(type) {
    type ||= this.queue.shift(); this.fillQueue();
    const matrix = SHAPES[type].map(row => [...row]);
    this.active = { type, matrix, x: Math.floor((this.cols - matrix.length) / 2), y: SPECIAL_TYPES.includes(type) || BUDDY_TYPES.includes(type) || type === 'O' ? 0 : -1, rotation: 0 };
    this.gravity = 0; this.lockTime = 0; this.lockResets = 0; this.lastRotate = false;
    if (!this.valid(this.active)) this.finish(false, 'O tabuleiro encheu.');
  }
  valid(piece) { return cells(piece).every(({x,y}) => x >= 0 && x < this.cols && y < this.rows && (y < 0 || !this.board[y][x])); }
  start() { if (this.state !== 'ready') return false; this.state = 'playing'; this.events.push({ type: 'start' }); if (this.mode !== 'sprint') this.spawnBonus(true); return true; }
  pause() { if (this.state === 'playing') { this.state = 'paused'; return true; } return false; }
  resume() { if (this.state === 'paused') { this.state = 'playing'; return true; } return false; }
  grounded() { return !this.valid({ ...this.active, y: this.active.y + 1 }); }
  resetLock(wasGrounded) { if (wasGrounded && this.lockResets < 15) { this.lockTime = 0; this.lockResets++; } }
  move(dx, dy = 0) {
    if (this.state !== 'playing') return false;
    const next = { ...this.active, x: this.active.x + dx, y: this.active.y + dy };
    if (!this.valid(next)) return false;
    const onGround = this.grounded(); this.active = next; this.lastRotate = false;
    if (dx) this.resetLock(onGround);
    return true;
  }
  rotate(dir = 1) {
    if (this.state !== 'playing' || ![1,-1,2].includes(dir)) return false;
    const p = this.active;
    if (p.type === 'O' || p.type === 'PRISM' || p.matrix.length === 1) return false;
    const nextRotation = (p.rotation + dir + 4) % 4;
    const matrix = dir === 2 ? rotateMatrix(rotateMatrix(p.matrix,1),1) : rotateMatrix(p.matrix, dir);
    const kicks = dir === 2 ? HALF_TURN_KICKS : SPECIAL_TYPES.includes(p.type) ? SPECIAL_KICKS : (p.type === 'I' ? I_KICKS : JLSTZ_KICKS)[`${p.rotation}>${nextRotation}`];
    for (const [dx,dy] of kicks) {
      const candidate = { ...p, matrix, rotation: nextRotation, x: p.x + dx, y: p.y + dy };
      if (this.valid(candidate)) { const onGround = this.grounded(); this.active = candidate; this.lastRotate = true; this.resetLock(onGround); this.events.push({ type: 'rotate', angle: dir === 2 ? 180 : dir * 90 }); return true; }
    }
    return false;
  }
  ghost() { const p = { ...this.active }; while (this.valid({ ...p, y: p.y + 1 })) p.y++; return p; }
  hardDrop() {
    if (this.state !== 'playing') return;
    const from = this.active.y; const ghost = this.ghost();
    if (ghost.y !== from) this.lastRotate = false;
    this.active = ghost; this.score += (ghost.y - from) * 2;
    this.events.push({ type: 'drop', cells: cells(this.active), color: COLORS[this.active.type], distance: ghost.y - from }); this.lock();
  }
  swap() {
    if (this.state !== 'playing' || !this.canHold) return false;
    const current = this.active.type; const oldHold = this.hold; this.hold = current;
    this.spawn(oldHold || undefined); this.canHold = false; this.events.push({ type: 'hold' }); return true;
  }
  lock() {
    const occupied = cells(this.active);
    if (occupied.some(c => c.y < 0)) { this.finish(false, 'O tabuleiro encheu.'); return; }
    let destroyed = 0;
    const buddyDrop = BUDDY_TYPES.includes(this.active.type);
    if (!buddyDrop) this.collectBonuses(occupied);
      if (!buddyDrop && this.buddyEffects.drill > 0) {
        const area = [];
        for (const x of new Set(occupied.map(c=>c.x))) {
          const top = Math.min(...occupied.filter(c=>c.x===x).map(c=>c.y));
          for(let y=top;y<this.rows;y++)area.push({x,y});
        }
        this.collectBonuses(area);
        const removed = area.filter(({x,y})=>this.board[y][x]).map(c=>({...c,type:this.board[c.y][c.x]}));
        for(const {x,y} of removed)this.board[y][x]=null;
        destroyed=removed.length;
        const score=destroyed*25*this.level*(this.overdrive>0?2:1);this.score+=score;
        this.events.push({type:'drill',destroyed:removed,score});
      }
    if (buddyDrop) this.dropBuddy(occupied[0]);
    else if (this.active.type === 'BOMB') destroyed += this.detonateBomb(occupied[0]);
    else if (POWER_TYPES.includes(this.active.type)) destroyed += this.activatePower(occupied);
    else occupied.forEach(({x,y}) => { this.board[y][x] = this.active.type; });
    let tSpin = false;
    if (this.active.type === 'T' && this.lastRotate) {
      const {x,y} = this.active;
      const filled = [[x,y],[x+2,y],[x,y+2],[x+2,y+2]].filter(([cx,cy]) => cx < 0 || cx >= this.cols || cy >= this.rows || (cy >= 0 && this.board[cy][cx])).length;
      tSpin = filled >= 3;
    }
    this.pieces++; this.canHold = true;
    let cleared = this.clearRows(tSpin);
    // Polvi: loose blocks fall into the holes, and every new full row keeps the cascade going.
    if (this.buddyEffects.gravity > 0) while (this.applyGravity()) { const more = this.clearRows(false); if (!more) break; cleared += more; }
    if (!cleared) this.combo = -1;
    this.checkAllClear(cleared > 0 || destroyed > 0);
    if (cleared && this.mode === 'sprint' && this.lines >= 40) { this.finish(true, '40 linhas. Missão cumprida!'); return; }
    if (MODES[this.mode].rush && this.overdrive <= 0) this.energy = Math.min(100, this.energy + 4);
    this.spawn();
    if (this.mode !== 'sprint' && this.state === 'playing' && this.pieces >= this.nextBonusAt) {
      this.spawnBonus(); this.nextBonusAt = this.pieces + 4 + Math.floor(this.random() * 3);
    }
  }
  clearRows(tSpin) {
    const cleared = [];
    this.board.forEach((row, y) => { if (row.filter(Boolean).length >= (this.buddyEffects.six > 0 ? Math.min(6, this.cols) : this.cols)) cleared.push(y); });
    if (cleared.length) {
      const n = cleared.length; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      const difficult = n >= 4 || tSpin;
      const bonus = difficult && this.backToBack ? 1.5 : 1;
      const base = tSpin ? [400,800,1200,1600][Math.min(n,3)] : n > 4 ? 800 + (n - 4) * 400 : [0,100,300,500,800][n];
      const gained = Math.round((base * bonus + Math.max(this.combo,0) * 75) * this.level * (this.overdrive > 0 ? 2 : 1));
      this.score += gained; this.lines += n; this.level = this.mode === 'zen' ? 1 : 1 + Math.floor(this.lines / 8);
      this.energy = MODES[this.mode].rush ? Math.min(100, this.energy + n * 18 + this.combo * 5) : 0;
      this.backToBack = difficult;
      this.events.push({ type: 'clear', rows: cleared, count: n, score: gained, combo: this.combo, tSpin, color: COLORS[this.active.type] });
      this.shiftBonuses(cleared);
      this.board = this.board.filter((_, y) => !cleared.includes(y));
      while (this.board.length < this.rows) this.board.unshift(Array(this.cols).fill(null));
    }
    return cleared.length;
  }
  applyGravity() {
    const moves = [];
    for (let x = 0; x < this.cols; x++) for (let y = this.rows - 1, to = this.rows - 1; y >= 0; y--) if (this.board[y][x]) { if (y !== to) moves.push({ x, from: y, to, type: this.board[y][x] }); to--; }
    if (!moves.length) return false;
    this.settleBoard(); this.events.push({ type: 'gravity', moves }); return true;
  }
  dropBuddy({x,y}) {
    while (y > 0 && this.bonuses.some(b => b.x === x && b.y === y)) y--;
    const bonus = { x, y, id: ++this.bonusSerial, kind: 'buddy', buddy: BUDDY_TYPES.indexOf(this.active.type), ttl: Infinity, dropped: true };
    this.bonuses.push(bonus); this.events.push({ type: 'bonus-spawn', bonus: { ...bonus } });
  }
  checkAllClear(didClear) {
    // Falling pieces, their ghosts and collectible bonuses are not locked blocks.
    if (didClear && this.board.every(row => row.every(cell => !cell))) {
      const score = 5000 * this.level * (this.overdrive > 0 ? 2 : 1);
      this.score += score; this.allClears++;
      this.events.push({ type: 'all-clear', score, level: this.level });
    }
  }
  powerPreview(piece = this.active) {
    if (piece.type === 'VOLT') {
      const columns = [...new Set(cells(piece).map(cell => cell.x))].filter(x => x >= 0 && x < this.cols);
      return { columns, target: null, cells: columns.flatMap(x => Array.from({length:this.rows},(_,y)=>({x,y}))) };
    }
    if (piece.type === 'PRISM') {
      const counts = new Map();
      for (const row of this.board) for (const type of row) if(type) counts.set(type,(counts.get(type)||0)+1);
      const target = [...counts].sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
      const targets = [];
      if(target)this.board.forEach((row,y)=>row.forEach((type,x)=>{if(type===target)targets.push({x,y});}));
      return { columns: [], target, cells: targets };
    }
    if (piece.type === 'DIAG') {
      const direction = piece.rotation % 2 === 0 ? 1 : -1;
      const originX = piece.x + 1, originY = piece.y + 1;
      const line = [];
      for (let y = 0; y < this.rows; y++) {
        const x = Math.round(originX + (y - originY) * direction);
        if (x >= 0 && x < this.cols) line.push({ x, y });
      }
      return { columns: [], target: null, cells: line };
    }
    return { columns: [], target: null, cells: [] };
  }
  activatePower(occupied) {
    const power = this.active.type, preview = this.powerPreview(), destroyed = [];
    this.collectBonuses([...occupied,...preview.cells]);
    for(const {x,y} of preview.cells) {
      if(this.board[y][x]) { destroyed.push({x,y,type:this.board[y][x]}); this.board[y][x]=null; }
    }
    this.settleBoard();
    const gained = destroyed.length * 25 * this.level * (this.overdrive > 0 ? 2 : 1);
    this.score += gained; this.powerUses++;
    if(MODES[this.mode].rush)this.energy=Math.min(100,this.energy+destroyed.length);
    const origin = { x:occupied.reduce((sum,c)=>sum+c.x,0)/occupied.length, y:occupied.reduce((sum,c)=>sum+c.y,0)/occupied.length };
    this.events.push({ type:'power', power, columns:preview.columns, target:preview.target, line:preview.cells, origin, destroyed, score:gained });
    return destroyed.length;
  }
  blastArea(piece = this.active) {
    const x = piece.x, y = Math.min(this.rows - 1, piece.y + 2), radius = BOMB_RADIUS;
    const area = [];
    for (let cy = Math.max(0,y-radius); cy <= Math.min(this.rows-1,y+radius); cy++) {
      for (let cx = Math.max(0,x-radius); cx <= Math.min(this.cols-1,x+radius); cx++) area.push({x:cx,y:cy});
    }
    return { x, y, radius, cells:area };
  }
  detonateBomb(position) {
    const blast = this.blastArea(position);
    this.collectBonuses(blast.cells);
    const destroyed = [];
    for (const {x,y} of blast.cells) {
      if (this.board[y][x]) { destroyed.push({x,y,type:this.board[y][x]}); this.board[y][x] = null; }
    }
    this.settleBoard();
    const gained = destroyed.length * 30 * this.level * (this.overdrive > 0 ? 2 : 1);
    this.score += gained; this.bombs++; this.blastBlocks += destroyed.length;
    if(MODES[this.mode].rush)this.energy = Math.min(100,this.energy+destroyed.length);
    this.events.push({type:'bomb',x:blast.x,y:blast.y,radius:blast.radius,destroyed,score:gained});
    return destroyed.length;
  }
  settleBoard() {
    for (let x=0;x<this.cols;x++) {
      const stack = this.board.map(row=>row[x]).filter(Boolean);
      for (let y=0;y<this.rows;y++) this.board[y][x] = y < this.rows-stack.length ? null : stack[y-(this.rows-stack.length)];
    }
    const reserved = new Set();
    this.bonuses = this.bonuses.flatMap(bonus => {
      const top = this.board.findIndex(row=>row[bonus.x]);
      let y = top === -1 ? this.rows-1 : top-1;
      while(y>=0 && reserved.has(`${bonus.x},${y}`))y--;
      if(y<0)return [];
      reserved.add(`${bonus.x},${y}`);return [{...bonus,y}];
    });
  }
  spawnBonus(first = false) {
    if (this.mode === 'sprint' || this.state !== 'playing' || this.bonuses.filter(b => !b.dropped).length >= 2) return false;
    let candidates = [];
    if (first) candidates = cells(this.ghost()).filter(p => p.y >= Math.round(this.rows * .3) && !this.board[p.y][p.x]);
    if (!candidates.length) {
      for (let x = 0; x < this.cols; x++) {
        const top = this.board.findIndex(row => row[x]);
        const y = top === -1 ? this.rows - 1 : top - 1;
        if (y >= Math.round(this.rows / 4) && !this.bonuses.some(b => b.x === x && b.y === y)) candidates.push({x,y});
      }
    }
    if (!candidates.length) return false;
    const cell = candidates[Math.floor(this.random() * candidates.length)];
    const serial = ++this.bonusSerial;
    const kind = ++this.bonusSpawns % 2 === 0 ? 'buddy' : 'star';
    if(kind==='buddy'&&!this.buddyBag.length){
      this.buddyBag=BUDDIES.map((_,i)=>i);
      for(let i=this.buddyBag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.buddyBag[i],this.buddyBag[j]]=[this.buddyBag[j],this.buddyBag[i]];}
    }
    const bonus = { ...cell, id: serial, kind, buddy: kind==='buddy'?this.buddyBag.pop():0, ttl: 18000 };
    this.bonuses.push(bonus); this.events.push({ type: 'bonus-spawn', bonus: { ...bonus } }); return true;
  }
  collectBonuses(occupied) {
    const collected = this.bonuses.filter(b => occupied.some(c => c.x === b.x && c.y === b.y));
    if (!collected.length) return;
    this.bonuses = this.bonuses.filter(b => !collected.includes(b));
    for (const bonus of collected) {
      const gained = (bonus.kind === 'star' ? 200 : 500) * this.level * (this.overdrive > 0 ? 2 : 1);
      this.score += gained;
      if (bonus.kind === 'star') this.stars++; else this.rescued++;
      if (MODES[this.mode].rush) this.energy = Math.min(100, this.energy + (bonus.kind === 'star' ? 12 : 20));
      this.events.push({ type: 'bonus', bonus: { ...bonus }, score: gained });
      if(bonus.kind==='buddy'&&BUDDY_POWERS[bonus.buddy]){
        const power=BUDDY_POWERS[bonus.buddy];
        if(power.duration)this.buddyEffects[power.key]=power.duration;
        if(power.pieces)this.queue.unshift(...power.pieces);
        if(power.drops){
          const pool=BUDDY_TYPES.filter((_,i)=>!BUDDY_POWERS[i]?.drops);
          this.queue.unshift(...Array.from({length:power.drops},()=>pool[Math.floor(this.random()*pool.length)]));
        }
        this.events.push({type:'buddy-power',buddy:bonus.buddy,...power});
      }
    }
  }
  shiftBonuses(removedRows) {
    this.bonuses = this.bonuses.filter(b => !removedRows.includes(b.y)).map(b => ({ ...b, y: b.y + removedRows.filter(y => y > b.y).length }));
  }
  pulse() {
    if (this.state !== 'playing' || !MODES[this.mode].rush || this.energy < 100 || this.overdrive > 0) return false;
    const rows = [];
    for (let y = this.rows - 1; y >= 0 && rows.length < 3; y--) if (this.board[y].some(Boolean)) rows.push(y);
    this.shiftBonuses(rows);
    this.board = this.board.filter((_, y) => !rows.includes(y));
    while (this.board.length < this.rows) this.board.unshift(Array(this.cols).fill(null));
    this.energy = 0; this.overdrive = 8000; this.score += rows.length * 150 * this.level;
    this.lockTime = 0;
    this.events.push({ type: 'pulse', rows });
    this.checkAllClear(rows.length > 0); return true;
  }
  tick(dt, softDrop = false) {
    if (this.state !== 'playing') return;
    if (!Number.isFinite(dt) || dt < 0) return;
    for(const key of Object.keys(this.buddyEffects))this.buddyEffects[key]=Math.max(0,this.buddyEffects[key]-dt);
    this.bonuses = this.bonuses.map(b => ({...b, ttl: b.ttl - dt})).filter(b => b.ttl > 0);
    this.elapsed += dt; this.overdrive = Math.max(0, this.overdrive - dt);
    if (MODES[this.mode].duration && this.elapsed >= MODES[this.mode].duration) { this.elapsed = MODES[this.mode].duration; this.finish(true, 'O tempo acabou. Bela partida!'); return; }
    const interval = this.buddyEffects.speed > 0 ? 25 : softDrop ? 32 : this.mode === 'zen' ? 1100 : Math.max(85, 760 * Math.pow(0.79, this.level - 1));
    this.gravity += dt;
    while (this.gravity >= interval) {
      this.gravity -= interval;
      if (this.move(0, 1)) { if (softDrop) this.score++; } else { this.gravity = 0; break; }
    }
    if (this.grounded()) { this.lockTime += dt; if (this.lockTime >= 480) this.lock(); } else this.lockTime = 0;
  }
  finish(won, reason) { this.state = 'over'; this.events.push({ type: 'finish', won, reason }); }
  snapshot() { return { buddyEffects: {...this.buddyEffects}, mode: this.mode, cols: this.cols, rows: this.rows, status: this.state, score: this.score, lines: this.lines, level: this.level, elapsedMs: Math.round(this.elapsed), energy: this.energy, overdriveMs: Math.round(this.overdrive), allClears: this.allClears, powerPiecesUsed: this.powerUses, activePower: POWER_TYPES.includes(this.active.type) ? { type:this.active.type, name:PIECE_NAMES[this.active.type], ...this.powerPreview() } : null, combo: Math.max(this.combo,0), pieces: this.pieces, stars: this.stars, rescued: this.rescued, bombs: this.bombs, destroyedBlocks: this.blastBlocks, bonuses: this.bonuses.map(b => ({kind:b.kind,x:b.x,y:b.y,remainingMs:Number.isFinite(b.ttl)?Math.ceil(b.ttl):null})), nextPieces: this.queue.slice(0,5) }; }
}
