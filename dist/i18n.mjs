// Portuguese is the source language. Keep translations at the presentation layer.
export function detectLanguage(languages = [], saved = null) {
  if (saved === 'pt' || saved === 'en') return saved;
  return String(languages[0] || 'en').toLowerCase().split(/[-_]/)[0] === 'pt' ? 'pt' : 'en';
}
let saved;
try { saved = globalThis.localStorage?.getItem('stack-rush-language'); } catch {}
let language = detectLanguage(globalThis.navigator?.languages?.length ? navigator.languages : [globalThis.navigator?.language], saved);
export const getLanguage = () => language;
export const getLocale = () => language === 'pt' ? 'pt-BR' : 'en-US';
export function setLanguage(value) {
  if (!['pt', 'en'].includes(value)) return;
  language = value;
  try { globalThis.localStorage?.setItem('stack-rush-language', value); } catch {}
}

export const english = Object.fromEntries([
  ['Idioma','Language'],['Português','Português'],['English','English'],['Detectado pelo navegador. Você pode trocar aqui.','Detected from your browser. You can change it here.'],
  ['Stack Rush — Entre no flow','Stack Rush — Find your flow'],
  ['Entre no flow de Stack Rush. Um jogo de blocos com peças multicoloridas, raios, poderes especiais, bombas, bichinhos e música arcade.','Find your flow in Stack Rush. A block game with colorful pieces, lightning, special powers, bombs, buddies and arcade music.'],
  ['Stack Rush, início','Stack Rush, home'],['Navegação principal','Main navigation'],['Jogar','Play'],['Como jogar','How to play'],['Som','Sound'],['Configurações','Settings'],['Desativar som','Mute sound'],['Ativar som','Enable sound'],['Seleção de modo','Mode selection'],['ENCAIXE. COMBINE. REPITA.','STACK. COMBO. REPEAT.'],['Entre no','Find your'],['Modo de jogo','Game mode'],['Duração do Rush','Rush duration'],
  ['MIX SURPRESA','SURPRISE MIX'],['MIX CLÁSSICO','CLASSIC MIX'],['Raio. Prisma. Diagonal. E mais surpresas.','Lightning. Prism. Diagonal. And more surprises.'],['7 peças. Uma corrida contra o tempo.','7 pieces. A race against the clock.'],
  ['Desativar música','Mute music'],['Ativar música','Enable music'],['Ativar ou desativar música','Toggle music'],['Trilha aleatória','Shuffle soundtrack'],['Sortear próxima música','Shuffle to the next track'],['ao jogar','on play'],['desligada','off'],['pausada','paused'],['tocando','playing'],
  ['SUA PARTIDA','YOUR GAME'],['Pontuação','Score'],['Nível','Level'],['Linhas','Lines'],['Tempo restante','Time left'],['Tempo de jogo','Elapsed time'],['Linhas de 40','Lines out of 40'],['Tempo no modo Zen','Time in Zen mode'],
  ['Encaixe peças e limpe linhas para carregar seu pulso.','Place pieces and clear lines to charge your pulse.'],['Carregando pulso','Charging pulse'],['Limpa 3 fileiras','Clears 3 rows'],['Pontos ×2 por 8s','Double points for 8s'],['Ativar pulso','Activate pulse'],['Ativar pulso do Overdrive','Activate the Overdrive pulse'],['Exclusivo do Rush','Rush exclusive'],['Overdrive ativo','Overdrive active'],
  ['Peças com poderes, estrelas e bichinhos. Jogue no seu tempo, sem pulso.','Power pieces, stars and buddies. Play at your own pace, without a pulse.'],['Sete peças clássicas. Complete as 40 linhas no seu melhor tempo.','Seven classic pieces. Clear 40 lines as fast as you can.'],['Aproveite: os pontos das linhas estão valendo o dobro!','Make it count: line clears are worth double points!'],['Sua energia está no máximo. Solte o pulso e abra espaço!','Fully charged. Fire your pulse and make room!'],
  ['Seu recorde · Rush 2 min','Your best · Rush 2 min'],['Seu melhor tempo','Your best time'],['Seu recorde neste dispositivo','Your best on this device'],['Ver recordes','View records'],['modo atual','current mode'],['melhor score','best score'],['todas as durações','all durations'],
  ['Arena de jogo','Game arena'],['PRONTO PARA JOGAR','READY TO PLAY'],['NO FLOW · PARTIDA EM ANDAMENTO','IN THE FLOW · GAME IN PROGRESS'],['OVERDRIVE · PONTOS ×2','OVERDRIVE · DOUBLE POINTS'],['PARTIDA PAUSADA','GAME PAUSED'],['PARTIDA ENCERRADA','GAME OVER'],['Pausar partida','Pause game'],['Continuar partida','Resume game'],['Pausar (Esc)','Pause (Esc)'],['Recomeçar partida','Restart game'],['Recomeçar (R)','Restart (R)'],['Tela cheia','Fullscreen'],
  ['RESERVA','HOLD'],['Peça reservada','Held piece'],['Reserva vazia','Hold is empty'],['Guarde uma','Save a'],['boa jogada.','good move.'],['PRÓXIMAS','NEXT'],['Próximas cinco peças','Next five pieces'],['Pense um','Think one'],['bloco à frente.','block ahead.'],
  ['Tabuleiro de blocos com 10 colunas e 20 linhas. No celular, arraste em qualquer ponto da arena para mover; uma puxada curta desce devagar, uma puxada longa solta, e um toque gira.','Block board with 10 columns and 20 rows. On mobile, drag anywhere in the arena to move; a short downward drag soft drops, a long drag hard drops, and a tap rotates.'],['Mimi, Lumi e Pip','Mimi, Lumi and Pip'],['MENOS PENSAR. MAIS ENCAIXAR.','LESS THINKING. MORE STACKING.'],['PRONTO','READY'],['PRO','FOR'],['PRO RUSH?','FOR RUSH?'],['ENTRE NO','FIND YOUR'],['SEU FLOW.','FLOW.'],['ACELERA','SPEED UP'],['NO SPRINT.','IN SPRINT.'],['120 segundos.','120 seconds.'],['Faça cada linha contar.','Make every line count.'],['Jogar agora','Play now'],['Jogar de novo','Play again'],['Continuar','Resume'],['ou pressione','or press'],
  ['✦ TABULEIRO ZERADO ✦','✦ BOARD CLEARED ✦'],['+5.000 PONTOS','+5,000 POINTS'],['QUE JOGADA!','WHAT A PLAY!'],['BÔNUS DE PERFEIÇÃO','PERFECT CLEAR BONUS'],['UMA PAUSA FAZ PARTE.','TAKE A LITTLE BREAK.'],['RESPIRA.','BREATHE.'],['Seu próximo encaixe pode esperar.','Your next move can wait.'],['NOVO RECORDE PESSOAL!','NEW PERSONAL BEST!'],['TODA PARTIDA É UM RECOMEÇO.','EVERY GAME IS A FRESH START.'],['BOM DEMAIS.','NAILED IT.'],['MAIS UMA?','ONE MORE?'],['PONTOS','POINTS'],['LINHAS','LINES'],['RESGATES','RESCUES'],
  ['UM MINUTO. TUDO OU NADA.','ONE MINUTE. ALL OR NOTHING.'],['DOIS MINUTOS. TUDO OU NADA.','TWO MINUTES. ALL OR NOTHING.'],['CINCO MINUTOS. SEGURE O FLOW.','FIVE MINUTES. KEEP THE FLOW.'],['DEZ MINUTOS. RESISTA AO RITMO.','TEN MINUTES. GO THE DISTANCE.'],['40 LINHAS. O SEU MELHOR TEMPO.','40 LINES. YOUR BEST TIME.'],['40 LINHAS. SEU MELHOR TEMPO.','40 LINES. YOUR BEST TIME.'],['SEM PRESSA. SÓ O FLOW.','NO RUSH. JUST FLOW.'],['UM MIX DE BOAS SURPRESAS.','A MIX OF HAPPY SURPRISES.'],['40 linhas. Supere seu melhor tempo.','40 lines. Beat your best time.'],['Peças com poderes e amigos pelo caminho. Sem pressa.','Power pieces and friends along the way. No rush.'],
  ['pausar','pause'],['↔ mover','↔ move'],['toque gira','tap to rotate'],['↓ curto desce','↓ short: soft drop'],['↓ longo solta','↓ long: hard drop'],['Bônus da partida','Game bonuses'],['Estrelas coletadas','Stars collected'],['Bichinhos resgatados','Buddies rescued'],['Bombas detonadas','Bombs detonated'],['Encaixe sobre os bônus!','Land on the bonuses!'],['Controles por toque','Touch controls'],['Reservar peça','Hold piece'],['Mover para esquerda','Move left'],['Mover para direita','Move right'],['Girar peça','Rotate piece'],['Girar peça em 180 graus','Rotate piece 180 degrees'],['Descer peça','Soft drop piece'],['Soltar peça','Hard drop piece'],['Soltar ⇓','Drop ⇓'],
  ['Raio · ativa ao encaixar','Lightning · activates on landing'],['Limpa as colunas tocadas pela peça.','Clears the columns touched by the piece.'],['Limpa as colunas tocadas pela peça. Gire para atingir até 3!','Clears the columns touched by the piece. Rotate to hit up to 3!'],['Apaga todos os blocos da cor mais presente.','Clears every block of the most common color.'],['Limpa uma linha diagonal atravessando o tabuleiro. Gire para trocar a inclinação!','Clears a diagonal across the board. Rotate to change its direction!'],
  ['DESAFIO DA PARTIDA','GAME CHALLENGE'],['Bora encaixar?','Ready to stack?'],['Mimi está na torcida','Mimi is cheering you on'],['Encontre seu ritmo','Find your rhythm'],['Limpe 8 linhas em uma partida.','Clear 8 lines in one game.'],['O flow começa aqui.','Your flow starts here.'],['Limpe 8 linhas em uma partida. O flow começa aqui.','Clear 8 lines in one game. Your flow starts here.'],['Progresso','Progress'],['Progresso do desafio','Challenge progress'],['Ritmo encontrado!','You found your rhythm!'],['Uma linha de cada vez','One line at a time'],['Desafio completo. Continue o seu flow!','Challenge complete. Keep your flow going!'],['Complete as 40 linhas. O tempo é seu adversário.','Clear all 40 lines. The clock is your opponent.'],['Desafio da partida concluído!','Game challenge complete!'],
  ['NA PONTA DOS DEDOS','AT YOUR FINGERTIPS'],['Mover','Move'],['Girar','Rotate'],['ou','or'],['Girar 180°','Rotate 180°'],['Descer','Soft drop'],['Soltar','Hard drop'],['ESPAÇO','SPACE'],['Reservar','Hold'],['Todos os controles','All controls'],['Uma linha puxa a outra.','One line leads to another.'],['Limpe linhas em peças seguidas para multiplicar seus combos.','Clear lines with consecutive pieces to build your combos.'],['FEITO PARA AQUELE “SÓ MAIS UMA”.','MADE FOR THAT “JUST ONE MORE”.'],['15 peças. Uma turma inteira no flow.','15 pieces. A whole crew in the flow.'],
  ['APRENDA O BÁSICO','LEARN THE BASICS'],['Encontre o encaixe.','Find your fit.'],['Fechar instruções','Close instructions'],['Complete fileiras horizontais para limpar o tabuleiro. Se as peças chegarem ao topo, a partida acaba.','Complete horizontal rows to clear the board. If the pieces reach the top, the game ends.'],['Movimento','Movement'],['Girar à direita','Rotate clockwise'],['Girar à esquerda','Rotate counterclockwise'],['Descer devagar','Soft drop'],['Soltar de uma vez','Hard drop'],['Sua estratégia','Your strategy'],['Pulso (Rush)','Pulse (Rush)'],['Pausar','Pause'],['Recomeçar','Restart'],['Iniciar / continuar','Start / resume'],['O Rush tem um truque extra.','Rush has an extra trick.'],
  ['Cada peça carrega energia; linhas e combos dão um bônus. Ao atingir 100%, pressione S: o pulso remove até 3 fileiras ocupadas e dobra os pontos das linhas por 8 segundos.','Every piece charges energy; lines and combos add a bonus. At 100%, press S: the pulse removes up to 3 occupied rows and doubles line points for 8 seconds.'],
  ['A peça contornada mostra onde sua peça vai cair. Você pode usar a reserva uma vez por peça. No Sprint 40, as sete peças são clássicas. Rush e Zen têm quatro formatos extras, bombas, três peças com poderes e bônus surpresa. No celular, arraste para os lados, toque na peça para girar e puxe para baixo para soltar de uma vez.','The outlined ghost shows where your piece will land. You can hold once per piece. Sprint 40 uses the seven classic pieces. Rush and Zen add four extra shapes, bombs, three power pieces and surprise bonuses. On mobile, drag sideways to move, tap to rotate, drag down a little and hold to soft drop, or drag farther down to hard drop.'],
  ['Surpresas no tabuleiro','Board surprises'],['Peças especiais: Mini, Dupla, Cantinho, Ferradura, Bomba, Raio, Prisma e Diagonal','Special pieces: Mini, Duo, Corner, Horseshoe, Bomb, Lightning, Prism and Diagonal'],['Peças extras: Mini (1 bloco), Dupla (2), Cantinho (3) e Ferradura (5). Aperte A para girar 180° de uma vez.','Extra pieces: Mini (1 block), Duo (2), Corner (3) and Horseshoe (5). Press A to rotate 180 degrees.'],
  ['Encaixe uma peça sobre uma estrela ou um bichinho antes que ele desapareça. Estrelas valem 200 pontos e resgates, 500, multiplicados pelo nível. Durante o Overdrive, esses bônus também valem o dobro.','Land a piece on a star or buddy before it disappears. Stars award 200 points and rescues 500, multiplied by your level. During Overdrive, these bonuses also count double.'],['Bombas:','Bombs:'],
  ['solte com Espaço ou deixe encaixar. A explosão alcança até 9 × 9 casas, resgata os bichinhos na área e derruba os blocos restantes. Cada bloco destruído dá 30 pontos por nível. Uma bomba e uma peça com poder aparecem em cada grupo de dez peças no Rush e no Zen.','hard drop with Space or let the piece land. The explosion reaches up to 9 × 9 cells, rescues buddies in its area and makes remaining blocks fall. Each destroyed block awards 30 points per level. One bomb and one power piece appear in every group of ten pieces in Rush and Zen.'],
  ['Três peças, três superpoderes','Three pieces, three superpowers'],['Elas brilham em várias cores e ativam o poder ao encaixar. Podem ir para a reserva e são sorteadas sem repetir o mesmo poder em sequência.','They glow in multiple colors and activate on landing. You can hold them, and the same power never appears twice in a row.'],['A Diagonal também se consome ao ativar: escolha a inclinação com as rotações antes de soltar.','The Diagonal is also consumed on activation: rotate to choose its direction before dropping.'],
  ['Sete amigos com poderes','Seven friends with powers'],['Nox, o morcego:','Nox the bat:'],['vira o tabuleiro de cabeça para baixo por 10s. Os movimentos laterais acompanham a tela.','flips the board upside down for 10s. Sideways controls follow the screen.'],['Turbo, o coelho:','Turbo the rabbit:'],['deixa a queda super-rápida por 10s!','makes pieces fall super fast for 10s!'],['Lino, o dragão:','Lino the dragon:'],['as próximas 6 peças viram 4 peças I e 2 quadradas O, prontas para encaixar. A reserva continua disponível.','the next 6 pieces become 4 I pieces and 2 O squares, ready to fit. Hold remains available.'],['Polvi, o polvo:','Polvi the octopus:'],['por 10s, os blocos soltos do tabuleiro caem e tapam os buracos a cada encaixe. Se fecharem uma linha, ela é limpa na hora.','for 10s, loose blocks on the board fall down and fill the holes every time a piece lands. If they complete a row, it clears right away.'],['Nuvi, a nuvem:','Nuvi the cloud:'],['as próximas 5 peças viram bichinhos. Eles caem, ficam no tabuleiro sem sumir e esperam você resgatar depois, cada um com seu poder.','the next 5 pieces become buddies. They drop, stay on the board without disappearing and wait for you to rescue them later, each with its own power.'],['Broca, a toupeira:','Broca the mole:'],['ao encaixar qualquer peça, destrói todos os blocos abaixo dela nas colunas que ela ocupa, por 10s. Cada bloco vale 25 pontos por nível.','for 10s, each landing piece destroys every block below it in the columns it occupies. Each block awards 25 points per level.'],['Sexto, o sapinho:','Sexto the frog:'],['por 15s, seis blocos em qualquer posição da mesma linha já bastam para limpá-la ao encaixar.','for 15s, six blocks anywhere in the same row are enough to clear it when a piece lands.'],['Os dez amigos aparecem em ordem embaralhada. Poderes diferentes podem se combinar; resgatar o mesmo amigo renova seu relógio. A pausa congela os efeitos.','All ten friends appear in shuffled order. Different powers can combine; rescuing the same friend refreshes its timer. Pausing freezes the effects.'],
  ['Raio','Lightning'],['Prisma','Prism'],['Diagonal','Diagonal'],['Mini','Mini'],['Dupla','Duo'],['Cantinho','Corner'],['Ferradura','Horseshoe'],['Bomba','Bomb'],['RAIO','LIGHTNING'],['PRISMA','PRISM'],['DIAGONAL','DIAGONAL'],
  ['Apaga todos os blocos nas colunas tocadas pela peça, de cima a baixo. Na vertical, atinge uma coluna; na horizontal, três. Também coleta os bônus no caminho.','Clears every block in the columns touched by the piece, from top to bottom. Vertical hits one column; horizontal hits three. It also collects bonuses along the way.'],['Apaga a cor mais presente em todo o tabuleiro. O aviso mostra a cor-alvo e o contorno marca os blocos que vão sumir.','Clears the most common color across the board. The notice shows the target color, and outlines mark the blocks that will disappear.'],['Apaga uma linha diagonal atravessando o tabuleiro e faz os blocos restantes cair. Gire a peça para escolher entre as duas inclinações.','Clears a diagonal across the board and makes remaining blocks fall. Rotate the piece to choose between the two directions.'],['Raio e Prisma se consomem ao ativar e fazem os blocos restantes cair. Cada bloco removido vale 25 pontos por nível, em dobro no Overdrive. Se zerar tudo, tem ALL CLEAR com fogos!','Lightning and Prism are consumed on activation and make remaining blocks fall. Each removed block awards 25 points per level, doubled in Overdrive. Empty the board for an ALL CLEAR with fireworks!'],
  ['Trilha aleatória:','Shuffle soundtrack:'],['Neon Drive, Disco Cometa e Star Runner têm melodias e ritmos próprios. As três tocam em ordem aleatória, sem repetir uma faixa seguida. Use o botão de embaralhar para trocar. Música e efeitos sonoros têm controles separados.','Neon Drive, Disco Cometa and Star Runner each have their own melodies and rhythms. All three play in shuffled order without repeating a track back to back. Use shuffle to skip. Music and sound effects have separate controls.'],['Entendi. Bora jogar!','Got it. Let’s play!'],
  ['DO SEU JEITO','YOUR WAY'],['Ajuste seu flow.','Tune your flow.'],['Fechar configurações','Close settings'],['Música arcade','Arcade music'],['Três músicas em ordem aleatória.','Three tracks in shuffled order.'],['Volume da música','Music volume'],['Efeitos sonoros','Sound effects'],['Um som para cada boa jogada.','A sound for every great move.'],['Efeitos de movimento','Motion effects'],['Partículas, brilho, raios e fogos.','Particles, glow, lightning and fireworks.'],['Mostrar peça fantasma','Show ghost piece'],['Veja o encaixe antes de soltar.','See the landing before you drop.'],['Estas preferências ficam salvas neste dispositivo.','These preferences are saved on this device.'],['Tamanho do tabuleiro','Board size'],['Padrão 10 × 20','Default 10 × 20'],['Colunas','Columns'],['Colunas do tabuleiro','Board columns'],['Linhas do tabuleiro','Board rows'],['De 4 × 4 até o máximo que cabe na tela.','From 4 × 4 up to the most that fits on screen.'],['O novo tamanho vale a partir da próxima partida.','The new size applies from your next game.'],['Pronto','Done'],
  ['SEUS MELHORES','YOUR PERSONAL BESTS'],['Recordes de Rush.','Rush records.'],['Fechar recordes','Close records'],['Uma duração, um desafio, um recorde. Seus melhores scores ficam salvos neste dispositivo.','One duration, one challenge, one record. Your best scores are saved on this device.'],['O recorde é atualizado quando você termina uma partida com mais pontos.','Your record updates when you finish a game with a higher score.'],['Voltar para a arena','Back to the arena'],['Mais uma tentativa?','Another try?'],['Cancelar','Cancel'],['O progresso desta partida será descartado.','This game’s progress will be discarded.'],['Trocar de modo encerra a partida atual. Seu recorde anterior continua salvo.','Changing modes ends the current game. Your previous record stays saved.'],['Recomeçar descarta o progresso desta partida. Seu recorde anterior continua salvo.','Restarting discards this game’s progress. Your previous record stays saved.'],['Trocar de modo','Change mode'],
  ['De cabeça para baixo','Upside down'],['Queda turbo','Turbo fall'],['4 peças I e 2 O','4 I pieces and 2 O pieces'],['Gravidade nos blocos','Block gravity'],['Chuva de bichinhos','Buddy rain'],['Perfuração até o fundo','Drill to the bottom'],['Linhas com 6 blocos','6-block lines'],['ciano','cyan'],['amarelo','yellow'],['roxo','purple'],['verde','green'],['rosa','pink'],['azul','blue'],['laranja','orange'],['creme','cream'],['menta','mint'],['rosa-claro','light pink'],['pêssego','peach'],['azul-gelo','ice blue'],
  ['Você brilhou!','You’re a star!'],['Valeu pelo resgate!','Thanks for the rescue!'],['KABOOM! Abriu espaço!','KABOOM! Room to play!'],['Vai, raio! Abre caminho!','Lightning, clear the way!'],['Um arco-íris de espaço!','A rainbow of room!'],['Corta pela diagonal!','Slice diagonally!'],['ZEROU TUDO! Que jogada!','ALL CLEAR! What a play!'],['Me resgata? Encaixe aqui!','Rescue me! Land here!'],['Cheguei! Me pega depois!','I’m here! Grab me later!'],['Isso! Mais um combo!','Yes! Another combo!'],['Que encaixe lindo!','What a perfect fit!'],['BOA LINHA!','NICE LINE!'],['Festa no Overdrive!','Overdrive party!'],['PONTOS ×2 · 8 SEGUNDOS','DOUBLE POINTS · 8 SECONDS'],['Pulso ativado. Pontos de linhas em dobro por oito segundos.','Pulse activated. Double line points for eight seconds.'],['Bora mais uma?','One more round?'],['Bomba 9 × 9. Solte!','9 × 9 bomb. Drop it!'],['Ainda sem cor-alvo. Guarde na reserva para usar depois!','No target color yet. Hold it for later!'],['Partida pausada.','Game paused.'],['Partida retomada.','Game resumed.'],['O tabuleiro encheu.','The board filled up.'],['40 linhas. Missão cumprida!','40 lines. Mission accomplished!'],['O tempo acabou. Bela partida!','Time’s up. Great game!'],['A tela cheia não está disponível neste navegador.','Fullscreen is not available in this browser.'],['Modo inválido.','Invalid mode.']
]);

// Explicit templates keep dynamic scores, names and counts out of the catalog.
const templates = [
  ['{name} está na torcida','{name} is cheering you on'],
  ['Estrela! {score} pontos','Star! {score} points'],['{name} resgatado! {score} pontos','{name} rescued! {score} points'],
  ['Estrela coletada. {score} pontos.','Star collected. {score} points.'],['{name} resgatado. {score} pontos.','{name} rescued. {score} points.'],
  ['Peça {piece} na reserva','Held piece: {piece}'],['Próximas peças: {pieces}','Next pieces: {pieces}'],
  ['Bomba! {count} blocos destruídos. {score} pontos.','Bomb! {count} blocks destroyed. {score} points.'],
  ['{power}! {count} blocos removidos. {score} pontos.','{power}! {count} blocks removed. {score} points.'],
  ['+{score} PONTOS','+{score} POINTS'],['{score} PONTOS','{score} POINTS'],
  ['All clear! Tabuleiro zerado! +{score} pontos.{reason}','All clear! Board cleared! +{score} points.{reason}'],
  ['{name}: {power} por {seconds} segundos.','{name}: {power} for {seconds} seconds.'],
  ['{count} linhas. {label} {score} pontos.','{count} lines. {label} {score} points.'],
  ['{reason} {score} pontos, {count} linhas.','{reason} {score} points, {count} lines.'],
  ['{count} BLOCOS · {lines} LINHAS','{count} BLOCKS · {lines} LINES'],['{count} BLOCOS','{count} BLOCKS'],['{count} LINHAS!','{count} LINES!'],
  ['{minutes} · SEU MELHOR SCORE.','{minutes} · YOUR BEST SCORE.'],
  ['{minutes}. Peças com poderes, bombas e bichinhos. Prepare o seu melhor combo!','{minutes}. Power pieces, bombs and buddies. Get ready for your best combo!'],
  ['40 linhas em {time}. Belo ritmo!','40 lines in {time}. Great pace!'],
  ['Ver recordes de Rush, {duration}','View Rush records, {duration}'],['Seu recorde · Rush {duration}','Your best · Rush {duration}'],
  ['{piece} surpresa','Surprise {piece}'],['{name} cai e espera o resgate!','{name} lands and waits for a rescue!'],['{piece} · ativa ao encaixar','{piece} · activates on landing'],
  ['Cor-alvo: {color}. {count} blocos vão sumir!','Target color: {color}. {count} blocks will disappear!'],
  ['Vai limpar 1 coluna inteira. Gire para mudar o alcance!','Clears 1 full column. Rotate to change the range!'],
  ['Vai limpar {count} colunas inteiras. Gire para mudar o alcance!','Clears {count} full columns. Rotate to change the range!'],
  ['De 4 × 4 até {cols} × {rows}, o máximo que cabe na tela. Cada tamanho tem seus próprios recordes.','From 4 × 4 up to {cols} × {rows}, the most that fits on screen. Each size keeps its own records.'],
  ['Tabuleiro de blocos com {count} colunas e {lines} linhas. No celular, arraste em qualquer ponto da arena para mover; uma puxada curta desce devagar, uma puxada longa solta, e um toque gira.','Block board with {count} columns and {lines} rows. On mobile, drag anywhere in the arena to move; a short downward drag soft drops, a long drag hard drops, and a tap rotates.'],
  ['Música: {track}','Music: {track}']
];
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = templates.map(([source, target]) => {
  const keys = [...source.matchAll(/\{(\w+)\}/g)].map(match => match[1]);
  const parts = source.split(/\{\w+\}/).map(escape);
  const expression = parts.map((part, index) => part + (index < keys.length ? (['score','count','lines','seconds'].includes(keys[index]) ? '([\\d.,]+)' : '(.*?)') : '')).join('');
  return { regex: new RegExp('^' + expression + '$'), target, keys };
});
export function t(value) {
  const source = String(value);
  if (language === 'pt') return source;
  const key = source.trim();
  const pad = result => source.slice(0, source.length - source.trimStart().length) + result + source.slice(source.trimEnd().length);
  if (Object.hasOwn(english, key)) return pad(english[key]);
  for (const {regex, target, keys} of patterns) {
    const match = key.match(regex);
    if (match) return pad(target.replace(/\{(\w+)\}/g, (_, name) => t(match[keys.indexOf(name) + 1])));
  }
  // Compound labels contain only independently translated pieces and separators.
  if (key.includes('  |  ')) return source.split('  |  ').map(t).join('  |  ');
  if (key.includes(' · ')) return source.split(' · ').map(t).join(' · ');
  if (key.includes(', ')) return source.split(', ').map(t).join(', ');
  if (/^[ϟ◇╲] /.test(key)) return key.slice(0, 2) + t(key.slice(2));
  if (key.endsWith('!') && Object.hasOwn(english, key.slice(0, -1))) return pad(t(key.slice(0, -1)) + '!');
  return source;
}

// Remember source text, including transient notices, so switching is lossless.
const dynamicText = new Map(), dynamicLabels = new Map();
export function setText(element, value) {
  if (dynamicText.size > 150) for (const node of dynamicText.keys()) if (!node.isConnected) dynamicText.delete(node);
  dynamicText.set(element, String(value));
  const translated = t(value);
  if (element.textContent !== translated) element.textContent = translated;
}
export function setLabel(element, value) {
  dynamicLabels.set(element, String(value));
  element.setAttribute('aria-label', t(value));
}
const staticEntries = [];
export function capturePage(document) {
  const walker = document.createTreeWalker(document.documentElement, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent.trim() && !node.parentElement.closest('script,style,svg')) staticEntries.push({node, source:node.textContent});
  }
  document.querySelectorAll('[aria-label],[title],meta[name="description"]').forEach(node => {
    for (const attribute of ['aria-label','title', ...(node.matches('meta') ? ['content'] : [])]) {
      if (node.hasAttribute(attribute)) staticEntries.push({node, attribute, source:node.getAttribute(attribute)});
    }
  });
}
export function translatePage(document) {
  document.documentElement.lang = getLocale();
  for (const {node, attribute, source} of staticEntries) {
    if (!node.isConnected) continue;
    if (attribute) node.setAttribute(attribute, t(source));
    else node.textContent = t(source);
  }
  for (const [node, source] of dynamicText) {
    if (node.isConnected) setText(node, source); else dynamicText.delete(node);
  }
  for (const [node, source] of dynamicLabels) {
    if (node.isConnected) setLabel(node, source); else dynamicLabels.delete(node);
  }
}
