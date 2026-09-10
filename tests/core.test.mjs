import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Run,LANES,TRAIN_LENGTH} from '../dist/core.js';
import {CircuitPilot} from '../dist/pilot.js';
const graph=JSON.parse(fs.readFileSync(new URL('../dist/data/flight-v1.json',import.meta.url),'utf8'));
function isolated(type='block'){const r=new Run(1);r.objects=[{id:9000,kind:'obstacle',type,lane:1,at:.75,done:false}];r.nextRow=99999;return r;}
test('swept collisions work even at max speed and 50ms frames',()=>{const r=isolated();r.time=200;r.step(.05);assert.equal(r.hits,1);});
test('jump and duck avoid their own obstacles',()=>{const jump=isolated('hurdle');jump.jump=.45;jump.step(.016);assert.equal(jump.hits,0);const duck=isolated('overhead');duck.duck=.5;duck.step(.016);assert.equal(duck.hits,0);});
test('jumping does not pass through a train',()=>{const r=isolated();r.jump=.45;r.step(.016);assert.equal(r.hits,1);});
test('same collision cannot hit repeatedly; three distinct hits end run',()=>{const r=isolated();for(let hit=1;hit<=3;hit++){r.invincible=0;r.objects=[{id:hit,kind:'obstacle',type:'block',lane:1,at:r.distance+.5,done:false}];r.step(.016);assert.equal(r.hits,hit);r.step(.016);assert.equal(r.hits,hit);}assert.equal(r.ended,true);const d=r.distance;r.step(.05);assert.equal(r.distance,d);});
test('15 clean seconds recover one pursuit stage',()=>{const r=isolated();r.objects=[];r.hits=2;for(let i=0;i<301;i++)r.step(.05);assert.equal(r.hits,1);});
test('manual lane actions stay bounded and restart clears run',()=>{const r=new Run(1);for(let i=0;i<8;i++)r.input('left');assert.equal(r.lane,0);for(let i=0;i<8;i++)r.input('right');assert.equal(r.lane,2);r.sugar=8;r.hits=2;r.reset(1);assert.equal(r.sugar,0);assert.equal(r.hits,0);assert.equal(r.lane,1);});
test('a carriage remains observable and collidable after its nose passes',()=>{const r=isolated();r.objects[0].at=0;r.objects[0].length=TRAIN_LENGTH;r.distance=5;const o=r.observation().obstacles[0];assert.equal(o.distance,0);assert.equal(o.tailDistance,5);r.step(.016);assert.equal(r.hits,1);assert.equal(r.objects[0].done,false);assert.equal(r.objects[0].hit,true);r.invincible=0;r.step(.016);assert.equal(r.hits,1);});
test('lane is clear once a carriage tail has passed',()=>{const r=isolated();r.objects[0].at=0;r.objects[0].length=TRAIN_LENGTH;r.distance=11;assert.equal(r.observation().obstacles.length,0);r.step(.016);assert.equal(r.hits,0);});
test('generated obstacle rows always leave a navigable lane',()=>{for(let seed=1;seed<=20;seed++){const r=new Run(seed);const rows=new Map();for(const o of r.objects.filter(x=>x.kind==='obstacle')){if(!rows.has(o.at))rows.set(o.at,new Set());rows.get(o.at).add(o.lane);}let prev=1;for(const [at,blocked]of rows){assert.ok(blocked.size<=2);const safe=r.objects.find(o=>o.kind==='sugar'&&Math.abs(o.at-(at-5))<.01).lane;assert.ok(!blocked.has(safe));assert.ok(Math.abs(safe-prev)<=1);prev=safe;}}});
test('MaleCNS graph has valid source indices and finite rates',()=>{assert.equal(graph.units.count,1072);assert.equal(graph.edges.count,26544);const p=new CircuitPilot(graph);assert.deepEqual(p.inputs.map(g=>g.length),[165,146]);assert.deepEqual(p.outputs.map(g=>g.length),[6,6]);for(let e=0;e<p.pre.length;e++){assert.ok(p.pre[e]<1072&&p.post[e]<1072);assert.ok(Number.isFinite(p.weights[e]));}p.simulate(1,0,80);assert.ok(p.left>p.right*8);for(const v of p.rates)assert.ok(Number.isFinite(v)&&v>=0&&v<=3);p.reset();p.simulate(0,1,80);assert.ok(p.right>p.left*8);});
test('circuit pilot completes reproducible seeded runs at production timing',()=>{
  for(const seed of [1,4,5,7,10,40372]) {
    const r=new Run(seed),p=new CircuitPilot(graph);let accumulator=0;
    for(let frame=0;frame<60*60&&!r.ended;frame++) {
      accumulator+=1/60;
      while(accumulator>=.05){r.input(p.update(r.observation(),.05));accumulator-=.05;}
      r.step(1/60);
    }
    assert.ok(r.time>55,`seed ${seed} ended at ${r.time}`);
    assert.ok(r.sugar>70,`seed ${seed}: ${r.sugar} sugar`);
    assert.equal(r.hits,0,`seed ${seed} should avoid first-minute collisions`);
  }
});
