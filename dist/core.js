export const LANES = [-2.4, 0, 2.4];
export const TRAIN_LENGTH = 10;
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export const obstacleLength = o => o.length ?? (o.type==='block' ? TRAIN_LENGTH : 0);
export function rng(seed=104729) {
  let s=seed>>>0;
  return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
export class Run {
  constructor(seed=12345) { this.reset(seed); }
  reset(seed=12345) {
    Object.assign(this,{seed,random:rng(seed),time:0,distance:0,speed:16,lane:1,x:0,jump:0,duck:0,hits:0,sugar:0,objects:[],nextId:0,nextRow:65,lastSafe:1,invincible:0,cleanTime:0,ended:false,events:[],action:'none',actionAge:1});
    this.generate();
  }
  generate() {
    while(this.nextRow<this.distance+150) {
      const safe=clamp(this.lastSafe+(this.random()<.6?0:(this.random()<.5?-1:1)),0,2);
      const other=[0,1,2].filter(x=>x!==safe),count=this.random()<.65?2:1;
      for(let i=0;i<count;i++) {
        const r=this.random(),type=r<.48?'block':r<.77?'hurdle':'overhead';
        this.objects.push({id:this.nextId++,kind:'obstacle',lane:other[i],type,at:this.nextRow,length:type==='block'?TRAIN_LENGTH:.7,hit:false,done:false});
      }
      for(let j=0;j<4;j++)this.objects.push({id:this.nextId++,kind:'sugar',lane:safe,type:'sugar',at:this.nextRow-5+j*2.2,done:false});
      this.lastSafe=safe;
      this.nextRow+=Math.max(23,this.speed*1.38,TRAIN_LENGTH+this.speed*.45+5)+this.random()*5;
    }
  }
  input(action) {
    if(this.ended)return false;
    if(action==='left'&&this.lane>0)this.lane--;
    else if(action==='right'&&this.lane<2)this.lane++;
    else if(action==='jump'&&this.jump<=0){this.jump=.76;this.duck=0;}
    else if(action==='duck'&&this.jump<=0)this.duck=.7;
    else return false;
    this.action=action;this.actionAge=0;return true;
  }
  get height(){return this.jump>0?Math.sin((1-this.jump/.76)*Math.PI)*2.15:0;}
  step(dt) {
    this.events=[];if(this.ended)return this.events;dt=clamp(dt,0,.05);
    const previousDistance=this.distance;
    this.time+=dt;this.speed=Math.min(30,16+this.time*.075);this.distance+=this.speed*dt;
    this.x+=(LANES[this.lane]-this.x)*(1-Math.exp(-20*dt));
    this.jump=Math.max(0,this.jump-dt);this.duck=Math.max(0,this.duck-dt);
    this.invincible=Math.max(0,this.invincible-dt);this.cleanTime+=dt;this.actionAge+=dt;
    if(this.actionAge>.24)this.action='none';
    if(this.hits>0&&this.cleanTime>=15){this.hits--;this.cleanTime=0;this.events.push({type:'recover'});}
    for(const o of this.objects) {
      const d=o.at-this.distance,length=o.kind==='obstacle'?obstacleLength(o):0;
      const crossed=o.at+length-previousDistance>=-.72&&d<=.72;
      const radius=o.type==='block'?1.12:.85;
      if(!o.done&&crossed&&Math.abs(LANES[o.lane]-this.x)<radius) {
        if(o.kind==='sugar') {
          if(this.height<1.4){o.done=true;this.sugar++;this.events.push({type:'sugar',object:o});}
        } else {
          const safe=o.type==='hurdle'?this.height>.83:o.type==='overhead'?this.duck>0:false;
          if(!safe&&!o.hit&&this.invincible<=0) {
            o.hit=true;this.hits++;this.cleanTime=0;this.invincible=1.3;
            this.events.push({type:'hit',object:o});
            if(this.hits>=3){this.ended=true;this.events.push({type:'end'});}
          }
        }
      }
      if(d+length<-.8)o.done=true;
    }
    this.objects=this.objects.filter(o=>o.at+(o.kind==='obstacle'?obstacleLength(o):0)-this.distance>-12);
    this.generate();return this.events;
  }
  observation() {
    return {
      speed:this.speed,lane:this.lane,jumping:this.jump>0,ducking:this.duck>0,
      obstacles:this.objects.filter(o=>o.kind==='obstacle'&&!o.done&&o.at+obstacleLength(o)-this.distance>=-.72&&o.at-this.distance<60).map(o=>({lane:o.lane,type:o.type,distance:Math.max(0,o.at-this.distance),tailDistance:o.at+obstacleLength(o)-this.distance})),
      sugar:this.objects.filter(o=>o.kind==='sugar'&&!o.done&&o.at>this.distance&&o.at-this.distance<40).map(o=>({lane:o.lane,distance:o.at-this.distance})),
    };
  }
}
export function reflex(o) {
  const front=o.obstacles.find(x=>x.lane===o.lane&&x.distance/o.speed<.52);
  if(!front)return'none';
  if(front.type==='hurdle'&&!o.jumping)return'jump';
  if(front.type==='overhead'&&!o.ducking&&!o.jumping)return'duck';
  return'none';
}

