import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {detectLanguage,setLanguage,getLanguage,getLocale,t,english,setText,setLabel,translatePage} from '../dist/i18n.mjs';
import {Game,BUDDY_POWERS,POWERS,MODES} from '../dist/engine.mjs';

test('browser language, regional variants, fallback and saved preference',()=>{
  for(const locale of ['pt','pt-BR','pt-PT','PT-br'])assert.equal(detectLanguage([locale]),'pt');
  for(const locales of [['en-US'],['en-GB','pt-BR'],['fr-FR'],[]])assert.equal(detectLanguage(locales),'en');
  assert.equal(detectLanguage(['en-US'],'pt'),'pt');
  assert.equal(detectLanguage(['pt-BR'],'en'),'en');
  assert.equal(detectLanguage(['pt-BR'],'broken'),'pt');
});

test('localized events, nested names, powers, points and records',()=>{
  setLanguage('en');assert.equal(getLocale(),'en-US');
  const cases=[
    ['Estrela! 1,200 pontos','Star! 1,200 points'],
    ['Mimi resgatado! 500 pontos','Mimi rescued! 500 points'],
    ['Próximas peças: Dupla, Raio, Prisma, I','Next pieces: Duo, Lightning, Prism, I'],
    ['Peça Ferradura na reserva','Held piece: Horseshoe'],
    ['Prisma! 9 blocos removidos. 225 pontos.','Prism! 9 blocks removed. 225 points.'],
    ['All clear! Tabuleiro zerado! +5000 pontos.','All clear! Board cleared! +5000 points.'],
    ['Nox: De cabeça para baixo por 10 segundos.','Nox: Upside down for 10 seconds.'],
    ['Nox · De cabeça para baixo · 10s  |  Polvi · Gravidade nos blocos · 8s','Nox · Upside down · 10s  |  Polvi · Block gravity · 8s'],
    ['Nuvi · Chuva de bichinhos','Nuvi · Buddy rain'],['Lino!','Lino!'],['Pip cai e espera o resgate!','Pip lands and waits for a rescue!'],['Cheguei! Me pega depois!','I’m here! Grab me later!'],
    ['2 linhas. DOUBLE! 300 pontos.','2 lines. DOUBLE! 300 points.'],
    ['O tempo acabou. Bela partida! 900 pontos, 6 linhas.','Time’s up. Great game! 900 points, 6 lines.'],
    ['12 BLOCOS · 2 LINHAS','12 BLOCKS · 2 LINES'],
    ['10 MIN · SEU MELHOR SCORE.','10 MIN · YOUR BEST SCORE.'],
    ['Seu recorde · Rush 10 min','Your best · Rush 10 min'],
    ['Cor-alvo: rosa-claro. 5 blocos vão sumir!','Target color: light pink. 5 blocks will disappear!'],
    ['Vai limpar 3 colunas inteiras. Gire para mudar o alcance!','Clears 3 full columns. Rotate to change the range!'],
    ['ϟ Raio','ϟ Lightning'],['RAIO!','LIGHTNING!']
  ];
  for(const [source,expected] of cases)assert.equal(t(source),expected,source);
  for(const power of [...Object.values(BUDDY_POWERS),...Object.values(POWERS)])assert.ok(t(power.label));
  for(const mode of Object.values(MODES))assert.notEqual(t(mode.label),mode.label);
  setLanguage('pt');assert.equal(getLocale(),'pt-BR');
  for(const [source] of cases)assert.equal(t(source),source);
});

test('all static Portuguese text has a translation',()=>{
  setLanguage('en');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  const texts=[...html.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim());
  const attrs=[...html.matchAll(/(?:aria-label|title|content)="([^"]+)"/g)].map(m=>m[1]);
  const portuguese=/[áàãâéêíóôõúç]|\b(?:Jogar|Linhas|Mover|Girar|Descer|Soltar|Reservar|Tempo|Guarde|Pense|Pronto|Recomeçar)\b/;
  for(const source of [...texts,...attrs].filter(s=>portuguese.test(s)&&s!=='Português'))assert.ok(Object.hasOwn(english,source),source);
});

test('live language switch preserves game, stored records and dynamic sources',()=>{
  const values=new Map([['stack-rush-records','{"rush":12000}']]);
  globalThis.localStorage={setItem:(k,v)=>values.set(k,v)};
  const game=new Game();game.start();game.score=12000;game.pause();
  const before=JSON.stringify(game.snapshot());
  const element={isConnected:true,textContent:'',setAttribute(k,v){this[k]=v;}};
  setLanguage('pt');setText(element,'Mimi está na torcida');setLabel(element,'Pausar partida');
  const document={documentElement:{lang:''}};
  setLanguage('en');translatePage(document);
  assert.equal(element.textContent,'Mimi is cheering you on');assert.equal(element['aria-label'],'Pause game');assert.equal(document.documentElement.lang,'en-US');
  setLanguage('pt');translatePage(document);assert.equal(element.textContent,'Mimi está na torcida');
  assert.equal(JSON.stringify(game.snapshot()),before);assert.equal(values.get('stack-rush-records'),'{"rush":12000}');assert.equal(values.get('stack-rush-language'),'pt');
  globalThis.localStorage={setItem(){throw new Error('blocked');}};
  assert.doesNotThrow(()=>setLanguage('en'));assert.equal(getLanguage(),'en');
  setLanguage('invalid');assert.equal(getLanguage(),'en');
  delete globalThis.localStorage;
});
