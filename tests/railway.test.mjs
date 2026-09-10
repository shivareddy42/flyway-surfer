import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {Railway} from '../dist/railway.js';
import {TRAIN_LENGTH} from '../dist/core.js';

// Geometry checks without creating a renderer. Sign drawing is irrelevant to the bounds.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){}})})};
const scene=new T.Scene(),railway=new Railway(scene);
for(let color=0;color<3;color++) {
  const train=railway.train(color),bounds=new T.Box3().setFromObject(train);
  assert.ok(bounds.min.z>=-TRAIN_LENGTH-.15);
  assert.ok(bounds.max.z<=.2);
  assert.ok(bounds.max.z-bounds.min.z>TRAIN_LENGTH-.2);
  assert.ok(bounds.max.x<=1.12&&bounds.min.x>=-1.12);
  let draws=0;train.traverse(o=>{if(o.isMesh)draws++;});
  assert.ok(draws<26,`Train should batch repetitive details: ${draws} draws`);
}
for(const type of ['hurdle','overhead']) {
  const bounds=new T.Box3().setFromObject(railway.obstacle(type));
  assert.ok(bounds.min.z>-.8&&bounds.max.z<.2);
  assert.ok(bounds.max.x<=1.1);
}
railway.update(0,0);
const before=railway.moving.map(p=>p.mesh.position.z);
railway.update(270,1);
railway.moving.forEach((p,i)=>assert.ok(Math.abs(p.mesh.position.z-before[i])<1e-8,'Scenery loop must be seamless'));
let draws=0,instances=0;
scene.traverse(o=>{if(o.isMesh){draws++;instances+=o.isInstancedMesh?o.count:1;}});
console.log(`Rail-yard geometry passed. Environment: ${draws} mesh draws for ${instances} visible pieces before culling.`);
