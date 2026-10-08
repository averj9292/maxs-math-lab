'use strict';
const $=id=>document.getElementById(id), STORE='maxmath-school-v1';
const worlds=[['drawing','🎨','Drawing World'],['space','🚀','Space World'],['ocean','🐬','Ocean World'],['jungle','🌴','Jungle World'],['castle','🏰','Castle World'],['mystery','❔','Mystery World']];
const avatars=['🧑‍🚀','🦊','🐻','🦄','🤖','🐼'];
const defaults=()=>({initials:'',avatar:0,world:'drawing',unlocked:['drawing'],mystery:'surprise',stars:0,streak:0,best:0,correct:0,attempts:0,grade:'3',operation:'mixed',playmode:'practice',skillIndex:0,skillResults:{},reviewQueue:[],recentQuestions:[],learning:null});
let state=defaults();try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved&&typeof saved==='object')state={...state,...saved}}catch(e){}
let setupAvatar=0,setupWorld='drawing',setupMystery='surprise',q={a:44,b:28,op:'−',n:1},answer=['','',''],selected=2,workspace=true,checked=false,teach=[],teachIndex=0,roundEnd=0,timerId=null,strokes=[],drawing=false;if(state.session&&state.session.q&&Array.isArray(state.session.answer)){({q,answer,selected,workspace,checked}=state.session)}
// Preserve the existing device's stars, avatar and worlds when upgrading.
const LE=MathLearning;
state.learning=LE.normalize(state.learning);
let currentSkillId=q.skillId&&LE.byId(q.skillId)?q.skillId:LE.choose(state.learning).skill.id;
let wrongOnQuestion=false,usedHelp=false,tries=0;
if(state.session){wrongOnQuestion=!!state.session.wrongOnQuestion;usedHelp=!!state.session.usedHelp;tries=state.session.tries||0;}
function makeProblem(skill){const p=LE.problem(skill.id,Math.random,state.recentQuestions);state.recentQuestions=[...state.recentQuestions.slice(-19),p.signature];return {...p,n:(q.n||0)+1};}
function activeSkill(){return LE.byId(currentSkillId)||LE.SKILLS[0];}
function learningReport(){const box=$('learningReport');box.replaceChildren();for(const skill of LE.SKILLS){const status=LE.masteryStatus(state.learning,skill.id);const item=document.createElement('p');const accessible=LE.available(state.learning).some(s=>s.id===skill.id);item.textContent=(status.mastered?'✓ ':accessible?'◯ ':'🔒 ')+skill.name+' — '+(status.mastered?'Mastered':accessible?`${status.unassisted} independent correct in last 8 attempts`:'Not yet unlocked');box.append(item);}}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({...state,session:{q,answer,selected,workspace,checked,wrongOnQuestion,usedHelp,tries}}))}catch(e){}};
const show=(id,yes)=>$(id).hidden=!yes;
const worldDetails={drawing:['🎨','Sketch Meadow','Doodle your way through the hills!'],space:['🚀','Starry Space','Blast off into new discoveries!'],ocean:['🐬','Coral Cove','Dive into number adventures!'],jungle:['🌴','Jungle Trail','Follow the hidden jungle path!'],castle:['🏰','Cloud Castle','Reach the castle in the sky!'],mystery:['❔','???','A secret waiting to be found…']};
function mapView(){show('setup',false);show('game',false);show('worlds',false);show('map',true);theme();$('mapStars').textContent=state.stars;$('mapLevel').textContent=1+Math.floor(state.stars/10);$('mapAvatar').textContent=avatars[state.avatar]||'🦊';const box=$('adventureMap');box.replaceChildren();worlds.forEach(([id,emoji,name],i)=>{const open=state.unlocked.includes(id);const secret=id==='mystery'&&!open;const details=worldDetails[id];const node=document.createElement('button');node.type='button';node.className='map-stop stop-'+i+(open?' open':' locked')+(state.world===id?' current':'');node.disabled=!open;node.setAttribute('aria-label',open?details[1]+(state.world===id?', current world':''):secret?'Secret world, locked':name+', locked');const art=document.createElement('span');art.className='stop-art';art.textContent=secret?'?':open?emoji:'🔒';const heading=document.createElement('strong');heading.textContent=secret?'???':open?details[1]:'World locked';const sub=document.createElement('small');sub.textContent=secret?'A mystery awaits':open?details[2]:'Earn stars to unlock';node.append(art,heading,sub);if(open){node.onclick=()=>{state.world=id;save();mapView()}}box.append(node)});const note=document.createElement('p');note.className='map-hint';note.textContent='✨ Choose an unlocked world, then continue your adventure.';box.append(note)}
const button=(label,cb,cls='secondary')=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.addEventListener('click',cb);return b};
function setup(){show('setup',true);show('game',false);show('worlds',false);$('avatars').replaceChildren();avatars.forEach((emoji,i)=>{const b=button(emoji,()=>{state.initials=$('initials').value;setupAvatar=i;setup()},'avatar'+(i===setupAvatar?' selected':''));b.setAttribute('aria-label','Avatar '+(i+1));const span=document.createElement('span');span.className='emoji';span.textContent=emoji;b.replaceChildren(span);$('avatars').append(b)});$('startingWorlds').replaceChildren();worlds.slice(0,3).forEach(([id,emoji,name])=>$('startingWorlds').append(button(emoji+' '+name,()=>{state.initials=$('initials').value;setupWorld=id;setup()},'secondary'+(setupWorld===id?' selected':''))));$('mysteryChoices').replaceChildren();[['early','Early'],['middle','Middle'],['last','Last'],['surprise','Surprise me']].forEach(([id,name])=>$('mysteryChoices').append(button(name,()=>{state.initials=$('initials').value;setupMystery=id;setup()},'secondary'+(setupMystery===id?' selected':''))));$('initials').value=state.initials||''}
function theme(){const colors={drawing:'#eef4ff',space:'#e8eaff',ocean:'#e0f6fc',jungle:'#e8f5e6',castle:'#fff1e8',mystery:'#f3e9ff'};document.body.classList.remove('theme-drawing','theme-space','theme-ocean','theme-jungle','theme-castle','theme-mystery');document.body.classList.add('theme-'+(colors[state.world]?state.world:'drawing'))}
function worldThreshold(){return {early:5,middle:25,last:60,surprise:35}[state.mystery]||35}
function unlock(){const count=Math.min(4,Math.floor(state.stars/10));for(let i=1;i<=count;i++){const id=worlds[i][0];if(!state.unlocked.includes(id))state.unlocked.push(id)}if(state.stars>=worldThreshold()&&!state.unlocked.includes('mystery'))state.unlocked.push('mystery')}
function worldsView(){show('game',false);show('setup',false);show('worlds',true);show('map',false);$('worldGrid').replaceChildren();worlds.forEach(([id,emoji,name])=>{const unlocked=state.unlocked.includes(id);const b=button('',()=>{if(!unlocked)return;state.world=id;save();theme();worldsView()},'worldtile'+(unlocked?'':' locked')+(id===state.world?' selected':'')+(id==='mystery'&&!unlocked?' mystery':''));const icon=document.createElement('span');icon.className='emoji';icon.textContent=id==='mystery'&&!unlocked?'?':unlocked?emoji:'🔒';const title=document.createElement('span');title.textContent=unlocked?name:id==='mystery'?'　': 'Locked';b.append(icon,title);b.disabled=!unlocked;$('worldGrid').append(b)})}
function gameView(){show('setup',false);show('worlds',false);show('map',false);show('game',true);theme();$('playmode').value=state.playmode;render()}
function generate(){
 const choice=LE.choose(state.learning);q=makeProblem(choice.skill);currentSkillId=choice.skill.id;
 answer=['','',''];selected=2;checked=false;wrongOnQuestion=false;usedHelp=false;tries=0;teach=[];teachIndex=0;strokes=[];
 $('feedback').textContent='';show('celebrate',false);show('teaching',false);show('regroup',false);show('retry',false);show('drawing',false);save();render();
}
const expected=()=>q.answer!==undefined?q.answer:(q.op==='＋'?q.a+q.b:q.a-q.b);
function render(){
 $('stars').textContent=state.stars;$('streak').textContent=state.streak;$('best').textContent=state.best;$('level').textContent=1+Math.floor(state.stars/10);$('questionNo').textContent='Question '+q.n;
 $('question').textContent=q.story||`${q.a} ${q.op} ${q.b} = ?`;
 const skill=activeSkill(),status=LE.masteryStatus(state.learning,skill.id);
 $('skillName').textContent=skill.name;$('skillDescription').textContent=skill.description;
 $('skillProgress').textContent=status.mastered?'✓ Mastered · Reviewing to keep it strong':`${status.unassisted} independent correct in last ${status.attempts} attempts · Goal: 7 of 8, including last 3`;
 $('learningStatus').textContent=wrongOnQuestion&&!checked?'Try a new strategy. You can still solve this!':usedHelp?'Learning with a hint is progress, too.':`Grade ${skill.grade} skill · Take your time. You can ask for help.`;
 $('progress').textContent=`${state.correct} solved of ${state.attempts} completed · ${state.learning.mastered.length} of ${LE.SKILLS.length} skills mastered. Stars unlock worlds; learning unlocks harder math.`;
 show('workArea',workspace);show('quickArea',!workspace);show('keypad',workspace);$('workBtn').classList.toggle('selected',workspace);$('quickBtn').classList.toggle('selected',!workspace);
 $('quickInput').value=answer.join('').replace(/^0+(?=\d)/,'');$('quickInput').disabled=checked;
 show('check',!checked);show('next',checked);renderColumns();renderKeypad();learningReport();
}
function renderColumns(){const grid=$('columns');grid.replaceChildren();
 if(q.story){const hint=document.createElement('div');hint.className='story-work';hint.textContent='Think it through, then enter your final answer below.';grid.append(hint);}
 else {['','H','T','O'].forEach(x=>{const el=document.createElement('div');el.className='cell heading';el.textContent=x;grid.append(el)});[[q.a,''],[q.b,q.op]].forEach(([num,sign])=>{const op=document.createElement('div');op.className='cell';op.textContent=sign;grid.append(op);[2,1,0].forEach(power=>{const el=document.createElement('div');el.className='cell';el.textContent=power===0||num>=10**power?Math.floor(num/10**power)%10:'';grid.append(el)})});const line=document.createElement('div');line.className='line';grid.append(line);const blank=document.createElement('div');grid.append(blank);}
 if(q.story){const label=document.createElement('div');label.className='story-answer-label';label.textContent='Your answer:';grid.append(label);}
 answer.forEach((v,i)=>{const b=button(v||'·',()=>{selected=i;save();renderColumns()},'cell answerbox'+(selected===i?' active':''));b.disabled=checked;b.setAttribute('aria-label',['Hundreds','Tens','Ones'][i]+' answer '+(v||'empty'));grid.append(b)});
}
function renderKeypad(){const box=$('keypad');box.replaceChildren();for(let n=0;n<=9;n++)box.append(button(String(n),()=>{if(checked)return;answer[selected]=String(n);if(selected>0)selected--;save();render()},'secondary'));box.append(button('⌫',()=>{if(checked)return;answer[selected]='';save();render()},'secondary'))}
function value(){return answer.every(x=>!x)?null:Number(answer.map(x=>x||'0').join(''))}
function diagnose(given,p){const correct=expected(),diff=given-correct;
 if(p.op==='−'&&given===p.a+p.b)return 'Check the sign: this problem asks you to subtract, not add. Try again.';
 if(p.op==='+'&&given===Math.abs(p.a-p.b))return 'Check the sign: this problem asks you to add. Try again.';
 if(Math.abs(diff)===10||Math.abs(diff)===100)return 'You are close. Recheck the tens or hundreds column and any regrouping.';
 if(Math.abs(diff)===1)return 'Very close! Recheck the ones column.';
 if(p.skillId==='missing')return 'Try working backward: subtract the first number from the total.';
 if(p.skillId==='story'||p.skillId==='mixed4')return 'Read the story again. What happened first, and what happened next?';
 return 'Not quite yet. Check each place value and try again, or tap Teach me for a hint.';}
function check(){
 if(checked||value()===null)return;
 tries++;
 if(value()!==expected()){
  wrongOnQuestion=true;state.streak=0;
  $('feedback').textContent=diagnose(value(),q);
  show('retry',true);save();render();return;
 }
 checked=true;state.attempts++;state.correct++;state.stars++;state.streak++;state.best=Math.max(state.best,state.streak);
 const result=LE.record(state.learning,currentSkillId,{correct:true,help:usedHelp,retried:wrongOnQuestion});
 const before=state.unlocked.length;unlock();
 $('feedback').textContent=wrongOnQuestion?'You figured it out! Fixing a mistake is great learning.':usedHelp?'Nice work using a strategy!':'⭐ Great independent thinking!';
 if(result.newlyMastered||state.unlocked.length>before){$('celebrate').textContent=result.newlyMastered?'🧠 Skill mastered! A new challenge is ready.':'🎊 New world unlocked!';show('celebrate',true)}
 show('retry',false);save();render();
}
function teachingSteps(){return LE.teaching(q).map(text=>({text,trade:/Trade|trade|zero/.test(text)}));}
function speak(){if(!('speechSynthesis' in window)){$('feedback').textContent='Voice reading is not available in this browser.';return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(teach[teachIndex].text);u.lang='en-CA';u.rate=.85;speechSynthesis.speak(u)}
function teachRender(){const step=teach[teachIndex];$('teachText').textContent=`Step ${teachIndex+1} of ${teach.length}: ${step.text}`;$('stepBtn').disabled=teachIndex===teach.length-1;show('regroup',!!step.trade);if(step.trade)$('regroup').textContent='🧱 Place-value trade: one group of ten is the same amount as ten ones. Draw the groups on your scratchpad.';}
function stopVoice(){if('speechSynthesis' in window)speechSynthesis.cancel()}
function canvas(){const c=$('pad');const r=c.getBoundingClientRect();if(!r.width)return;const ratio=window.devicePixelRatio||1;c.width=Math.round(r.width*ratio);c.height=Math.round(210*ratio);const ctx=c.getContext('2d');ctx.scale(ratio,ratio);redraw()}
function redraw(){const c=$('pad'),ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle='#233e88';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';for(const points of strokes){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(points.length===1){ctx.lineTo(points[0][0]+.1,points[0][1]+.1)}ctx.stroke()}}
function point(e){const r=$('pad').getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
$('pad').addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;$('pad').setPointerCapture(e.pointerId);strokes.push([point(e)]);redraw()});$('pad').addEventListener('pointermove',e=>{if(!drawing)return;strokes[strokes.length-1].push(point(e));redraw()});['pointerup','pointercancel'].forEach(event=>$('pad').addEventListener(event,()=>drawing=false));
$('begin').onclick=()=>{state={...defaults(),initials:$('initials').value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2),avatar:setupAvatar,world:setupWorld,unlocked:[setupWorld],mystery:setupMystery};state.learning=LE.normalize(null);q=makeProblem(LE.choose(state.learning).skill);currentSkillId=q.skillId;save();mapView()};$('worldBtn').onclick=()=>{stopVoice();worldsView()};$('return').onclick=mapView;$('backToMap').onclick=()=>{stopVoice();save();mapView()};$('playFromMap').onclick=gameView;$('mapCollection').onclick=worldsView;$('workBtn').onclick=()=>{workspace=true;save();render()};$('quickBtn').onclick=()=>{workspace=false;save();render()};$('quickInput').addEventListener('input',e=>{const str=e.target.value.replace(/\D/g,'').slice(0,3);answer=str.padStart(3,' ').split('').map(x=>x===' '?'':x);save();renderColumns()});$('check').onclick=check;$('retry').onclick=()=>{show('retry',false);$('feedback').textContent='Give it another try. You can do this!';render()};$('next').onclick=()=>{stopVoice();generate()};$('teachBtn').onclick=()=>{usedHelp=true;save();teach=teachingSteps();teachIndex=0;show('teaching',true);teachRender()};$('stepBtn').onclick=()=>{if(teachIndex<teach.length-1){teachIndex++;teachRender();stopVoice()}};$('speakBtn').onclick=speak;$('drawBtn').onclick=()=>{const open=$('drawing').hidden;show('drawing',open);if(open)requestAnimationFrame(canvas)};$('undo').onclick=()=>{strokes.pop();redraw()};$('clear').onclick=()=>{strokes=[];redraw()};
['playmode'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$ (id).value;save();if(id==='playmode'){clearInterval(timerId);timerId=null;if(state.playmode==='minute'){roundEnd=Date.now()+60000;timerId=setInterval(()=>{const left=Math.max(0,Math.ceil((roundEnd-Date.now())/1000));$('timer').textContent=`⏱️ ${left}s`;if(left===0){clearInterval(timerId);timerId=null;$('check').disabled=true;$('feedback').textContent='⏰ Time is up! Great effort. Change to Practice Lab to continue.'}},250)}else{$('timer').textContent='';$('check').disabled=false}}generate()}));
$('reset').onclick=()=>{if(confirm('Clear stars, unlocked worlds, avatar and all progress on this device? This cannot be undone.')){localStorage.removeItem(STORE);location.reload()}};
if(localStorage.getItem(STORE)){if(!q.skillId||q.answer===undefined){q=makeProblem(LE.choose(state.learning).skill);answer=['','',''];checked=false;}currentSkillId=q.skillId||LE.choose(state.learning).skill.id;save();mapView()}else setup();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
