import { TRACKS, arrangementAt } from './tracks.mjs?v=20260917-1';
export { TRACKS } from './tracks.mjs?v=20260917-1';
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

export class ArcadeAudio {
  constructor(random = Math.random) {
    this.random=random;this.order=[];this.track=null;this.context=null;this.timer=null;
    this.musicVoices=new Set();this.step=0;this.nextStep=0;this.lastRotate=0;
    this.state={playing:false,mode:'rush',overdrive:false,level:1};
    this.prefs={sound:true,music:true,volume:.32};this.chooseTrack();
  }
  chooseTrack() {
    if(!this.order.length){
      this.order=TRACKS.map((_,i)=>i);
      for(let i=this.order.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.order[i],this.order[j]]=[this.order[j],this.order[i]];}
      if(this.track&&TRACKS[this.order.at(-1)].id===this.track.id){const last=this.order.length-1;[this.order[0],this.order[last]]=[this.order[last],this.order[0]];}
    }
    this.track=TRACKS[this.order.pop()];this.step=0;
    if(this.delay&&this.context?.state==='running')this.delay.delayTime.setTargetAtTime(60/this.track.bpm*.75,this.context.currentTime,.08);
    return this.track;
  }
  async unlock(prefs=this.prefs) {
    this.prefs={...prefs};
    if(!prefs.sound&&!prefs.music)return;
    try{
      if(!this.context||this.context.state==='closed'){
        const AudioConstructor=globalThis.AudioContext||globalThis.webkitAudioContext;
        if(!AudioConstructor)return;
        this.context=new AudioConstructor();this.createMixer();
      }
      if(this.context.state==='suspended')await this.context.resume();
      this.setState(this.state,this.prefs);
    }catch{ /* Retry on the next direct gesture if the browser blocked audio. */ }
  }
  createMixer() {
    const context=this.context;
    const limiter=context.createDynamicsCompressor();
    limiter.threshold.value=-13;limiter.knee.value=15;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.16;limiter.connect(context.destination);
    this.musicGain=context.createGain();this.musicGain.gain.value=0;this.musicGain.connect(limiter);
    this.effectsGain=context.createGain();this.effectsGain.gain.value=this.prefs.sound?.78:0;this.effectsGain.connect(limiter);
    this.musicInput=context.createGain();this.musicInput.gain.value=.9;this.musicInput.connect(this.musicGain);
    this.delay=context.createDelay(1);this.delay.delayTime.value=60/this.track.bpm*.75;
    const delayFeedback=context.createGain(),delayFilter=context.createBiquadFilter(),delayWet=context.createGain();
    delayFeedback.gain.value=.25;delayFilter.type='lowpass';delayFilter.frequency.value=2700;delayWet.gain.value=.14;
    this.musicInput.connect(this.delay);this.delay.connect(delayFilter);delayFilter.connect(delayWet);delayWet.connect(this.musicGain);delayFilter.connect(delayFeedback);delayFeedback.connect(this.delay);
    const room=context.createConvolver(),roomWet=context.createGain();roomWet.gain.value=.12;
    const impulse=context.createBuffer(2,Math.floor(context.sampleRate*1.4),context.sampleRate);
    for(let channel=0;channel<2;channel++){const data=impulse.getChannelData(channel);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3.4);}
    room.buffer=impulse;this.musicInput.connect(room);room.connect(roomWet);roomWet.connect(this.musicGain);
    this.noise=context.createBuffer(1,Math.floor(context.sampleRate*.7),context.sampleRate);
    const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }
  playSources(sources,nodes,at,end,music=true) {
    let remaining=sources.length;
    for(const source of sources){
      if(music)this.musicVoices.add(source);
      source.onended=()=>{this.musicVoices.delete(source);remaining--;if(remaining===0){sources.forEach(s=>s.disconnect());nodes.forEach(n=>n.disconnect());}};
      source.start(at);source.stop(end);
    }
  }
  voice(frequency,at,duration,type,level,music=true,sweep=0) {
    if(this.context?.state!=='running')return;
    const oscillator=this.context.createOscillator(),envelope=this.context.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,at);
    if(sweep)oscillator.frequency.exponentialRampToValueAtTime(sweep,at+duration);
    envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(Math.max(.001,level),at+.006);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
    oscillator.connect(envelope);envelope.connect(music?this.musicInput:this.effectsGain);
    this.playSources([oscillator],[envelope],at,at+duration+.03,music);
  }
  synth(midi,at,duration,kind,velocity=1,pan=0) {
    const context=this.context;if(context?.state!=='running')return;
    const filter=context.createBiquadFilter(),envelope=context.createGain();
    const stereo=typeof context.createStereoPanner==='function'?context.createStereoPanner():context.createGain();
    if(stereo.pan)stereo.pan.value=Math.max(-1,Math.min(1,pan));
    filter.type='lowpass';filter.Q.value=.55;
    const pad=kind==='pad',bass=kind==='bass',bell=kind==='bell'||kind==='glass'||kind==='keys';
    const frequency=hz(midi),attack=pad?.13:kind==='warm'?.018:.005,release=pad?.42:bell?.16:.065;
    const base=bass?.22:pad?.053:kind==='arp'?.062:bell?.13:.14;
    filter.frequency.setValueAtTime(bass?680:pad?1800:kind==='warm'?2900:7400,at);
    filter.frequency.exponentialRampToValueAtTime(bass?190:pad?1050:kind==='warm'?1400:2400,at+duration+release);
    envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(Math.max(.001,base*velocity),at+attack);
    if(!bell)envelope.gain.setValueAtTime(Math.max(.001,base*velocity*.7),at+Math.max(attack,duration*.55));
    envelope.gain.exponentialRampToValueAtTime(.0001,at+Math.max(attack+.03,duration)+release);
    filter.connect(envelope);envelope.connect(stereo);stereo.connect(this.musicInput);
    const nodes=[filter,envelope,stereo],sources=[];
    if(bell){
      const carrier=context.createOscillator(),modulator=context.createOscillator(),depth=context.createGain();
      carrier.type='sine';carrier.frequency.value=frequency;modulator.type='sine';modulator.frequency.value=frequency*(kind==='glass'?3:2);
      depth.gain.setValueAtTime(frequency*(kind==='keys'?.35:.65),at);depth.gain.exponentialRampToValueAtTime(Math.max(.1,frequency*.012),at+Math.max(.04,duration*.65));
      modulator.connect(depth);depth.connect(carrier.frequency);carrier.connect(filter);sources.push(carrier,modulator);nodes.push(depth);
    }else{
      const layers=pad?[['sawtooth',-7,.29],['sawtooth',7,.29],['triangle',0,.42]]:bass?[['sine',0,.7],['sawtooth',0,.3]]:kind==='warm'?[['triangle',-3,.7],['sawtooth',4,.3]]:[['triangle',0,1]];
      for(const [wave,detune,gain] of layers){const oscillator=context.createOscillator(),mix=context.createGain();oscillator.type=wave;oscillator.frequency.value=frequency;oscillator.detune.value=detune;mix.gain.value=gain;oscillator.connect(mix);mix.connect(filter);sources.push(oscillator);nodes.push(mix);}
    }
    this.playSources(sources,nodes,at,at+Math.max(attack+.03,duration)+release+.04);
  }
  noiseHit(at,duration,level,filterType='highpass',cutoff=6000,music=true) {
    const context=this.context;if(context?.state!=='running')return;
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),envelope=context.createGain();
    source.buffer=this.noise;filter.type=filterType;filter.frequency.value=cutoff;filter.Q.value=.6;
    envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(Math.max(.001,level),at+.004);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
    source.connect(filter);filter.connect(envelope);envelope.connect(music?this.musicInput:this.effectsGain);
    this.playSources([source],[filter,envelope],at,at+duration+.02,music);
  }
  drum(at,kind,velocity=1) {
    if(kind==='kick'){this.voice(155,at,.2,'sine',.38*velocity,true,43);this.noiseHit(at,.018,.035*velocity,'highpass',3600);}
    else if(kind==='snare'){this.noiseHit(at,.135,.12*velocity,'highpass',1250);this.voice(185,at,.09,'triangle',.055*velocity,true,110);}
    else if(kind==='clap'){for(let i=0;i<3;i++)this.noiseHit(at+i*.012,.09,.062*velocity,'bandpass',1700+i*350);}
    else this.noiseHit(at,kind==='open'?.12:.04,(kind==='open'?.045:.032)*velocity,'highpass',6800);
  }
  scheduleStep() {
    if(this.step>=512)this.chooseTrack();
    const track=this.track,step=this.step%16,bar=Math.floor(this.step/16),chord=track.chords[bar%8];
    const form=arrangementAt(bar),boost=this.state.overdrive,unit=60/(track.bpm+(boost?8:0))/4;
    const at=this.nextStep+(step%2?track.swing*unit:0),energy=form.energy;
    if(form.drums||boost){
      if(track.kicks.includes(step))this.drum(at,'kick',energy);
      if(track.snares.includes(step))this.drum(at,track.style==='disco'?'clap':'snare',energy);
      if(step%2===0||track.style==='dnb'||boost)this.drum(at,step%4===2&&track.style==='disco'?'open':'hat',energy*(step%4===2?1:.6));
      if(bar%8===7&&step>=13)this.drum(at,'snare',(step-12)*.12);
      if(track.style==='dnb'&&(step===6||step===15))this.drum(at,'snare',.17);
    }else if(step%4===2)this.drum(at,'hat',.32);
    if(form.bass){for(const [position,offset,length] of track.bassSteps)if(position===step)this.synth(chord[0]+offset,at,unit*length,'bass',energy);}
    if(form.pads){
      if(track.style==='disco'){
        if([2,6,10,14].includes(step))chord.slice(1).forEach((note,i)=>this.synth(note+12,at,unit*1.35,'keys',energy*.34,(i-1)*.3));
      }else if(step===0){chord.slice(1).forEach((note,i)=>this.synth(note+12,at,unit*14,track.pad,energy*.8,(i-1)*.3));}
    }
    if(form.lead){
      const phrase=track.phrases[bar%8];
      for(const [position,note,length] of phrase){if(position===step){
        this.synth(note,at,unit*length,track.lead,energy*(boost?1.1:1),track.style==='disco'?.12:0);
        if(form.section==='chorus'&&step%4===0)this.synth(note-12,at,unit*length,'warm',.24,-.16);
      }}
    }
    if(form.arp||boost){
      if(step%2===0||boost){const notes=chord.slice(1);const n=notes[Math.floor(step/2)%notes.length]+(track.style==='dnb'?24:12);this.synth(n,at,unit*.72,'arp',form.lead?.28:.65,step%4<2?-.42:.42);}
    }
    this.step++;this.nextStep+=unit;
  }
  schedule() {
    if(this.context?.state!=='running'||!this.state.playing||!this.prefs.music)return;
    const now=this.context.currentTime;
    if(this.nextStep<now-.12)this.nextStep=now+.025;
    while(this.nextStep<now+.13)this.scheduleStep();
  }
  setState(state,prefs) {
    this.state={...state};this.prefs={...prefs};if(!this.context||!this.musicGain)return;
    const playing=state.playing&&prefs.music&&this.context.state==='running',now=this.context.currentTime;
    this.musicGain.gain.setTargetAtTime(playing?Math.max(0,Math.min(1,prefs.volume)):0,now,.025);
    this.effectsGain.gain.setTargetAtTime(prefs.sound?.78:0,now,.02);
    if(playing&&!this.timer){this.nextStep=now+.045;this.timer=setInterval(()=>this.schedule(),25);this.schedule();}
    else if(!playing)this.stopMusic();
  }
  stopMusic() {
    if(this.timer){clearInterval(this.timer);this.timer=null;}
    if(this.context?.state==='running'&&this.musicGain)this.musicGain.gain.setTargetAtTime(0,this.context.currentTime,.018);
    for(const source of this.musicVoices){try{source.stop();}catch{}}
    this.musicVoices.clear();
  }
  reset(){this.stopMusic();this.chooseTrack();}
  nextTrack(){this.reset();this.setState(this.state,this.prefs);return this.track;}
  effect(kind,count=1) {
    if(!this.prefs.sound||this.context?.state!=='running')return;
    const now=this.context.currentTime;
    const note=(f,t=.09,wave='sine',delay=0,v=.045)=>this.voice(f,now+delay,t,wave,v,false,f*.86);
    if(kind==='drop')note(145,.09,'triangle',0,.06);
    if(kind==='rotate'&&now-this.lastRotate>.07){note(450,.035,'sine',0,.017);this.lastRotate=now;}
    if(kind==='hold'){note(400,.06);note(620,.06,'sine',.05);}
    if(kind==='clear')[523,659,784,1047].slice(0,Math.min(4,count+1)).forEach((f,i)=>note(f,.18,'triangle',i*.045,.06));
    if(kind==='pulse')[220,330,440,660,880].forEach((f,i)=>note(f,.3,'sawtooth',i*.07,.025));
    if(kind==='finish')[392,330,262].forEach((f,i)=>note(f,.25,'triangle',i*.16,.05));
    if(kind==='all-clear'){
      [523,659,784,1047,1319,1568].forEach((f,i)=>this.voice(f,now+.05+i*.085,.25,'triangle',.055,false));
      [523,659,784,1047].forEach(f=>this.voice(f,now+.62,.7,'sine',.035,false));
    }
    if(kind==='start')[440,660,880].forEach((f,i)=>note(f,.12,'triangle',i*.08,.05));
    if(kind==='star')[1047,1319,1568].forEach((f,i)=>note(f,.16,'sine',i*.055,.05));
    if(kind==='gravity')[784,622,494,392].forEach((f,i)=>note(f,.12,'triangle',i*.05,.045));
    if(kind==='buddy')[659,784,988,1319].forEach((f,i)=>note(f,.2,'triangle',i*.075,.06));
    if(kind==='VOLT'){
      this.noiseHit(now,.17,.085,'highpass',1800,false);
      [220,440,880,1320].forEach((f,i)=>note(f,.15,'sawtooth',i*.04,.024));
    }
    if(kind==='PRISM')[523,659,784,988,1319].forEach((f,i)=>this.voice(f,now+i*.065,.35,'sine',.05,false));
    if(kind==='DIAG'){
      [392,523,659,784,1047].forEach((f,i)=>this.voice(f,now+i*.07,.23,'triangle',.05,false));
      this.noiseHit(now,.28,.06,'highpass',2300,false);
    }
    if(kind==='bomb'){
      this.voice(118,now,.55,'sine',.3,false,28);
      this.noiseHit(now,.48,.26,'lowpass',800,false);
      this.noiseHit(now,.09,.1,'highpass',1900,false);
      note(220,.24,'triangle',.12,.05);
    }
  }
  destroy(){this.stopMusic();if(this.context)void this.context.close().catch(()=>{});}
}
