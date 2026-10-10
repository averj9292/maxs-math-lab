'use strict';
/* Offline, deterministic learning rules. No accounts, networking or tracking. */
(function(root){
const SKILLS=[
{id:'count1',name:'Counting within 10',grade:1,description:'Count up to ten objects.',kind:'count1',prereq:[]},
{id:'add1-five',name:'Add within 5',grade:1,description:'Put small groups together.',kind:'add1-five',prereq:['count1']},
{id:'add1-ten',name:'Add within 10',grade:1,description:'Practise addition within ten.',kind:'add1-ten',prereq:['add1-five']},
{id:'sub1-ten',name:'Subtract within 10',grade:1,description:'Take away from groups up to ten.',kind:'sub1-ten',prereq:['add1-ten']},
{id:'add-facts',name:'Addition foundations',grade:2,description:'Build confidence adding within 20.',kind:'add',min:1,max:19,prereq:[]},
{id:'sub-facts',name:'Subtraction foundations',grade:2,description:'Understand taking away within 20.',kind:'sub',min:1,max:20,prereq:['add-facts']},
{id:'add2-no',name:'Two-digit addition',grade:2,description:'Add tens and ones without regrouping.',kind:'add2-no',prereq:['add-facts']},
{id:'add2-carry',name:'Regroup in addition',grade:2,description:'Trade 10 ones for one ten.',kind:'add2-carry',prereq:['add2-no']},
{id:'sub2-no',name:'Two-digit subtraction',grade:2,description:'Subtract tens and ones without regrouping.',kind:'sub2-no',prereq:['sub-facts']},
{id:'sub2-borrow',name:'Regroup in subtraction',grade:2,description:'Trade one ten for 10 ones.',kind:'sub2-borrow',prereq:['sub2-no','add2-carry']},
{id:'add3-no',name:'Three-digit addition',grade:3,description:'Add hundreds, tens and ones.',kind:'add3-no',prereq:['add2-carry']},
{id:'add3-carry',name:'Three-digit regrouping',grade:3,description:'Regroup across hundreds, tens and ones.',kind:'add3-carry',prereq:['add3-no']},
{id:'sub3-no',name:'Three-digit subtraction',grade:3,description:'Subtract hundreds, tens and ones.',kind:'sub3-no',prereq:['sub2-borrow']},
{id:'sub3-borrow',name:'Three-digit borrowing',grade:3,description:'Regroup across place values.',kind:'sub3-borrow',prereq:['sub3-no']},
{id:'sub3-zero',name:'Borrowing across zero',grade:3,description:'Solve problems such as 403 − 178.',kind:'sub3-zero',prereq:['sub3-borrow']},
{id:'missing',name:'Find the missing number',grade:3,description:'Use inverse operations to solve an equation.',kind:'missing',prereq:['add2-carry','sub2-borrow']},
{id:'story',name:'Math in the real world',grade:3,description:'Decide whether to add or subtract in a word problem.',kind:'story',prereq:['missing']},
{id:'mixed4',name:'Mixed multi-step challenge',grade:4,description:'Choose a strategy for two-step problems.',kind:'multi',prereq:['story','sub3-zero','add3-carry']}
,{id:'equal-groups',name:'Equal groups',grade:2,description:'Count objects in equal groups.',kind:'groups',prereq:['add-facts']}
,{id:'multiply-2-5-10',name:'Times tables: 2, 5 and 10',grade:3,description:'Use skip-counting and arrays for multiplication.',kind:'times-easy',prereq:['equal-groups']}
,{id:'multiply-3-4',name:'Times tables: 3 and 4',grade:3,description:'Multiply by 3 and 4 using groups.',kind:'times-middle',prereq:['multiply-2-5-10']}
,{id:'multiply-6-9',name:'Times tables: 6 to 9',grade:4,description:'Build efficient multiplication strategies.',kind:'times-harder',prereq:['multiply-3-4']}
,{id:'divide-equal',name:'Sharing equally',grade:3,description:'Share a collection evenly.',kind:'divide-equal',prereq:['equal-groups']}
,{id:'divide-facts',name:'Division facts',grade:3,description:'Undo multiplication with division.',kind:'divide-facts',prereq:['multiply-2-5-10','divide-equal']}
,{id:'fraction-halves',name:'Halves, thirds and quarters',grade:2,description:'Identify equal parts of a whole.',kind:'fraction-parts',prereq:['add-facts']}
,{id:'fraction-of-set',name:'Fractions of a group',grade:3,description:'Find one-half, one-third or one-quarter of a collection.',kind:'fraction-set',prereq:['fraction-halves']}
,{id:'fraction-equivalent',name:'Equivalent fractions',grade:4,description:'Build equivalent fractions with visual models.',kind:'fraction-equivalent',prereq:['fraction-of-set']}
,{id:'measurement-length',name:'Length and centimetres',grade:2,description:'Measure, compare and add lengths.',kind:'measure-length',prereq:['add-facts']}
,{id:'measurement-convert',name:'Metres and centimetres',grade:3,description:'Convert between cm and m.',kind:'measure-convert',prereq:['measurement-length']}
,{id:'measurement-mass',name:'Grams and kilograms',grade:3,description:'Connect grams to kilograms.',kind:'measure-mass',prereq:['measurement-length']}
,{id:'time-clock',name:'Reading the clock',grade:2,description:'Read hours and minutes on a clock.',kind:'time-clock',prereq:['add-facts']}
,{id:'time-elapsed',name:'Elapsed time',grade:3,description:'Find how long an activity takes.',kind:'time-elapsed',prereq:['time-clock']}
,{id:'money-coins',name:'Counting Canadian coins',grade:2,description:'Add coins to make a total in cents.',kind:'money-coins',prereq:['add-facts']}
,{id:'geometry-shapes',name:'2D shape properties',grade:2,description:'Identify sides and corners.',kind:'shape-sides',prereq:['add-facts']}
,{id:'geometry-perimeter',name:'Perimeter',grade:3,description:'Measure distance around shapes.',kind:'perimeter',prereq:['geometry-shapes']}
,{id:'geometry-area',name:'Area with square units',grade:3,description:'Count rows and columns of squares.',kind:'area',prereq:['equal-groups','geometry-shapes']}
,{id:'geometry-angles',name:'Angles',grade:4,description:'Recognize and measure common angles.',kind:'angles',prereq:['geometry-shapes']}
,{id:'data-graphs',name:'Reading picture graphs',grade:2,description:'Compare quantities from simple graphs.',kind:'data-graphs',prereq:['add-facts']}

];
const byId=id=>SKILLS.find(s=>s.id===id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const randomInt=(rng,lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
const digits=n=>[n%10,Math.floor(n/10)%10,Math.floor(n/100)%10,Math.floor(n/1000)%10];
function qualifies(kind,a,b){const x=digits(a),y=digits(b);const carry=x[0]+y[0]>=10,carryT=x[1]+y[1]+(carry?1:0)>=10;const borrow=x[0]<y[0],borrowT=x[1]-(borrow?1:0)<y[1];
switch(kind){case 'add2-no':return a+b<100&&!carry;case 'add2-carry':return a+b<100&&carry;case 'sub2-no':return a>b&&!borrow;case 'sub2-borrow':return a>b&&borrow;case 'add3-no':return a+b<1000&&!carry&&!carryT;case 'add3-carry':return a+b<1000&&(carry||carryT);case 'sub3-no':return a>b&&!borrow&&!borrowT;case 'sub3-borrow':return a>b&&(borrow||borrowT);case 'sub3-zero':return a>b&&x[1]===0&&x[0]<y[0]&&x[2]>0;default:return true;}}
function problem(skillId,rng=Math.random,avoid=[]){const s=byId(skillId)||SKILLS[0];const k=s.kind;let a,b,op,story='',answer,steps=[];for(let t=0;t<1000;t++){
if(k==='count1'){const n=randomInt(rng,1,10);return {a:n,b:0,op:'count',answer:n,skillId,story:'How many stars can you count?',visual:'count1',signature:skillId+':'+n};}
if(k==='add1-five'||k==='add1-ten'){const max=k==='add1-five'?5:10;const x=randomInt(rng,1,max-1),y=randomInt(rng,1,max-x);return {a:x,b:y,op:'+',answer:x+y,skillId,story:'',signature:skillId+':'+x+'+'+y};}
if(k==='sub1-ten'){const x=randomInt(rng,2,10),y=randomInt(rng,1,x-1);return {a:x,b:y,op:'−',answer:x-y,skillId,story:'',signature:skillId+':'+x+'-'+y};}
if(['groups','times-easy','times-middle','times-harder','divide-equal','divide-facts','fraction-parts','fraction-set','fraction-equivalent','measure-length','measure-convert','measure-mass','time-clock','time-elapsed','money-coins','shape-sides','perimeter','area','angles','data-graphs'].includes(k)){
 const pick=(list)=>list[randomInt(rng,0,list.length-1)];
 const set=(aa,bb,symbol,result,prompt,extra={})=>({a:aa,b:bb,op:symbol,answer:result,skillId,story:prompt,steps:[],...extra,signature:skillId+':'+aa+':'+bb+':'+symbol+':'+result});
 if(k==='groups'){const g=randomInt(rng,2,6),size=randomInt(rng,2,5);return set(g,size,'×',g*size,g+' groups of '+size+' counters. How many counters altogether?',{visual:'groups'});}
 if(k.startsWith('times-')){const factor=k==='times-easy'?pick([2,5,10]):k==='times-middle'?pick([3,4]):pick([6,7,8,9]);const other=randomInt(rng,2,10);return set(factor,other,'×',factor*other,'How much is '+factor+' × '+other+'?',{visual:'groups'});}
 if(k.startsWith('divide')){const size=randomInt(rng,2,k==='divide-equal'?5:10);const groups=randomInt(rng,2,k==='divide-equal'?6:10);return set(groups*size,groups,'÷',size, k==='divide-equal'?'Share '+(groups*size)+' counters equally between '+groups+' friends. How many does each friend get?':'What is '+(groups*size)+' ÷ '+groups+'?',{visual:'groups'});}
 if(k==='fraction-parts'){const denom=pick([2,3,4,6,8]);return set(1,denom,'fraction',denom,'One shape is split into '+denom+' equal pieces. How many pieces make one whole?',{visual:'fraction',parts:denom,shaded:1});}
 if(k==='fraction-set'){const denominator=pick([2,3,4]);const numerator=randomInt(rng,2,7);const total=denominator*numerator;return set(total,denominator,'fraction',numerator,'What is 1/'+denominator+' of '+total+' counters?',{visual:'fraction-set',parts:denominator});}
 if(k==='fraction-equivalent'){const denom=pick([2,3,4,5]);const mult=pick([2,3]);return set(1,denom,'fraction',denom*mult,'1/'+denom+' = '+mult+'/'+String.fromCharCode(9633)+'. What number belongs in the box?',{visual:'fraction',parts:denom,shaded:1});}
 if(k==='measure-length'){const x=randomInt(rng,5,40),y=randomInt(rng,4,35);return set(x,y,'+',x+y,'A ribbon is '+x+' cm long. Another is '+y+' cm. How long are they together (in cm)?',{visual:'ruler'});}
 if(k==='measure-convert'){const metres=randomInt(rng,1,9);return set(metres,100,'×',metres*100,metres+' metres = how many centimetres?',{visual:'ruler'});}
 if(k==='measure-mass'){const kg=randomInt(rng,1,9);return set(kg,1000,'×',kg*1000,kg+' kilograms = how many grams?',{visual:'measure-mass'});}
 if(k==='time-clock'){const hour=randomInt(rng,1,12);const minute=pick([0,15,30,45]);return set(hour,minute,'clock',minute,'The clock shows '+hour+':'+String(minute).padStart(2,'0')+'. How many minutes past the hour?',{visual:'clock'});}
 if(k==='time-elapsed'){const start=randomInt(rng,7,16),dur=pick([15,30,45,60,90]);const end=start*60+dur;const endHour=Math.floor(end/60)%12||12;const endMinute=end%60;return set(start,dur,'elapsed',dur,'An activity starts at '+(start%12||12)+':00 and ends at '+endHour+':'+String(endMinute).padStart(2,'0')+'. How many minutes pass?',{visual:'clock',startHour:start%12||12,startMinute:0,endHour,endMinute});}
 if(k==='money-coins'){const values=[5,10,25,100],coin=pick(values),number=randomInt(rng,2,coin===100?5:8);return set(coin,number,'×',coin*number,'You have '+number+' coins worth '+coin+' cents each. How many cents altogether?',{visual:'coins'});}
 if(k==='shape-sides'){const shapes=[[3,'triangle'],[4,'square'],[5,'pentagon'],[6,'hexagon'],[8,'octagon']];const row=pick(shapes);return set(row[0],0,'shape',row[0],'How many sides does a '+row[1]+' have?',{visual:'shape',sides:row[0]});}
 if(k==='perimeter'){const x=randomInt(rng,3,20),y=randomInt(rng,2,14);return set(x,y,'perimeter',2*(x+y),'A rectangle is '+x+' cm long and '+y+' cm wide. What is its perimeter in cm?',{visual:'rectangle'});}
 if(k==='area'){const x=randomInt(rng,2,10),y=randomInt(rng,2,10);return set(x,y,'area',x*y,'A rectangle has '+x+' rows of '+y+' square tiles. How many square tiles cover it?',{visual:'area'});}
 if(k==='angles'){const degrees=pick([45,90,120,180]);return set(degrees,0,'angle',degrees,'What is the angle shown, in degrees?',{visual:'angle',degrees});}
 if(k==='data-graphs'){const x=randomInt(rng,3,15),y=randomInt(rng,1,15);return set(x,y,'graph',Math.abs(x-y),'A graph shows '+x+' apples and '+y+' pears. How many more of one than the other?',{visual:'graph'});}
}

if(k==='add'||k==='sub'){a=randomInt(rng,2,19);b=randomInt(rng,1,Math.max(1,k==='sub'?a-1:20-a));op=k==='add'?'+':'−';}
else if(k.startsWith('add2')||k.startsWith('sub2')){a=randomInt(rng,21,k.startsWith('add')?87:89);b=randomInt(rng,11,Math.min(k.startsWith('add')?99-a:a-1,78));op=k.startsWith('add')?'+':'−';}
else if(k.startsWith('add3')||k.startsWith('sub3')){a=randomInt(rng,k==='sub3-zero'?300:120,k.startsWith('add')?887:899);b=randomInt(rng,101,Math.min(k.startsWith('add')?999-a:a-1,799));op=k.startsWith('add')?'+':'−';}
else if(k==='missing'){a=randomInt(rng,15,75);b=randomInt(rng,11,Math.min(95-a,60));op='+';}
else if(k==='story'){a=randomInt(rng,24,95);b=randomInt(rng,12,Math.min(a-1,55));op=rng()<.5?'+':'−';}
else {a=randomInt(rng,110,490);b=randomInt(rng,21,180);const c=randomInt(rng,11,99);op='multi';steps=[a,b,c];}
if(a===undefined||b===undefined)continue;
if(k.startsWith('add')||k.startsWith('sub')){if(!qualifies(k,a,b))continue;}
const signature=`${skillId}:${a}:${op}:${b}:${steps[2]||''}`;
if(!avoid.includes(signature)||t>800)break;
}
if(op==='multi'){answer=a+b-steps[2];story=`A library has ${a} books. It receives ${b} more and lends out ${steps[2]}. How many books are there now?`;}
else if(k==='missing'){answer=b;story=`${a} + □ = ${a+b}`;}
else if(k==='story'){answer=op==='+'?a+b:a-b;story=op==='+'?`A class collected ${a} stickers, then collected ${b} more. How many stickers altogether?`:`A class had ${a} stickers and gave away ${b}. How many are left?`;}
else answer=op==='+'?a+b:a-b;
return {a,b,op,answer,skillId,story,steps,signature:`${skillId}:${a}:${op}:${b}:${steps[2]||''}`};}
function fresh(){return {version:3,records:{},mastered:[],recent:[],completed:0,reviewClock:0,history:[],support:null,supportCooldown:0};}
function normalize(v){const x=fresh();if(!v||typeof v!=='object')return x;x.records=v.records&&typeof v.records==='object'?v.records:{};x.mastered=Array.isArray(v.mastered)?v.mastered.filter(id=>!!byId(id)):[];x.recent=Array.isArray(v.recent)?v.recent.slice(-30):[];x.completed=Number.isFinite(v.completed)?Math.max(0,v.completed):0;x.history=Array.isArray(v.history)?v.history.slice(-120):[];x.support=v.support&&byId(v.support.target)&&byId(v.support.foundation)&&Number.isInteger(v.support.remaining)&&v.support.remaining>0?{target:v.support.target,foundation:v.support.foundation,remaining:Math.min(2,v.support.remaining),startedAt:v.support.startedAt||0}:null;x.supportCooldown=Number.isFinite(v.supportCooldown)?v.supportCooldown:0;return x;}
function available(data){return SKILLS.filter(s=>s.prereq.every(id=>data.mastered.includes(id)));}
function masteryStatus(data,id){
const r=data.records[id]||[];
let streak=0;
for(let i=r.length-1;i>=0;i--){
 const x=r[i];
 if(!x.correct||x.help||x.retried)break;
 streak++;
}
return {attempts:r.length,streak:Math.min(streak,5),mastered:data.mastered.includes(id)};
}
/* Responsive coaching is a practice heuristic, not a diagnosis.
 Two recent supported/missed attempts trigger two foundation exercises, then retry
 the original skill. A cooldown prevents endless intervention loops. */
function supportSuggestion(data,id){
 const skill=byId(id);if(!skill||!skill.prereq.length)return null;
 if(data.support&&data.support.remaining>0)return null;
 const last=(data.records[id]||[]).slice(-4);
 const struggles=last.filter(x=>!x.correct||x.help||x.retried).length;
 if(last.length<3||struggles<2)return null;
 if(data.supportCooldown&&data.completed-data.supportCooldown<6)return null;
 return {target:id,foundation:skill.prereq[0],remaining:2,startedAt:data.completed};
}
function nextSkill(data,allowed){
 const candidates=allowed.filter(s=>s&&available(data).some(v=>v.id===s.id));
 const support=data.support;
 if(support&&support.remaining>0){
  const base=byId(support.foundation);
  if(base&&candidates.some(x=>x.id===base.id))return {skill:base,coaching:true,returnTo:support.target};
 }
 const open=candidates.length?candidates:[byId('add-facts')];
 const due=open.filter(s=>data.mastered.includes(s.id)&&data.completed-(data.history.filter(h=>h.id===s.id).at(-1)?.at||0)>=15);
 if(data.completed%5===0&&due.length)return {skill:due[0],review:true};
 const needs=open.filter(s=>!data.mastered.includes(s.id));
 // Rotate eligible unmastered skills only among the first few.
 const first=needs.slice(0,3);
 if(first.length)return {skill:first[Math.floor(data.completed/3)%first.length],review:false};
 return {skill:open[data.completed%open.length],review:true};
}
function choose(data){const open=available(data);const unmastered=open.filter(s=>!data.mastered.includes(s.id));const due=data.mastered.filter(id=>{const h=data.history.filter(x=>x.id===id).at(-1);return h&&data.completed-h.at>=Math.min(20,5+Math.floor((h.reviews||0)*3));});
// Every fifth completed question, revisit a mastered skill due for review.
if(due.length&&data.completed>0&&data.completed%5===0)return {skill:byId(due[0]),review:true};
if(unmastered.length){const s=unmastered.sort((a,b)=>SKILLS.indexOf(a)-SKILLS.indexOf(b))[0];return {skill:s,review:false};}
return {skill:SKILLS[data.completed%SKILLS.length],review:true};}
function record(data,id,{correct,help=false,retried=false}){const row={correct:!!correct,help:!!help,retried:!!retried};const arr=data.records[id]||(data.records[id]=[]);arr.push(row);if(arr.length>40)arr.shift();data.completed++;data.history.push({id,at:data.completed,correct:row.correct});if(data.history.length>120)data.history.shift();// Complete at least 10 questions for this skill, and finish with 5 correct
// on the first attempt in a row. Hints and retries are welcome, but restart
// this five-question streak. Stars and other progress are never taken away.
if(data.support&&id===data.support.foundation){
 data.support.remaining--;
 if(data.support.remaining<=0){data.support=null;data.supportCooldown=data.completed;}
}
const status=masteryStatus(data,id);
const mastered=status.attempts>=10&&status.streak>=5;
let newly=false;if(mastered&&!data.mastered.includes(id)){data.mastered.push(id);newly=true;}
// Reopen a skill if repeated review errors indicate fragile understanding.
if(data.mastered.includes(id)&&arr.slice(-4).length===4&&arr.slice(-4).filter(x=>!x.correct).length>=2){data.mastered=data.mastered.filter(x=>x!==id);}
const suggestion=supportSuggestion(data,id);
if(suggestion)data.support=suggestion;
return {newlyMastered:newly,status:masteryStatus(data,id),supportStarted:!!suggestion};}
/* Original optional mental-math models, using common number-sense strategies. */
function cleverStrategy(p){
 if(!p||!Number.isInteger(p.a)||!Number.isInteger(p.b))return null;
 if(p.story&&p.skillId==='missing')return null;
 const a=p.a,b=p.b,op=p.op;
 const pack=(name,steps,parts)=>({name,steps,parts});
 if(op==='+'&&a>=0&&b>=0){
  if(a<10&&b<10&&a+b>10){
   const first=Math.max(a,b),second=Math.min(a,b),need=10-first,rest=second-need;
   if(need>0&&rest>=0)return pack('Make a 10',[
    'Look at '+first+'. How many more make 10?',
    'Break '+second+' into '+need+' and '+rest+'.',
    first+' + '+need+' = 10. Then 10 + '+rest+' = '+(a+b)+'.'
   ],[{label:'Start with',value:first},{label:'Take from '+second,value:need},{label:'Left over',value:rest},{label:'Friendly ten',value:10},{label:'Total',value:a+b}]);
  }
  if(a+b<1000){
   const big=Math.max(a,b),small=Math.min(a,b),tens=Math.floor(small/10)*10,ones=small%10;
   if(tens>0&&ones>0)return pack('Split tens and ones',[
    'Break '+small+' into '+tens+' and '+ones+'.',
    'Add the easy tens: '+big+' + '+tens+' = '+(big+tens)+'.',
    'Then add '+ones+': '+(big+tens)+' + '+ones+' = '+(big+small)+'.'
   ],[{label:'Start',value:big},{label:'Tens',value:tens},{label:'Ones',value:ones},{label:'After tens',value:big+tens},{label:'Total',value:a+b}]);
  }
  const near=10-Math.abs(b%10-10);
  if(b>=8&&b%10>=8){const up=Math.ceil(b/10)*10,diff=up-b;
   return pack('Add a friendly number',[
    'Instead of adding '+b+', add '+up+' first.',
    a+' + '+up+' = '+(a+up)+'.',
    'We added '+diff+' too many. Take away '+diff+' to get '+(a+b)+'.'
   ],[{label:'Friendly add',value:up},{label:'Too much',value:diff},{label:'Total',value:a+b}]);
  }
 }
 if(op==='−'&&a>=b&&b>=0){
  const ones=a%10;
  if(a<=30&&ones>0&&b>=ones&&b-ones<=15){
   const rest=b-ones;
   return pack('Jump back to a ten',[
    'Start at '+a+'. Take away '+ones+' to land on '+(a-ones)+'.',
    'You still need to take away '+rest+'.',
    (a-ones)+' − '+rest+' = '+(a-b)+'.'
   ],[{label:'Start',value:a},{label:'First jump',value:ones},{label:'Friendly ten',value:a-ones},{label:'Next jump',value:rest},{label:'Left',value:a-b}]);
  }
  if(b>0&&b%10>=8){
   const near=Math.ceil(b/10)*10,extra=near-b;
   return pack('Subtract a friendly number',[
    'Subtract '+near+' instead of '+b+'.',
    a+' − '+near+' = '+(a-near)+'.',
    'That was '+extra+' too much. Add '+extra+' back to get '+(a-b)+'.'
   ],[{label:'Start',value:a},{label:'Subtract',value:near},{label:'Add back',value:extra},{label:'Left',value:a-b}]);
  }
  const tens=Math.floor(b/10)*10,small=b%10;
  if(tens>0&&small>0)return pack('Split what you take away',[
   'Break '+b+' into '+tens+' and '+small+'.',
   'First take away '+tens+': '+a+' − '+tens+' = '+(a-tens)+'.',
   'Then take away '+small+': '+(a-tens)+' − '+small+' = '+(a-b)+'.'
  ],[{label:'Start',value:a},{label:'Tens',value:tens},{label:'Ones',value:small},{label:'Left',value:a-b}]);
 }
 return null;
}
function teaching(p){
if(p.visual==='count1')return ['Point to the first star.','Touch each star while counting: one, two, three…','The total is '+p.answer+' stars.'];
if(p.visual){
 if(p.visual==='groups')return p.op==='÷'?[ 'Draw '+p.b+' circles for the groups.', 'Share '+p.a+' counters one at a time, equally.', 'Count one group: '+p.answer+' counters.' ]:[ 'Draw '+p.a+' equal groups with '+p.b+' in each.', 'Skip-count by '+p.b+': '+Array.from({length:p.a},(_,i)=>(i+1)*p.b).join(', ')+'.', 'There are '+p.answer+' altogether.' ];
 if(p.visual==='fraction')return ['The bottom number tells how many EQUAL parts make a whole.', 'One part out of '+p.parts+' means one-'+p.parts+'.', 'Look at the shaded part; then answer the question.'];
 if(p.visual==='fraction-set')return ['Make '+p.parts+' equal groups from '+p.a+' counters.', 'Every group gets the same number.', 'One group has '+p.answer+' counters.'];
 if(p.visual==='shape')return ['Trace around the edges of the shape.', 'Count each straight side once.', 'This shape has '+p.answer+' sides.'];
 if(p.visual==='rectangle')return ['Perimeter means the distance all the way around.', 'Add length and width twice: '+p.a+' + '+p.b+' + '+p.a+' + '+p.b+'.','That is '+p.answer+' cm.'];
 if(p.visual==='area')return ['Area means how many unit squares cover a shape.', 'Count '+p.a+' rows with '+p.b+' squares in each.',p.a+' × '+p.b+' = '+p.answer+' square units.'];
 if(p.visual==='graph')return ['Look at the two bars.', 'Compare '+p.a+' and '+p.b+' by subtracting the smaller from the larger.', 'The difference is '+p.answer+'.'];
 if(p.visual==='clock')return ['One full turn of the minute hand is 60 minutes.','Check the minute hand and the time in the question.','The answer is '+p.answer+' minutes.'];
 if(p.visual==='angle')return ['A right angle is 90 degrees.','Compare the opening with a right angle.','This angle measures '+p.answer+' degrees.'];
 if(p.visual==='coins')return ['Draw '+p.b+' coins worth '+p.a+' cents each.','Skip-count by '+p.a+' cents '+p.b+' times.','The total is '+p.answer+' cents.'];
 if(p.visual==='ruler')return ['A metre is 100 centimetres.','Use the numbers in the question and your place-value strategy.','The answer is '+p.answer+'.'];
 if(p.visual==='measure-mass')return ['A kilogram is 1000 grams.','Multiply the number of kilograms by 1000.','The answer is '+p.answer+' grams.'];
 }
if(p.op==='multi')return [`First add the books: ${p.a} + ${p.b} = ${p.a+p.b}.`,`Then subtract the books lent out: ${p.a+p.b} − ${p.steps[2]} = ${p.answer}.`];if(p.skillId==='missing')return [`Think: what must we add to ${p.a} to make ${p.a+p.b}?`,`Use subtraction to undo addition: ${p.a+p.b} − ${p.a} = ${p.b}.`];
const prefix=p.story?[`Read the story. “${p.op==='+'?'More' : 'Gave away'}” helps us decide to ${p.op==='+'?'add':'subtract'}.`]:[];
const names=['ones','tens','hundreds','thousands'];const a=digits(p.a),b=digits(p.b);const max=Math.max(String(p.a).length,String(p.b).length,String(p.answer).length);let carry=0;const steps=[...prefix,`Line up the digits by place value. Start with the ones column.`];
for(let i=0;i<max;i++){if(p.op==='+'){const v=a[i]+b[i]+carry;steps.push(`In the ${names[i]} column: ${a[i]} + ${b[i]}${carry?' + 1 carried':''} = ${v}. ${v>=10?`Write ${v%10} and carry 1 to the next column.`:`Write ${v}.`}`);carry=v>=10?1:0;}
else {if(a[i]<b[i]){let j=i+1;while(j<a.length&&a[j]===0)j++;if(j>=a.length){steps.push('Check the digits: this subtraction needs a larger top number.');break;}a[j]--;for(let k=j-1;k>i;k--)a[k]=9;a[i]+=10;steps.push(j===i+1?`Trade 1 ${names[j]} for 10 ${names[i]}. Now the top ${names[i]} digit is ${a[i]}.`:`The next column has zero. Trade 1 ${names[j]} into the columns between, then trade 1 ${names[i+1]} for 10 ${names[i]}. The top ${names[i]} digit becomes ${a[i]}.`);}
steps.push(`In the ${names[i]} column: ${a[i]} − ${b[i]} = ${a[i]-b[i]}. Write ${a[i]-b[i]}.`);}}
steps.push(`Put the answer digits together: ${p.answer}.`);return steps;}
root.MathLearning={SKILLS,byId,problem,fresh,normalize,available,choose,record,masteryStatus,teaching,cleverStrategy,qualifies,nextSkill,supportSuggestion};
})(typeof window!=='undefined'?window:globalThis);
