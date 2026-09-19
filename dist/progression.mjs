export const MISSION_TYPES = {
  birds: { label:'Acerte 3 passarinhos', goal:3, reward:750, icon:'🐦' },
  buddies: { label:'Resgate 2 bichinhos', goal:2, reward:1000, icon:'♥' },
  combo: { label:'Faça um combo de 3', goal:3, reward:1500, icon:'×3' },
  lines: { label:'Limpe 8 linhas', goal:8, reward:750, icon:'≡' },
  pieces: { label:'Encaixe 20 peças', goal:20, reward:1000, icon:'▦' }
};
export function createMissions(mode) {
  return (mode==='sprint'?['lines','pieces','combo']:['birds','buddies','combo']).map(id=>({id,...MISSION_TYPES[id],progress:0,completed:false}));
}
export function advanceMissions(missions, game) {
  const values={birds:game.birdsHit,buddies:game.rescued,combo:game.lines>0?game.maxCombo+1:0,lines:game.lines,pieces:game.pieces};
  const completed=[];
  for(const mission of missions){
    if(mission.completed)continue;
    mission.progress=Math.min(mission.goal,Math.max(mission.progress,values[mission.id]||0));
    if(mission.progress===mission.goal){mission.completed=true;completed.push({...mission});}
  }
  return completed;
}

export const ALBUM_STYLES = {
  color: [{value:'original',label:'Original',goal:0},{value:'aurora',label:'Aurora',goal:3}],
  accessory: [{value:'none',label:'Sem acessório',goal:0},{value:'crown',label:'Coroa',goal:5}],
  celebration: [{value:'stars',label:'Estrelinhas',goal:0},{value:'hearts',label:'Chuva de corações',goal:10}]
};
export const ALBUM_MILESTONES = Object.entries(ALBUM_STYLES).flatMap(([kind,styles])=>styles.filter(style=>style.goal>0).map(style=>({...style,kind})));
export class BuddyAlbum {
  constructor(names, saved) {
    this.names=[...names];
    this.entries=Object.fromEntries(names.map(name=>{
      const data=saved?.buddies?.[name],rescues=Number.isSafeInteger(data?.rescues)&&data.rescues>=0?Math.min(data.rescues,1000000):0;
      const entry={rescues};
      for(const [kind,styles] of Object.entries(ALBUM_STYLES))entry[kind]=styles.find(style=>style.value===data?.[kind]&&style.goal<=rescues)?.value||styles[0].value;
      return [name,entry];
    }));
  }
  entry(index) { return this.entries[this.names[index]]; }
  rescue(index) {
    const entry=this.entry(index);if(!entry)return null;
    entry.rescues=Math.min(1000000,entry.rescues+1);
    const unlocks=ALBUM_MILESTONES.filter(style=>style.goal===entry.rescues);
    for(const style of unlocks)entry[style.kind]=style.value;
    return {index,name:this.names[index],first:entry.rescues===1,unlocks};
  }
  equip(index,kind,value) {
    if(!Object.hasOwn(ALBUM_STYLES,kind))return false;
    const entry=this.entry(index),style=ALBUM_STYLES[kind]?.find(option=>option.value===value);
    if(!entry||!style||entry.rescues<style.goal)return false;
    entry[kind]=value;return true;
  }
  next(index) {
    const entry=this.entry(index);if(!entry)return null;
    if(!entry.rescues)return {goal:1,label:'Primeiro resgate',remaining:1};
    const next=ALBUM_MILESTONES.find(style=>style.goal>entry.rescues);
    return next?{...next,remaining:next.goal-entry.rescues}:null;
  }
  get found() { return Object.values(this.entries).filter(entry=>entry.rescues>0).length; }
  get rescues() { return Object.values(this.entries).reduce((sum,entry)=>sum+entry.rescues,0); }
  snapshot() { return {version:1,buddies:Object.fromEntries(Object.entries(this.entries).map(([name,entry])=>[name,{...entry}]))}; }
}

export class RecordRival {
  constructor(mode,target) { this.mode=mode;this.target=Number.isFinite(target)&&target>0?target:null;this.near=false;this.beaten=false; }
  update({score,elapsed,lines,finished=false,won=false}) {
    if(!this.target||this.beaten)return null;
    const sprint=this.mode==='sprint';
    const beaten=sprint?finished&&won&&elapsed<this.target:score>this.target;
    if(beaten){this.beaten=true;return 'record-beaten';}
    const gap=sprint?this.target-elapsed:this.target-score;
    const close=sprint?lines>=32&&gap>0&&gap<=10000:score>0&&gap>=0&&gap<=Math.min(500,Math.ceil(this.target*.1));
    if(!finished&&!this.near&&close){this.near=true;return 'record-near';}
    return null;
  }
}
