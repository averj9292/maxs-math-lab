'use strict';
/* Offline, deterministic learning rules. No accounts, networking or tracking. */
(function(root){
const SKILLS=[
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
];
const byId=id=>SKILLS.find(s=>s.id===id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const randomInt=(rng,lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
const digits=n=>[n%10,Math.floor(n/10)%10,Math.floor(n/100)%10,Math.floor(n/1000)%10];
function qualifies(kind,a,b){const x=digits(a),y=digits(b);const carry=x[0]+y[0]>=10,carryT=x[1]+y[1]+(carry?1:0)>=10;const borrow=x[0]<y[0],borrowT=x[1]-(borrow?1:0)<y[1];
switch(kind){case 'add2-no':return a+b<100&&!carry;case 'add2-carry':return a+b<100&&carry;case 'sub2-no':return a>b&&!borrow;case 'sub2-borrow':return a>b&&borrow;case 'add3-no':return a+b<1000&&!carry&&!carryT;case 'add3-carry':return a+b<1000&&(carry||carryT);case 'sub3-no':return a>b&&!borrow&&!borrowT;case 'sub3-borrow':return a>b&&(borrow||borrowT);case 'sub3-zero':return a>b&&x[1]===0&&x[0]<y[0]&&x[2]>0;default:return true;}}
function problem(skillId,rng=Math.random,avoid=[]){const s=byId(skillId)||SKILLS[0];const k=s.kind;let a,b,op,story='',answer,steps=[];for(let t=0;t<1000;t++){
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
function fresh(){return {version:2,records:{},mastered:[],recent:[],completed:0,reviewClock:0,history:[]};}
function normalize(v){const x=fresh();if(!v||typeof v!=='object')return x;x.records=v.records&&typeof v.records==='object'?v.records:{};x.mastered=Array.isArray(v.mastered)?v.mastered.filter(id=>!!byId(id)):[];x.recent=Array.isArray(v.recent)?v.recent.slice(-30):[];x.completed=Number.isFinite(v.completed)?Math.max(0,v.completed):0;x.history=Array.isArray(v.history)?v.history.slice(-120):[];return x;}
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
function choose(data){const open=available(data);const unmastered=open.filter(s=>!data.mastered.includes(s.id));const due=data.mastered.filter(id=>{const h=data.history.filter(x=>x.id===id).at(-1);return h&&data.completed-h.at>=Math.min(20,5+Math.floor((h.reviews||0)*3));});
// Every fifth completed question, revisit a mastered skill due for review.
if(due.length&&data.completed>0&&data.completed%5===0)return {skill:byId(due[0]),review:true};
if(unmastered.length){const s=unmastered.sort((a,b)=>SKILLS.indexOf(a)-SKILLS.indexOf(b))[0];return {skill:s,review:false};}
return {skill:SKILLS[data.completed%SKILLS.length],review:true};}
function record(data,id,{correct,help=false,retried=false}){const row={correct:!!correct,help:!!help,retried:!!retried};const arr=data.records[id]||(data.records[id]=[]);arr.push(row);if(arr.length>40)arr.shift();data.completed++;data.history.push({id,at:data.completed,correct:row.correct});if(data.history.length>120)data.history.shift();// Complete at least 10 questions for this skill, and finish with 5 correct
// on the first attempt in a row. Hints and retries are welcome, but restart
// this five-question streak. Stars and other progress are never taken away.
const status=masteryStatus(data,id);
const mastered=status.attempts>=10&&status.streak>=5;
let newly=false;if(mastered&&!data.mastered.includes(id)){data.mastered.push(id);newly=true;}
// Reopen a skill if repeated review errors indicate fragile understanding.
if(data.mastered.includes(id)&&arr.slice(-4).length===4&&arr.slice(-4).filter(x=>!x.correct).length>=2){data.mastered=data.mastered.filter(x=>x!==id);}
return {newlyMastered:newly,status:masteryStatus(data,id)};}
function teaching(p){if(p.op==='multi')return [`First add the books: ${p.a} + ${p.b} = ${p.a+p.b}.`,`Then subtract the books lent out: ${p.a+p.b} − ${p.steps[2]} = ${p.answer}.`];if(p.skillId==='missing')return [`Think: what must we add to ${p.a} to make ${p.a+p.b}?`,`Use subtraction to undo addition: ${p.a+p.b} − ${p.a} = ${p.b}.`];
const prefix=p.story?[`Read the story. “${p.op==='+'?'More' : 'Gave away'}” helps us decide to ${p.op==='+'?'add':'subtract'}.`]:[];
const names=['ones','tens','hundreds','thousands'];const a=digits(p.a),b=digits(p.b);const max=Math.max(String(p.a).length,String(p.b).length,String(p.answer).length);let carry=0;const steps=[...prefix,`Line up the digits by place value. Start with the ones column.`];
for(let i=0;i<max;i++){if(p.op==='+'){const v=a[i]+b[i]+carry;steps.push(`In the ${names[i]} column: ${a[i]} + ${b[i]}${carry?' + 1 carried':''} = ${v}. ${v>=10?`Write ${v%10} and carry 1 to the next column.`:`Write ${v}.`}`);carry=v>=10?1:0;}
else {if(a[i]<b[i]){let j=i+1;while(j<a.length&&a[j]===0)j++;if(j>=a.length){steps.push('Check the digits: this subtraction needs a larger top number.');break;}a[j]--;for(let k=j-1;k>i;k--)a[k]=9;a[i]+=10;steps.push(j===i+1?`Trade 1 ${names[j]} for 10 ${names[i]}. Now the top ${names[i]} digit is ${a[i]}.`:`The next column has zero. Trade 1 ${names[j]} into the columns between, then trade 1 ${names[i+1]} for 10 ${names[i]}. The top ${names[i]} digit becomes ${a[i]}.`);}
steps.push(`In the ${names[i]} column: ${a[i]} − ${b[i]} = ${a[i]-b[i]}. Write ${a[i]-b[i]}.`);}}
steps.push(`Put the answer digits together: ${p.answer}.`);return steps;}
root.MathLearning={SKILLS,byId,problem,fresh,normalize,available,choose,record,masteryStatus,teaching,qualifies};
})(typeof window!=='undefined'?window:globalThis);
