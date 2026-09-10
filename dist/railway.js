import * as T from './vendor/three.module.js';
import {LANES, TRAIN_LENGTH, rng} from './core.js';

const BOX = new T.BoxGeometry(1, 1, 1);
const SPHERE = new T.SphereGeometry(1, 14, 10);
const CYLINDER = new T.CylinderGeometry(1, 1, 1, 12);
const PLANE = new T.PlaneGeometry(1, 1);
const materialCache = new Map(), signCache = new Map();
function material(color, metalness = 0, roughness = .7) {
  const key = `${color}-${metalness}-${roughness}`;
  if (!materialCache.has(key)) materialCache.set(key, new T.MeshStandardMaterial({color, metalness, roughness}));
  return materialCache.get(key);
}
function glow(color,fog=true) {
  const key=`glow-${color}-${fog}`;
  if(!materialCache.has(key))materialCache.set(key,new T.MeshBasicMaterial({color,fog}));
  return materialCache.get(key);
}
// Batch repeated static geometry while retaining the parent group's recycling transform.
function consolidate(group) {
  group.updateMatrixWorld(true);
  const inverse=new T.Matrix4().copy(group.matrixWorld).invert(),sets=new Map();
  group.traverse(object=>{
    if(!object.isMesh||object.isInstancedMesh)return;
    const key=`${object.geometry.uuid}-${object.material.uuid}-${object.castShadow}`;
    if(!sets.has(key))sets.set(key,[]);
    sets.get(key).push({object,matrix:new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld)});
  });
  for(const entries of sets.values()) {
    if(entries.length<2)continue;
    const first=entries[0].object;
    const mesh=new T.InstancedMesh(first.geometry,first.material,entries.length);
    mesh.castShadow=first.castShadow;mesh.receiveShadow=true;
    entries.forEach(({object,matrix},i)=>{mesh.setMatrixAt(i,matrix);object.removeFromParent();});
    group.add(mesh);
  }
  return group;
}
function part(group, x, y, z, w, h, d, color, geometry = BOX) {
  const mesh = new T.Mesh(geometry, typeof color === 'number' ? material(color) : color);
  mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh); return mesh;
}
function batches(group, transforms, color, castShadow = false) {
  const mesh = new T.InstancedMesh(BOX, material(color), transforms.length);
  const transform = new T.Object3D();
  transforms.forEach(([x,y,z,w,h,d], i) => {
    transform.position.set(x,y,z); transform.scale.set(w,h,d);
    transform.updateMatrix(); mesh.setMatrixAt(i,transform.matrix);
  });
  mesh.receiveShadow = true; mesh.castShadow = castShadow;
  group.add(mesh); return mesh;
}
function sign(text, bg = '#143357', fg = '#fff3ae', secondary = '') {
  const key = text+bg+fg+secondary;
  if (signCache.has(key)) return signCache.get(key);
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0,0,768,256);
  ctx.strokeStyle = fg; ctx.lineWidth = 5; ctx.strokeRect(15,15,738,226);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 86px sans-serif'; ctx.fillText(text,384,secondary ? 105 : 130,700);
  if (secondary) { ctx.font = 'bold 26px monospace'; ctx.fillText(secondary,384,191,690); }
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  const result = new T.MeshStandardMaterial({map:texture, roughness:.7});
  signCache.set(key,result); return result;
}
function board(group, text, x,y,z,w,h, bg,fg,sub='') {
  part(group,x,y,z-.07,w+.12,h+.12,.16,0x19394d);
  return part(group,x,y,z,w,h,1,sign(text,bg,fg,sub),PLANE);
}

export class Railway {
  constructor(scene) {
    this.scene = scene; this.moving = []; this.sky = new T.Group();
    scene.add(this.sky); this.makeTrack(); this.makeCity(); this.makeSkyline();
  }

  makeTrack() {
    part(this.scene,0,-.6,-95,120,1,300,0xc7a68d);
    part(this.scene,0,-.27,-98,8.15,.36,270,0x69768b);
    this.sleepers = new T.Group(); this.scene.add(this.sleepers);
    const ties = [], bolts = [], stones = [];
    const random = rng(8871);
    for (const lane of LANES) {
      for (const dx of [-.71,.71]) {
        part(this.scene,lane+dx,-.02,-99,.115,.17,274,material(0xc8d8e6,.72,.3));
        part(this.scene,lane+dx,-.115,-99,.23,.035,274,0x324553);
      }
      for (let i=0;i<142;i++) {
        const z=16-i*1.8;
        ties.push([lane,-.135,z,1.95,.15,.23]);
        for (const dx of [-.78,.78]) bolts.push([lane+dx,-.035,z,.22,.07,.3]);
      }
    }
    batches(this.sleepers,ties,0x665066); batches(this.sleepers,bolts,0xadb6c2);
    this.ballast = new T.Group(); this.scene.add(this.ballast);
    for(let i=0;i<40;i++) {
      const x=(random()-.5)*7.8,z=random()*18,w=.08+random()*.13,d=.1+random()*.14;
      for(let repeat=0;repeat<15;repeat++) stones.push([x,-.055,18-z-repeat*18,w,.065,d]);
    }
    batches(this.ballast,stones,0x9aa3ae);
    for(const side of [-1,1]) {
      part(this.scene,side*6.6,-.05,-99,5.0,.65,274,0xc0aeb9);
      part(this.scene,side*4.23,.3,-99,.3,.09,274,0xffd958);
      part(this.scene,side*4.45,.3,-99,.12,.095,274,0xf5f1d6);
    }
    this.platformMarks = new T.Group(); this.scene.add(this.platformMarks);
    const marks=[];
    for(const side of [-1,1])for(let i=0;i<120;i++)marks.push([side*4.72,.3,16-i*2.4,.37,.025,.06]);
    batches(this.platformMarks,marks,0x927b99);
  }

  makeCity() {
    const random=rng(19276);
    const palette=[0xf8b344,0xed7c91,0x817dc8,0x65c3c2,0xe4a46a,0xf7cc6a];
    // Recycled blocks form a continuous neighborhood, with windows batched per block.
    for(let i=0;i<15;i++) {
      const group=new T.Group(); this.scene.add(group);
      for(const side of [-1,1]) {
        const height=8+random()*12, x=side*(11.5+random()*2);
        const color=palette[(i+(side===1?2:0))%palette.length];
        this.building(group,x,height,color,side,i,random);
        if(i%3===0)this.tree(group,side*7.4,.32,-4);
        else if(i%3===1)this.lamp(group,side*5.4,-3);
        else this.platformProps(group,side,-3,i);
        if(i%5===3) {
          const train=this.train(i%3); train.position.set(side*7,.38,-11);
          train.scale.set(.98,1.08,1.1); group.add(train);
        }
      }
      consolidate(group);
      this.moving.push({mesh:group,base:-i*18,period:270,front:22});
    }
    // Gantries, signs, station roofs and bridge spans pass over the runner.
    for(let i=0;i<6;i++) {
      const group=new T.Group(); this.scene.add(group);
      for(const x of [-4.7,4.7]) {
        part(group,x,4.2,0,.25,8.4,.28,0x476187);
        part(group,x,.55,0,.65,.8,.65,0x8996a6);
      }
      part(group,0,8.1,0,9.7,.34,.35,0x476187);
      for(const x of [-2.4,0,2.4]) {
        part(group,x,7.5,0,.09,1.05,.09,0x334d69);
        part(group,x,7.15,-20,.04,.045,42,0x395570);
      }
      if(i%2===0) {
        board(group,i%4===0?'BUZZLINE':'KEEP BUZZING',0,6.8,.28,4.4,1.05,'#273b70','#ffdf66',i%4===0?'FLYWAY CENTRAL  /  03':'NO SWATTERS ALLOWED');
      }
      if(i%3===1) this.station(group);
      consolidate(group);
      this.moving.push({mesh:group,base:-i*45-8,period:270,front:24});
    }
  }

  building(group,x,height,color,side,index,random) {
    const depth=15;
    part(group,x,height/2,-6,6.8,height,depth,color);
    part(group,x,height+.15,-6,7.1,.35,depth+.35,0xf5dcbb);
    part(group,x,3.5,-6,7.05,.28,depth+.2,0xfbe0b3);
    part(group,x,.7,1.65,7,1.5,.3,0x657598);
    const front=[],glints=[];
    for(let y=5;y<height-1;y+=2.65)for(let dx=-2.2;dx<3;dx+=2.2) {
      front.push([x+dx,y,1.55,1.32,1.6,.055]);
      glints.push([x+dx-.38,y+.2,1.59,.12,1.1,.035]);
    }
    for(let z=-12;z<1;z+=2.8)for(let y=5;y<height-1;y+=2.65) {
      front.push([x-side*3.43,y,z,.045,1.6,1.42]);
      glints.push([x-side*3.46,y+.2,z+.3,.04,1.1,.12]);
    }
    batches(group,front,0x285776); batches(group,glints,0xa1e0e2);
    part(group,x,1.9,1.68,3.7,2.65,.07,0x27506c);
    part(group,x,3.1,2.1,5,.2,1.2,index%2?0xed5367:0x367cca);
    for(let j=0;j<6;j++)part(group,x-2.08+j*.83,3.0,2.25,.4,.22,1.45,0xffe8b5);
    if(index%3===0) {
      board(group,['BUZZ MART','NEXT STOP','FLY HIGH'][Math.floor(index/3)%3],x,4.1,1.77,4.6,.95,'#304770','#ffdf71');
      // Track-facing poster, a real game-world sign rather than screen decoration.
      const assembly=new T.Group();
      board(assembly,index%2?'RUN!':'BUZZ',0,0,.04,2.9,2.2,'#f66b92','#fff0b0');
      assembly.position.set(x-side*3.53,2.1,-6);assembly.rotation.y=-side*Math.PI/2;group.add(assembly);
    }
    if(index%2===0) {
      part(group,x+.8,height+1.2,-7,1.4,2,1.4,0x5f7d9b,CYLINDER);
      part(group,x+.8,height+2.3,-7,1.6,.2,1.6,0x314c6a,CYLINDER);
      for(const dx of [-.7,.7])part(group,x+.8+dx,height+.3,-7,.08,1,.09,0x3f5876);
    }
    if(random()>.55) {
      part(group,x-1.5,height+1,-6,.06,2,.06,0x4a5779);
      part(group,x-1.5,height+1.7,-6,2,.05,.05,0x4a5779);
    }
  }

  tree(group,x,y,z) {
    part(group,x,y+.22,z,1.55,.4,1.55,0x997681);
    part(group,x,y+1.4,z,.22,2.5,.22,0x956549);
    for(const [dx,dy,dz,s] of [[0,3.5,0,1.5],[-.65,2.9,.2,1.1],[.7,3.1,-.25,1.2],[.25,4.15,0,.95]]) {
      const leaf=part(group,x+dx,y+dy,z+dz,s,s,s,dy>3.5?0x9dc354:0x52a774,SPHERE);leaf.scale.y*=1.05;
    }
  }
  lamp(group,x,z) {
    part(group,x,3.35,z,.12,6.3,.12,0x345879);
    part(group,x,6.3,z-.5,.13,.15,1.25,0x345879);
    part(group,x,6.15,z-1.15,.62,.17,.8,0x284c6b);
    part(group,x,6.04,z-1.15,.48,.025,.64,glow(0xffecc0));
  }
  platformProps(group,side,z,index) {
    const x=side*6.8;
    for(const dx of [-.85,.85])part(group,x+dx,.69,z,.1,.75,.8,0x37597d);
    part(group,x,1.03,z,2.4,.15,.75,index%2?0x995bc1:0xf9b552);
    part(group,x,1.57,z-.4,2.4,.95,.12,index%2?0x995bc1:0xf9b552);
    part(group,x+side*1.7,.86,z,.5,1.1,.5,0x3ca49f,CYLINDER);
    part(group,x+side*1.7,1.45,z,.56,.08,.56,0x287b85,CYLINDER);
  }
  station(group) {
    for(const x of [-5.2,5.2])for(const z of [-12,-5,2])part(group,x,4.35,z,.28,8.7,.28,0x6e6586);
    part(group,0,8.8,-5,12,.25,16,0x6d78ad);
    part(group,0,9.0,-5,11.2,.08,15.7,0x9dbfd2);
    for(let z=-12;z<4;z+=3.5)part(group,0,8.58,z,11.6,.15,.15,0x354d7b);
    for(const side of [-1,1]) {
      part(group,side*5.4,8.52,-5,.35,.14,15.5,glow(0xffe9a2));
      board(group,side===1?'03':'01',side*4.8,5.55,2.2,.8,.8,'#264779','#fff0bc');
    }
  }

  makeSkyline() {
    const rand=rng(888);
    for(let i=0;i<28;i++) {
      const x=(i-13.5)*5.3, height=13+rand()*29, z=-177-rand()*48;
      part(this.sky,x,height/2-2,z,4.7+rand()*2,height,7, [0x76a5bf,0x83b6c9,0x6f9fbd,0x8ac0ce][i%4]);
      part(this.sky,x,height-1.6,z,4.5,.4,7.2,0xb8d5d4);
      if(i%4===0)part(this.sky,x,height+2.5,z,.3,7,.3,0x8aacc3);
    }
    // Sky objects are beyond the running surface and never obstruct the lanes.
    const sun=part(this.sky,45,46,-195,12,12,2,glow(0xffecb1,false),SPHERE);
    sun.castShadow=false;
    for(let i=0;i<10;i++) {
      const x=-83+i*19,y=33+rand()*21,z=-175-rand()*35;
      for(let j=0;j<3;j++) {
        const cloud=part(this.sky,x+j*3.2,y+(j===1?1:0),z,4.9,2.3+j*.3,2.2,glow(0xe3f5ec,false),SPHERE);
        cloud.castShadow=false;
      }
    }
    // The distant rail bridge frames the tracks and creates a recognizable destination.
    for(const x of [-5.2,5.2])part(this.sky,x,8,-188,2,16,9,0x6487a7);
    part(this.sky,0,15,-188,13,4,9,0x6487a7);
    board(this.sky,'FLYWAY CENTRAL',0,15,-182.95,11,1.4,'#305882','#fff0b5');
    consolidate(this.sky);
  }

  train(variant=0) {
    const group=new T.Group();
    const body=[0xf3984f,0x6e9adb,0xed648b][variant%3];
    const band=[0x245590,0x5e53a4,0x743a89][variant%3];
    const length=TRAIN_LENGTH;
    part(group,0,.42,-length/2,1.9,.6,length-.12,0x26374e);
    part(group,0,1.72,-length/2,2.0,2.48,length-.16,body);
    part(group,0,3.05,-length/2,2.06,.22,length-.14,0xffe9be);
    part(group,0,2.65,-length/2,2.025,.47,length-.12,band);
    part(group,0,.94,-length/2,2.025,.35,length-.12,band);
    // Nose is at z=0; every carriage extends backwards from its collision anchor.
    part(group,0,2.13,-.055,1.64,.94,.075,0x173d5b);
    part(group,0,2.16,-.009,.075,1,.04,0xeeeacb);
    part(group,-.52,2.3,-.01,.22,.56,.035,0x78c6d9);
    part(group,.5,2.3,-.01,.22,.56,.035,0x78c6d9);
    part(group,0,.61,.045,1.55,.22,.16,0x33445c);
    for(const x of [-.66,.66]) {
      part(group,x,1.18,.017,.25,.2,.06,glow(0xfff2ad));
      part(group,x,1.18,-length+.065,.17,.17,.06,0xee5d63);
    }
    board(group,'BUZZ',0,2.83,.025,.87,.2,'#173753','#fdec95');
    for(const side of [-1,1]) {
      for(let i=0;i<4;i++) {
        const z=-1.25-i*2.2;
        part(group,side*1.012,2.08,z,.032,.89,1.42,0x244e75);
        part(group,side*1.035,2.18,z+.42,.025,.6,.15,0x95d6e0);
        part(group,side*1.025,1.38,z,.035,.028,1.45,0xf7d297);
      }
      for(const z of [-1.4,-8.5]) {
        const wheel=part(group,side*.9,.27,z,.26,.18,.26,0x26374a,CYLINDER);
        wheel.rotation.z=Math.PI/2;
      }
    }
    part(group,0,3.26,-5,1.4,.23,2.0,0x849ab1);
    for(let z=-5.7;z<-4.1;z+=.25)part(group,0,3.39,z,1.15,.025,.06,0x536d88);
    return consolidate(group);
  }

  obstacle(type,variant=0) {
    if(type==='block')return this.train(variant);
    const group=new T.Group();
    const barY=type==='hurdle'?.71:2.04;
    const barH=type==='hurdle'?.46:.87;
    for(const x of [-.87,.87]) {
      part(group,x,barY/2,-.35,.14,barY,.22,0x47647f);
      part(group,x,.07,-.35,.44,.14,.67,0x3b526b);
    }
    part(group,0,barY,-.35,1.94,barH,.65,0xfff0bc);
    const stripeWidth=.27;
    for(let i=-3;i<=3;i++) {
      const stripe=part(group,i*.27,barY,-.016,stripeWidth*.55,barH*.92,.017,0xf04e62);
      stripe.rotation.z=-.25;
    }
    for(const x of [-.88,.88])part(group,x,barY+barH/2+.14,-.35,.13,.15,.13,glow(0xffb343),SPHERE);
    return consolidate(group);
  }

  update(distance,time) {
    this.sleepers.position.z=distance%1.8;
    this.ballast.position.z=distance%18;
    this.platformMarks.position.z=distance%2.4;
    for(const item of this.moving) {
      item.mesh.position.z=((item.base+distance-item.front)%item.period+item.period)%item.period+item.front-item.period;
    }
    this.sky.position.x=Math.sin(time*.045)*.5;
  }
}

