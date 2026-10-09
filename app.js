'use strict';
const $=id=>document.getElementById(id), STORE='maxmath-school-v1';
const worlds=[['drawing','🎨','Drawing World'],['space','🚀','Space World'],['ocean','🐬','Ocean World'],['jungle','🌴','Jungle World'],['castle','🏰','Castle World'],['mystery','❔','Mystery World']];
const avatars=['🧑‍🚀','🦊','🐻','🦄','🤖','🐼'];

/* Each world has a 120-question main journey (12 missions × 10 challenges).
   Adventure collectibles are separate from learning mastery. */
const MISSION_SIZE=10;
const WORLD_QUESTS={
 drawing:{verb:'Bring Sketch Meadow to life',items:[['✏️','Find your magic pencil'],['🖍️','Gather a box of crayons'],['☀️','Draw the sunshine'],['🌸','Plant colourful flowers'],['🐝','Welcome the buzzing bees'],['🌈','Paint a giant rainbow'],['🌳','Create a friendly forest'],['🏡','Sketch a cosy village'],['🦋','Add fluttering butterflies'],['🎨','Fill the sky with colour'],['✨','Bring the drawings to life'],['🏆','Unveil your masterpiece']]},
 space:{verb:'Build your rocket and explore the galaxy',items:[['🔩','Collect rocket bolts'],['🛠️','Build the rocket body'],['🚀','Fit the rocket engines'],['⛽','Fuel the rocket'],['🧑‍🚀','Pack your space suit'],['🛰️','Launch into orbit'],['🌙','Land on the Moon'],['🪐','Visit the ringed planet'],['☄️','Dodge a comet'],['🌠','Find the shooting stars'],['👽','Meet a friendly alien'],['🏆','Discover the secret galaxy']]},
 ocean:{verb:'Explore and protect the coral reef',items:[['🫧','Collect ocean bubbles'],['🐠','Find the reef fish'],['🪸','Grow bright coral'],['🐚','Hunt for seashells'],['🦀','Meet a little crab'],['🐢','Help the sea turtles'],['🌊','Ride an ocean current'],['🦈','Spot a friendly shark'],['🐬','Follow the dolphins'],['🪼','Explore glowing jellyfish'],['🔱','Find the ancient treasure'],['🏆','Save the magical reef']]},
 jungle:{verb:'Find the hidden jungle temple',items:[['🍃','Open the jungle trail'],['🦜','Follow the bright parrots'],['🌺','Collect jungle flowers'],['🐒','Meet the tree monkeys'],['🌉','Cross the hanging bridge'],['🦋','Follow butterfly clues'],['🐸','Discover the frog pond'],['🗺️','Find the lost map'],['🐆','Spot jungle footprints'],['🏛️','Uncover the temple gates'],['💎','Find the glowing gem'],['🏆','Unlock the temple mystery']]},
 castle:{verb:'Rebuild the castle in the clouds',items:[['🧱','Stack the magic bricks'],['🏰','Raise the first tower'],['🚩','Hang the castle flags'],['🌉','Build the drawbridge'],['🛡️','Find the royal shield'],['🐉','Meet a tiny dragon'],['🗝️','Discover a golden key'],['📜','Read the secret scroll'],['👑','Find the royal crown'],['🪄','Cast a kind spell'],['🎆','Prepare the castle feast'],['🏆','Celebrate at the cloud castle']]},
 mystery:{verb:'Unlock the secrets of the glowing portal',items:[['🔎','Find the first clue'],['🗝️','Discover a silver key'],['✨','Catch the floating sparks'],['🧩','Solve the strange puzzle'],['📜','Read the old map'],['🚪','Find the hidden door'],['🔮','Light up the crystal'],['⭐','Collect star fragments'],['🌀','Open the glowing portal'],['🌌','Explore the unknown'],['🎁','Open the secret chest'],['🏆','Reveal the final mystery']]}
};
function worldCount(id){return Math.max(0,Number(state.worldProgress&&state.worldProgress[id])||0);}
function totalMissions(){return Object.keys(WORLD_QUESTS).reduce((n,id)=>n+Math.floor(worldCount(id)/MISSION_SIZE),0);}
function missionState(id){
 const count=worldCount(id),set=WORLD_QUESTS[id]||WORLD_QUESTS.drawing;
 const mainDone=count>=set.items.length*MISSION_SIZE;
 const number=Math.floor(count/MISSION_SIZE);
 const chapter=mainDone?number-set.items.length+1:number;
 const item=mainDone?['🌟','Bonus expedition '+chapter]:set.items[Math.min(number,set.items.length-1)];
 return {count,set,mainDone,number,item,within:count%MISSION_SIZE,completed:Math.min(number,set.items.length)};
}
function updateMissionDisplay(){
 const m=missionState(state.world);
 $('missionTitle').textContent=m.item[1];
 $('missionGoal').textContent=m.mainDone?'The adventure continues! Complete bonus challenges to earn more rewards.':m.set.verb+' · Mission '+(m.number+1)+' of '+m.set.items.length;
 $('missionReward').textContent=m.item[0];
 $('craftOutline').textContent=m.item[0];$('craftColour').textContent=m.item[0];$('craftColour').style.clipPath='inset(0 '+(100-m.within*10)+'% 0 0)';
 $('craftCaption').textContent=m.within===0?'Solve problems to start building!':m.within+' of 10 pieces collected!';
 $('missionFill').style.width=(m.within*10)+'%';
 $('missionBar').setAttribute('aria-valuenow',m.within);
 $('missionCount').textContent=m.within+' of 10 challenges · '+m.completed+' of 12 missions complete';
 const trail=$('missionTrail');trail.replaceChildren();
 m.set.items.forEach(([emoji,title],i)=>{
  const item=document.createElement('span');
  item.className='mission-token'+(i<m.completed?' complete':i===m.number?' current':'');
  item.textContent=i<m.completed?emoji:i===m.number?emoji:'✦';
  item.title=title+(i<m.completed?' — collected':i===m.number?' — exploring':' — ahead');
  item.setAttribute('aria-label',item.title);
  trail.append(item);
 });
}
function celebrateMission(m){
 const icon=m.mainDone?'🏆':m.set.items[m.number-1][0];
 $('missionCelebrateIcon').textContent=icon;
 $('missionCelebrateTitle').textContent=m.mainDone&&m.number===m.set.items.length?'World adventure completed!':m.mainDone?'Bonus expedition complete!':'Mission complete!';
 $('missionCelebrateText').textContent=m.mainDone?'Keep exploring for bonus rewards!':m.set.items[m.number-1][1]+' — collected! A new mission is waiting.';
 show('missionCelebration',true);
 const panel=$('missionCelebration');
 panel.classList.remove('mission-pop');
 void panel.offsetWidth;
 panel.classList.add('mission-pop');
}

const defaults=()=>({initials:'',avatar:0,world:'drawing',unlocked:['drawing'],mystery:'surprise',stars:0,streak:0,best:0,correct:0,attempts:0,grade:'3',operation:'mixed',playmode:'practice',skillIndex:0,skillResults:{},reviewQueue:[],recentQuestions:[],learning:null,worldProgress:{},mathTopic:'guided'});
let state=defaults();try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved&&typeof saved==='object')state={...state,...saved}}catch(e){}
let setupAvatar=0,setupWorld='drawing',setupMystery='surprise',q={a:44,b:28,op:'−',n:1},answer=['','','',''],selected=3,workspace=true,checked=false,teach=[],teachIndex=0,roundEnd=0,timerId=null,strokes=[],drawing=false;if(state.session&&state.session.q&&Array.isArray(state.session.answer)){({q,answer,selected,workspace,checked}=state.session)}
// Preserve the existing device's stars, avatar and worlds when upgrading.
const LE=MathLearning;
state.learning=LE.normalize(state.learning);
if(!state.worldProgress||typeof state.worldProgress!=='object')state.worldProgress={};
if(!['guided','addition','subtraction','mixed','advanced'].includes(state.mathTopic))state.mathTopic='guided';
let currentSkillId=q.skillId&&LE.byId(q.skillId)?q.skillId:LE.choose(state.learning).skill.id;
let wrongOnQuestion=false,usedHelp=false,tries=0;
if(state.session){wrongOnQuestion=!!state.session.wrongOnQuestion;usedHelp=!!state.session.usedHelp;tries=state.session.tries||0;}
const BASIC_IDS=new Set(LE.SKILLS.slice(0,14).map(s=>s.id));
const ADD_IDS=['add-facts','add2-no','add2-carry','add3-no','add3-carry'];
const SUB_IDS=['sub-facts','sub2-no','sub2-borrow','sub3-no','sub3-borrow','sub3-zero'];
function eligibleForTopic(){
 const topic=state.mathTopic;
 const available=LE.available(state.learning);
 if(topic==='guided')return available.filter(x=>BASIC_IDS.has(x.id));
 if(topic==='advanced')return available.filter(x=>!BASIC_IDS.has(x.id));
 const ids=topic==='addition'?ADD_IDS:topic==='subtraction'?SUB_IDS:ADD_IDS.concat(SUB_IDS);
 const pool=available.filter(x=>ids.includes(x.id));
 return pool.length?pool:[LE.byId(topic==='subtraction'?'sub-facts':'add-facts')];
}
function pickQuestionSkill(){
 return LE.nextSkill(state.learning,eligibleForTopic()).skill;
}
function topicDescription(){
 const labels={guided:"My learning path picks math you're ready for.",addition:'Practice adding numbers.',subtraction:'Practice taking away.',mixed:'A mix of adding and taking away.',advanced:'New challenges for when you feel ready. You can switch back anytime.'};
 $('mathTopicNote').textContent=labels[state.mathTopic];
}
function makeProblem(skill){const p=LE.problem(skill.id,Math.random,state.recentQuestions);state.recentQuestions=[...state.recentQuestions.slice(-19),p.signature];return {...p,n:(q.n||0)+1};}
/* Only show the place-value columns needed by this question. */
function answerColumns(){
 const largest=Math.max(q.a||0,q.b||0,q.answer||0);
 return largest>=1000?[0,1,2,3]:largest>=100?[1,2,3]:largest>=10?[2,3]:[3];
}
function startAtLeft(){selected=answerColumns()[0];}
function normalizeAnswer(){
 if(Array.isArray(answer)&&answer.length===3)answer=['',...answer];
 if(!Array.isArray(answer)||answer.length!==4)answer=['','','',''];
 const visible=answerColumns();
 for(let i=0;i<4;i++)if(!visible.includes(i))answer[i]='';
 if(!visible.includes(selected)||answer.every(v=>!v))startAtLeft();
}
normalizeAnswer();
function activeSkill(){return LE.byId(currentSkillId)||LE.SKILLS[0];}
let tutorTraded=false;
function pictorial(id,p,step=0){
 const box=$(id);box.replaceChildren();box.hidden=false;
 const label=(t)=>{const x=document.createElement('div');x.className='visual-heading';x.textContent=t;box.append(x)};
 const wrap=(cls)=>{const x=document.createElement('div');x.className=cls;box.append(x);return x};
 const dot=(container,cls='picture-dot')=>{const x=document.createElement('span');x.className=cls;container.append(x)};
 if(p.visual==='groups'||p.visual==='fraction-set'){
  const count=p.visual==='fraction-set'?p.parts:p.op==='÷'?p.b:p.a;
  const each=p.visual==='fraction-set'?p.a/p.parts:p.op==='÷'?p.a/p.b:p.b;
  label(p.op==='÷'||p.visual==='fraction-set'?'Share into equal groups':'Count the equal groups');
  const outer=wrap('picture-groups');for(let i=0;i<Math.min(count,10);i++){const group=document.createElement('div');group.className='picture-group';for(let j=0;j<Math.min(each,10);j++)dot(group);outer.append(group)}return;
 }
 if(p.visual==='fraction'){
  label('Equal pieces of one whole');const grid=wrap('picture-fraction');for(let i=0;i<p.parts;i++)dot(grid,i===0?'picture-piece filled':'picture-piece');return;
 }
 if(p.visual==='shape'||p.visual==='angle'){
  const caption=p.visual==='angle'?'Look at the angle opening':'Trace and count the straight sides';label(caption);
  const sh=wrap('picture-shape');
  if(p.visual==='angle'){
   sh.classList.add('picture-angle');
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 240 160');svg.setAttribute('aria-label','Angle diagram');
   const line=(x1,y1,x2,y2,color)=>{
    const el=document.createElementNS('http://www.w3.org/2000/svg','line');
    for(const [k,v] of Object.entries({x1,y1,x2,y2,stroke:color,'stroke-width':8,'stroke-linecap':'round'}))el.setAttribute(k,String(v));svg.append(el);
   };
   line(115,130,210,130,'#6c61d3');
   const radians=p.degrees*Math.PI/180;
   line(115,130,115+95*Math.cos(radians),130-95*Math.sin(radians),'#28a6a5');
   sh.append(svg);
  }else sh.textContent=p.sides===3?'△':p.sides===4?'□':p.sides===5?'⬟':p.sides===6?'⬡':'⯃';
  return;
 }
 if(p.visual==='area'||p.visual==='rectangle'){
  label(p.visual==='area'?'Count the squares inside':'Count all sides around');const grid=wrap('picture-area');grid.style.gridTemplateColumns='repeat('+Math.min(p.b,10)+',minmax(0,1fr))';for(let i=0;i<Math.min(p.a,10)*Math.min(p.b,10);i++)dot(grid,'picture-tile');return;
 }
 if(p.visual==='graph'){
  label('Which bar is taller?');const outer=wrap('picture-bars');for(const [name,n] of [['Apples',p.a],['Pears',p.b]]){const col=document.createElement('div');col.className='picture-bar-column';const bar=document.createElement('span');bar.className='picture-bar';bar.style.height=(20+n*9)+'px';const lbl=document.createElement('small');lbl.textContent=name+' '+n;col.append(bar,lbl);outer.append(col)}return;
 }
 if(p.visual==='clock'){
  label('60 minutes in an hour');const clock=wrap('picture-clock');const face=document.createElement('span');face.textContent='◷';clock.append(face);return;
 }
 if(p.visual==='coins'){label('Count your coins');const outer=wrap('picture-coins');for(let i=0;i<Math.min(p.b,8);i++){const coin=document.createElement('span');coin.textContent=p.a+'¢';outer.append(coin)}return;}
 if(p.visual==='ruler'||p.visual==='measure-mass'){label(p.visual==='ruler'?'Measure the distance':'Measure the mass');wrap('picture-ruler').textContent=p.visual==='ruler'?'📏':'⚖️';return;}
 if(step>=0&&(p.op==='+'||p.op==='−')){
  label('Place-value blocks: hundreds, tens and ones');
  const n=p.a,outer=wrap('picture-place');
  [['Hundreds',Math.floor(n/100)%10,'hundreds'],['Tens',Math.floor(n/10)%10,'tens'],['Ones',n%10,'ones']].forEach(([title,count,cls])=>{
   if(count===0&&cls==='hundreds')return;
   const group=document.createElement('div');group.className='picture-place-group';
   const heading=document.createElement('strong');heading.textContent=title;
   group.append(heading);
   const blocks=document.createElement('div');blocks.className='picture-blocks';
   const total=cls==='ones'&&tutorTraded?Math.min(count+10,19):cls==='tens'&&tutorTraded?Math.max(0,count-1):count;
   for(let i=0;i<total;i++)dot(blocks,'picture-block '+cls);
   group.append(blocks);outer.append(group);
  });return;
 }
 box.hidden=true;
}
function learningReport(){const box=$('learningReport');box.replaceChildren();for(const skill of LE.SKILLS){if(state.mathTopic!=='advanced'&&!BASIC_IDS.has(skill.id))continue;const status=LE.masteryStatus(state.learning,skill.id);const item=document.createElement('p');const accessible=LE.available(state.learning).some(s=>s.id===skill.id);const need=skill.prereq.filter(id=>!state.learning.mastered.includes(id)).map(id=>LE.byId(id).name);item.textContent=(status.mastered?'✓ ':accessible?'◯ ':'🔒 ')+skill.name+' — '+(status.mastered?'Mastered':accessible?`${Math.min(status.attempts,10)}/10 questions · ${status.streak}/5 in a row`:'Unlock by mastering: '+need.join(' and '));box.append(item);}}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({...state,session:{q,answer,selected,workspace,checked,wrongOnQuestion,usedHelp,tries}}))}catch(e){}};
const show=(id,yes)=>$(id).hidden=!yes;
const worldDetails={drawing:['🎨','Sketch Meadow','Draw your own adventure!'],space:['🚀','Starry Space','Zoom through the stars!'],ocean:['🐬','Coral Cove','Dive into the ocean!'],jungle:['🌴','Jungle Trail','Explore the jungle!'],castle:['🏰','Cloud Castle','Explore the sky castle!'],mystery:['❔','???','What could be hiding here?']};
function mapView(){show('setup',false);show('game',false);show('worlds',false);show('map',true);theme();$('mapStars').textContent=state.stars;$('mapLevel').textContent=1+Math.floor(state.stars/10);$('mapAvatar').textContent=avatars[state.avatar]||'🦊';const box=$('adventureMap');box.replaceChildren();worlds.forEach(([id,emoji,name],i)=>{const open=state.unlocked.includes(id);const secret=id==='mystery'&&!open;const details=worldDetails[id];const node=document.createElement('button');node.type='button';node.className='map-stop stop-'+i+(open?' open':' locked')+(state.world===id?' current':'');node.disabled=false;node.setAttribute('aria-label',open?details[1]+(state.world===id?', current world':''):secret?'Secret world, locked':name+', locked');const art=document.createElement('span');art.className='stop-art';art.textContent=secret?'?':open?emoji:'🔒';const heading=document.createElement('strong');heading.textContent=secret?'???':open?details[1]:'Locked';const sub=document.createElement('small');sub.textContent=secret?'A mystery awaits':open?(missionState(id).completed+'/12 missions'):'Finish more missions';node.append(art,heading,sub);node.onclick=()=>{if(!open){const hint=box.querySelector('.map-hint');if(hint)hint.textContent=secret?'🔎 Shhh! Keep playing to find the secret world!':'🔒 Not unlocked yet! Complete more missions to visit.';return;}enterWorld(id)};box.append(node)});const note=document.createElement('p');note.className='map-hint';note.textContent='✨ Tap a world to play!';box.append(note)}
const button=(label,cb,cls='secondary')=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.addEventListener('click',cb);return b};
function setup(){show('setup',true);show('game',false);show('worlds',false);$('avatars').replaceChildren();avatars.forEach((emoji,i)=>{const b=button(emoji,()=>{state.initials=$('initials').value;setupAvatar=i;setup()},'avatar'+(i===setupAvatar?' selected':''));b.setAttribute('aria-label','Avatar '+(i+1));const span=document.createElement('span');span.className='emoji';span.textContent=emoji;b.replaceChildren(span);$('avatars').append(b)});$('startingWorlds').replaceChildren();worlds.slice(0,3).forEach(([id,emoji,name])=>$('startingWorlds').append(button(emoji+' '+name,()=>{state.initials=$('initials').value;setupWorld=id;setup()},'secondary'+(setupWorld===id?' selected':''))));$('mysteryChoices').replaceChildren();[['early','Early'],['middle','Middle'],['last','Last'],['surprise','Surprise me']].forEach(([id,name])=>$('mysteryChoices').append(button(name,()=>{state.initials=$('initials').value;setupMystery=id;setup()},'secondary'+(setupMystery===id?' selected':''))));$('initials').value=state.initials||''}
function theme(){const colors={drawing:'#eef4ff',space:'#e8eaff',ocean:'#e0f6fc',jungle:'#e8f5e6',castle:'#fff1e8',mystery:'#f3e9ff'};document.body.classList.remove('theme-drawing','theme-space','theme-ocean','theme-jungle','theme-castle','theme-mystery');document.body.classList.add('theme-'+(colors[state.world]?state.world:'drawing'))}
function worldThreshold(){return {early:80,middle:180,last:360,surprise:240}[state.mystery]||240}
function unlock(){const count=Math.min(4,Math.floor(totalMissions()/3));for(let i=1;i<=count;i++){const id=worlds[i][0];if(!state.unlocked.includes(id))state.unlocked.push(id)}if(Object.keys(WORLD_QUESTS).reduce((n,id)=>n+worldCount(id),0)>=worldThreshold()&&!state.unlocked.includes('mystery'))state.unlocked.push('mystery')}
function worldsView(){show('game',false);show('setup',false);show('worlds',true);show('map',false);$('worldGrid').replaceChildren();worlds.forEach(([id,emoji,name])=>{const unlocked=state.unlocked.includes(id);const b=button('',()=>{if(!unlocked){const msg=$('worldHint');if(msg)msg.textContent=id==='mystery'?'🔎 Shhh! Keep playing to find the secret world!':'🔒 Finish more missions to unlock this world!';return;}state.world=id;save();theme();$('worldHint').textContent='✓ '+name+' picked! Tap Back to my map.';worldsView()},'worldtile'+(unlocked?'':' locked')+(id===state.world?' selected':'')+(id==='mystery'&&!unlocked?' mystery':''));const icon=document.createElement('span');icon.className='emoji';icon.textContent=id==='mystery'&&!unlocked?'?':unlocked?emoji:'🔒';const title=document.createElement('span');title.textContent=unlocked?name:id==='mystery'?'　': 'Locked';b.append(icon,title);b.disabled=false;$('worldGrid').append(b)})}
let enteringWorld=false;
function enterWorld(id){
 if(enteringWorld)return;
 state.world=id;save();theme();
 const details=worldDetails[id]||worldDetails.drawing;
 const avatar=avatars[state.avatar]||'🦊';
 $('transitionAvatar').textContent=avatar;
 $('transitionDestination').textContent=details[1];
 const overlay=$('worldTransition');
 overlay.hidden=false;
 enteringWorld=true;
 document.body.classList.add('world-entering');
 const finish=()=>{
  if(!enteringWorld)return;
  enteringWorld=false;overlay.hidden=true;
  document.body.classList.remove('world-entering');
  gameView();
 };
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.setTimeout(finish,reduced?150:1150);
}
function updateWorldStage(){
 const details=worldDetails[state.world]||worldDetails.drawing;
 $('stageAvatar').textContent=avatars[state.avatar]||'🦊';
 $('stageWorldName').textContent=details[1];
 $('stageEmoji').textContent=details[0];
}
function gameView(){show('setup',false);show('worlds',false);show('map',false);show('game',true);theme();updateWorldStage();updateMissionDisplay();$('playmode').value=state.playmode;render()}
function generate(){
 const skill=pickQuestionSkill();q=makeProblem(skill);currentSkillId=skill.id;
 answer=['','','',''];startAtLeft();checked=false;wrongOnQuestion=false;usedHelp=false;tries=0;teach=[];teachIndex=0;tutorMode='watch';tutorVisual='place';tutorTradeCounts=null;tutorTradeSignature='';tutorTraded=false;cleverOpen=false;cleverIndex=0;handsEquation='';handsMoved=0;strokes=[];
 $('feedback').textContent='';show('celebrate',false);show('teaching',false);show('regroup',false);show('retry',false);show('drawing',false);show('missionCelebration',false);save();render();
}
const expected=()=>q.answer!==undefined?q.answer:(q.op==='＋'?q.a+q.b:q.a-q.b);
function render(){
 $('stars').textContent=state.stars;$('streak').textContent=state.streak;$('best').textContent=state.best;$('level').textContent=1+Math.floor(state.stars/10);$('questionNo').textContent='Question '+q.n;
 $('question').textContent=q.story||`${q.a} ${q.op} ${q.b} = ?`;
 pictorial('problemVisual',q,-1);
 const skill=activeSkill(),status=LE.masteryStatus(state.learning,skill.id);
 $('mathTopic').value=state.mathTopic;topicDescription();
 $('skillName').textContent=skill.name;$('skillDescription').textContent=skill.description;
 $('skillProgress').textContent=status.mastered?'✓ Mastered · Reviewing to keep it strong':`${Math.min(status.attempts,10)}/10 questions done · ${status.streak}/5 right in a row`;
 $('learningStatus').textContent=wrongOnQuestion&&!checked?'Try again! You can do it.':usedHelp?'Great job asking for help!':`Grade ${skill.grade} math · Take your time. Tap Teach me if you need help.`;
 const support=state.learning.support;
 const coaching=!!(support&&support.remaining>0&&currentSkillId===support.foundation);
 show('coachNotice',coaching);
 if(coaching)$('coachMessage').textContent='A quick foundation mission: '+skill.name+'. '+support.remaining+' practice '+(support.remaining===1?'question':'questions')+' before we return to '+(LE.byId(support.target)?.name||'your challenge')+'.';

 $('progress').textContent=`${state.correct} solved of ${state.attempts} completed · ${state.learning.mastered.length} of ${LE.SKILLS.length} skills mastered. World missions unlock adventures; learning unlocks harder math.`;
 show('workArea',workspace);show('quickArea',!workspace);show('keypad',workspace);$('workBtn').classList.toggle('selected',workspace);$('quickBtn').classList.toggle('selected',!workspace);
 $('quickInput').value=answer.join('').replace(/^0+(?=\d)/,'');$('quickInput').disabled=checked;
 show('check',!checked);show('next',checked);updateMissionDisplay();renderColumns();renderKeypad();learningReport();
}
function renderColumns(){
 const grid=$('columns');
 grid.replaceChildren();
 const visible=answerColumns(),names=['Thousands','Hundreds','Tens','Ones'];
 grid.classList.remove('digits-1','digits-2','digits-3','digits-4');
 grid.classList.add('digits-'+visible.length);
 if(q.story){
  const hint=document.createElement('div');hint.className='story-work';
  hint.textContent='Think it through, then enter your answer below.';
  grid.append(hint);
 }else{
  ['',...visible.map(i=>['Th','H','T','O'][i])].forEach(x=>{
   const el=document.createElement('div');el.className='cell heading';el.textContent=x;grid.append(el);
  });
  [[q.a,''],[q.b,q.op]].forEach(([num,sign])=>{
   const op=document.createElement('div');op.className='cell';op.textContent=sign;grid.append(op);
   visible.forEach(i=>{
    const power=3-i,el=document.createElement('div');
    el.className='cell';
    el.textContent=power===0||num>=10**power?Math.floor(num/10**power)%10:'';
    grid.append(el);
   });
  });
  const line=document.createElement('div');line.className='line';grid.append(line);
 }
 if(q.story){
  const label=document.createElement('div');label.className='story-answer-label';label.textContent='Your answer:';grid.append(label);
 }
 const blank=document.createElement('div');blank.className='cell';grid.append(blank);
 visible.forEach(i=>{
  const v=answer[i];
  const b=button(v||'·',()=>{selected=i;save();renderColumns()},'cell answerbox'+(selected===i?' active':''));
  b.disabled=checked;
  b.setAttribute('aria-label',names[i]+' answer '+(v||'empty'));
  grid.append(b);
 });
}
function renderKeypad(){
 const box=$('keypad');box.replaceChildren();
 for(let n=0;n<=9;n++)box.append(button(String(n),()=>{
  if(checked)return;
  answer[selected]=String(n);
  if(selected<3)selected++;
  save();render();
 },'secondary'));
 box.append(button('⌫',()=>{
  if(checked)return;
  if(!answer[selected]&&selected>answerColumns()[0])selected--;
  answer[selected]='';
  save();render();
 },'secondary'));
}
function value(){return answer.every(x=>!x)?null:Number(answer.map(x=>x||'0').join(''))}
function diagnose(given,p){const correct=expected(),diff=given-correct;
 if(p.op==='−'&&given===p.a+p.b)return 'Check the sign: this problem asks you to subtract, not add. Try again.';
 if(p.op==='+'&&given===Math.abs(p.a-p.b))return 'Check the sign: this problem asks you to add. Try again.';
 if(Math.abs(diff)===10||Math.abs(diff)===100)return 'You are close. Recheck the tens or hundreds column and any regrouping.';
 if(Math.abs(diff)===1)return 'Very close! Recheck the ones column.';
 if(p.visual==='groups'&&p.op==='×'&&given===p.a+p.b)return 'It looks like you added the two numbers. Try making equal groups and counting them.';
 if(p.visual==='groups'&&p.op==='÷'&&given===p.a*p.b)return 'Division is sharing equally. Draw the groups and count how many go in each.';
 if(p.visual==='rectangle'&&given===p.a*p.b)return 'That finds area, not perimeter. Perimeter means going all the way around.';
 if(p.visual==='area'&&given===2*(p.a+p.b))return 'That finds perimeter. Area counts the squares inside.';
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
 state.worldProgress[state.world]=worldCount(state.world)+1;
 const mission=missionState(state.world);
 const missionFinished=mission.within===0;
 const result=LE.record(state.learning,currentSkillId,{correct:!wrongOnQuestion,help:usedHelp,retried:wrongOnQuestion});


 const before=state.unlocked.length;unlock();
 $('feedback').textContent=wrongOnQuestion?'You figured it out! Fixing a mistake is great learning.':usedHelp?'Nice work using a strategy!':'⭐ Great thinking!';
 if(result.supportStarted)$('feedback').textContent+=' 🧩 Coach has two foundation challenges for us next, then we will return to this skill.';
 if(result.newlyMastered||state.unlocked.length>before){$('celebrate').textContent=result.newlyMastered?'🧠 Skill mastered! A new challenge is ready.':'🎊 New world unlocked!';show('celebrate',true)}
 if(missionFinished)celebrateMission(mission);
 show('retry',false);save();render();
}

/* Hands-on ten frames are deliberately unscored, entirely client-side,
   and do not modify learning mastery or adventure progress. */
let playgroundReturn='map', playgroundA=9,playgroundB=6,playgroundMoved=0;
let handsMoved=0,handsEquation='';
function tenFrame(el,a,b,moved,onMove,onUndo){
 el.replaceChildren();
 const row=document.createElement('div');row.className='hands-frames';
 const makeFrame=(title,howMany,fillType)=>{
  const box=document.createElement('div');box.className='hands-frame-wrap';
  const head=document.createElement('strong');head.textContent=title;
  const frame=document.createElement('div');frame.className='hands-tenframe';
  if(fillType==='first')frame.dataset.dropzone='ten';
  for(let i=0;i<10;i++){
   const cell=document.createElement('button');cell.type='button';
   cell.className='hands-cell';
   cell.setAttribute('aria-label',title+' square '+(i+1));
   const origin=fillType==='first'&&i<a;
   const movedHere=fillType==='first'&&i>=a&&i<a+moved;
   const remaining=fillType==='second'&&i<b-moved;
   if(origin||movedHere||remaining){
    const pebble=document.createElement('span');
    pebble.className='hands-counter '+(origin?'first':movedHere?'shifted':'second');
    cell.append(pebble);
    cell.classList.add('filled');
    if(remaining){cell.setAttribute('aria-label','Loose counter — tap to move to the first frame');cell.onclick=onMove;}
    if(movedHere){cell.setAttribute('aria-label','Moved counter — tap to move back');cell.onclick=onUndo;}
   }else if(fillType==='first'&&i>=a+moved){cell.classList.add('empty-target');cell.onclick=onMove;cell.setAttribute('aria-label','Empty space — tap to bring one counter here');}
   frame.append(cell);
  }
  box.append(head,frame);return box;
 };
 row.append(makeFrame('First number: '+(a+moved),'first','first'),makeFrame('Second number: '+(b-moved),'second','second'));
 el.append(row);
 const explain=document.createElement('div');explain.className='hands-counts';
 const stillNeeded=Math.max(0,10-a-moved);
 explain.textContent=stillNeeded?'Move '+stillNeeded+' more '+(stillNeeded===1?'counter':'counters')+' to make 10.': '✨ Ten made! 10 + '+(b-moved)+' = '+(a+b);
 el.append(explain);
 const helper=document.createElement('p');helper.className='hands-tap-help';helper.textContent='Tap a purple counter to move it. Or drag it across the frames.';el.append(helper);
 // On touch screens release inside the first frame; tapping works everywhere.
 row.onpointerdown=e=>{
  const target=e.target.closest?e.target.closest('.hands-cell'):null;
  if(!target||!target.closest('.hands-frame-wrap'))return;
  if(target.classList.contains('filled')&&target.closest('.hands-frame-wrap')===row.lastElementChild){
   row._dragStart={x:e.clientX,y:e.clientY};
  }
 };
 row.onpointerup=e=>{
  if(!row._dragStart)return;
  const start=row._dragStart;row._dragStart=null;
  const d=Math.hypot((e.clientX||0)-start.x,(e.clientY||0)-start.y);
  if(d>25&&onMove){
   const first=row.children[0].children[1].getBoundingClientRect();
   const within=e.clientX>=first.left&&e.clientX<=first.right&&e.clientY>=first.top&&e.clientY<=first.bottom;
   if(within){e.preventDefault();onMove();}
  }
 };
}
function showHandsTutor(){
 const clever=LE.cleverStrategy(q),valid=clever&&clever.name==='Make a 10'&&!checked;
 show('cleverHands',!!valid&&cleverOpen);
 if(!valid||!cleverOpen)return;
 const signature=q.signature||q.a+':'+q.b+':'+q.op;
 if(handsEquation!==signature){handsEquation=signature;handsMoved=0;}
 const a=Math.max(q.a,q.b),b=Math.min(q.a,q.b),needed=Math.min(10-a,b);
 handsMoved=Math.min(handsMoved,needed);
 tenFrame($('cleverHandsBoard'),a,b,handsMoved,
 ()=>{if(handsMoved<needed){handsMoved++;showHandsTutor()}},
 ()=>{if(handsMoved>0){handsMoved--;showHandsTutor()}});
 $('cleverHandsFeedback').textContent=handsMoved===needed?'⭐ You made a ten! '+(a+b)+' altogether.': 'See if you can fill all ten spaces.';
}
function playgroundRender(){
 const a=playgroundA,b=playgroundB;
 const need=Math.min(10-a,b);
 playgroundMoved=Math.min(playgroundMoved,need);
 $('playgroundQuestion').textContent=a+' + '+b+' = ?';
 tenFrame($('playgroundBoard'),a,b,playgroundMoved,
 ()=>{if(playgroundMoved<need){playgroundMoved++;playgroundRender()}},
 ()=>{if(playgroundMoved>0){playgroundMoved--;playgroundRender()}});
 $('playgroundFeedback').textContent=playgroundMoved>=need
  ?'🎉 You made a ten! '+a+' + '+b+' = 10 + '+(b-need)+' = '+(a+b)+'. Amazing thinking!'
  :'Move '+(need-playgroundMoved)+' '+(need-playgroundMoved===1?'counter':'counters')+' to make a full ten.';
 $('playgroundUndo').disabled=playgroundMoved===0;
}
function openPlayground(){
 const screens=['setup','game','map','worlds'];
 playgroundReturn=screens.find(id=>!$(id).hidden)||'map';
 stopVoice();screens.forEach(id=>show(id,false));show('playground',true);playgroundRender();
}
function closePlayground(){
 show('playground',false);
 if(playgroundReturn==='game')gameView();
 else if(playgroundReturn==='worlds')worldsView();
 else if(playgroundReturn==='setup')setup();
 else mapView();
}

let cleverOpen=false,cleverIndex=0;
function cleverRender(){
 const strategy=LE.cleverStrategy(q);
 const exists=!!strategy;
 $('cleverBtn').hidden=!exists;
 if(!exists){show('cleverPanel',false);return;}
 $('cleverBtn').textContent=cleverOpen?'🧠 Hide clever way':'🧠 Try a clever way';
 show('cleverPanel',cleverOpen);
 if(!cleverOpen){show('cleverHands',false);return;}
 showHandsTutor();
 $('cleverTitle').textContent=strategy.name;
 $('cleverExplanation').textContent=strategy.steps[cleverIndex];
 $('cleverStepCount').textContent=(cleverIndex+1)+' of '+strategy.steps.length;
 $('cleverPrev').disabled=cleverIndex===0;
 $('cleverNext').disabled=cleverIndex===strategy.steps.length-1;
 $('cleverNext').textContent=cleverIndex===strategy.steps.length-1?'You got it! ✓':'Show next idea →';
 const models=$('cleverModels');models.replaceChildren();
 if(strategy.name==='Make a 10'){
  const tens=document.createElement('div');tens.className='clever-tenframe';
  const base=strategy.parts[0].value,needed=strategy.parts[1].value;
  const filled=cleverIndex===0?base:Math.min(10,base+needed);
  for(let cell=0;cell<10;cell++){
   const dot=document.createElement('span');
   dot.className='tenframe-dot'+(cell<base?' already':cell<filled?' moved':'');
   tens.append(dot);
  }
  models.append(tens);
 }else if(strategy.name==='Jump back to a ten'||strategy.name==='Subtract a friendly number'){
  const path=document.createElement('div');path.className='clever-jumps';
  path.textContent=cleverIndex===0?'Start at '+q.a:cleverIndex===1?'Make the first jump':'Finish the jump';
  models.append(path);
 }
 strategy.parts.forEach((part,i)=>{
  // The goal appears at the end of the walkthrough, not on the first hint.
  if((part.label==='Total'||part.label==='Left')&&cleverIndex<strategy.steps.length-1)return;
  const box=document.createElement('div');box.className='clever-number-card';
  const cap=document.createElement('small');cap.textContent=part.label;
  const value=document.createElement('strong');value.textContent=String(part.value);
  box.append(cap,value);models.append(box);
 });
}
/* Visual teaching: demonstrate, let children exchange blocks, then solve. */
let tutorMode='watch',tutorTradeCounts=null,tutorTradeSignature='',tutorVisual='place';
function tutorUnits(){
 const signature=q.signature||[q.a,q.b,q.op].join(':');
 if(!tutorTradeCounts||tutorTradeSignature!==signature){
  tutorTradeSignature=signature;
  const n=Math.max(0,Math.floor(q.a||0));
  tutorTradeCounts=[n%10,Math.floor(n/10)%10,Math.floor(n/100)%10,Math.floor(n/1000)%10];
 }
 return tutorTradeCounts;
}
function renderTradeBoard(){
 const box=$('tutorTradeBoard');box.replaceChildren();
 const counts=tutorUnits(),names=['Ones','Tens','Hundreds','Thousands'];
 const highest=Math.min(3,Math.max(1,Math.floor(Math.log10(Math.max(1,q.a)))));
 const units=document.createElement('div');units.className='trade-units';
 for(let i=highest;i>=0;i--){
  const col=document.createElement('div');col.className='trade-unit';
  const h=document.createElement('strong');h.textContent=names[i]+' ('+counts[i]+')';col.append(h);
  const pieces=document.createElement('div');pieces.className='trade-pieces';
  for(let k=0;k<Math.min(20,counts[i]);k++){
   const piece=document.createElement('span');piece.className='trade-piece trade-'+i;pieces.append(piece);
  }
  if(counts[i]>20){const count=document.createElement('small');count.textContent='and '+(counts[i]-20)+' more';pieces.append(count)}
  col.append(pieces);
  if(i>0){
   const trade=document.createElement('button');trade.type='button';trade.className='secondary trade-action';
   trade.disabled=counts[i]<1||counts[i-1]>25;
   trade.textContent='🔁 Exchange 1 '+names[i].slice(0,-1).toLowerCase()+' for 10 '+names[i-1].toLowerCase();
   trade.onclick=()=>{
    if(counts[i]<1)return;
    counts[i]--;counts[i-1]+=10;
    renderTradeBoard();
    $('tutorTradeNotice').textContent='Good trade! The total amount is still '+q.a+'. We changed the groups, not the value.';
   };
   col.append(trade);
  }
  units.append(col);
 }
 box.append(units);
 const proof=document.createElement('div');proof.className='trade-proof';
 proof.textContent=counts.map((n,i)=>n*(10**i)).reduce((a,b)=>a+b,0)+' altogether — same value, different groups.';
 box.append(proof);
}
function renderNumberJumps(){
 const box=$('tutorLine');box.replaceChildren();
 if(!['+','−'].includes(q.op)||!Number.isInteger(q.a)||!Number.isInteger(q.b)){
  const note=document.createElement('p');note.textContent='A number line will be available for addition and subtraction.';box.append(note);return;
 }
 const sign=q.op==='+'?1:-1;
 const tens=Math.floor(q.b/10)*10,ones=q.b%10;
 const chunks=[tens,ones].filter(x=>x>0);
 const start=document.createElement('div');start.className='jump-start';start.textContent='Start at '+q.a;box.append(start);
 let value=q.a;
 chunks.forEach(chunk=>{
  value+=sign*chunk;
  const step=document.createElement('div');step.className='jump-step';
  const move=document.createElement('strong');move.textContent=(sign>0?'+':'−')+' '+chunk;
  const stop=document.createElement('span');stop.textContent=String(value);
  step.append(move,stop);box.append(step);
 });
 const tip=document.createElement('p');tip.className='jump-tip';
 tip.textContent=chunks.length?'Jump in friendly tens, then ones.':'You can stay where you started.';
 box.append(tip);
}
function tutorView(){
 if($('teaching').hidden)return;
 for(const [id,active] of [['tutorWatch',tutorMode==='watch'],['tutorTry',tutorMode==='try'],['tutorSolve',tutorMode==='solve']])$(id).classList.toggle('selected',active);
 if(tutorMode==='solve'){
  show('teaching',false);
  $('learningStatus').textContent='Your turn! Try the answer with the support you just explored.';
  return;
 }
 const isOperation=(q.op==='+'||q.op==='−')&&!q.story;
 $('tutorTry').disabled=!isOperation;
 show('tutorTradeBoard',tutorMode==='try'&&isOperation);
 show('tutorLine',tutorMode==='watch'&&tutorVisual==='numberline');
 show('teachVisual',tutorMode==='watch'&&tutorVisual!=='numberline');
 show('tradeBtn',false);
 if(tutorMode==='try'&&isOperation){
  renderTradeBoard();
  $('tutorInstruction').textContent='Move the place-value blocks yourself. Swap one ten for ten ones, or one hundred for ten tens.';
  $('teachText').textContent='Try exchanging the blocks. The amount stays the same!';
 }else{
  $('tutorInstruction').textContent=tutorVisual==='numberline'?'Follow the jumps: tens first, then ones.':'Watch how the place values work, one step at a time.';
  if(tutorVisual==='numberline')renderNumberJumps();
 }
}
function teachingSteps(){return LE.teaching(q).map(text=>({text,trade:/Trade|trade|zero/.test(text)}));}
function speak(){if(!('speechSynthesis' in window)){$('feedback').textContent='Voice reading is not available in this browser.';return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(teach[teachIndex].text);u.lang='en-CA';u.rate=.85;speechSynthesis.speak(u)}
function teachRender(){const step=teach[teachIndex];$('teachText').textContent=`Step ${teachIndex+1} of ${teach.length}: ${step.text}`;
 pictorial('teachVisual',q,teachIndex);cleverRender();tutorView();$('tradeBtn').hidden=!(q.op==='−'&&Math.floor(q.a/10)%10>0&&teach.some(x=>x.trade));$('stepBtn').disabled=teachIndex===teach.length-1;show('regroup',!!step.trade);if(step.trade)$('regroup').textContent='🧱 Place-value trade: one group of ten is the same amount as ten ones. Draw the groups on your scratchpad.';}
function stopVoice(){if('speechSynthesis' in window)speechSynthesis.cancel()}
function canvas(){const c=$('pad');const r=c.getBoundingClientRect();if(!r.width)return;const ratio=window.devicePixelRatio||1;c.width=Math.round(r.width*ratio);c.height=Math.round(210*ratio);const ctx=c.getContext('2d');ctx.scale(ratio,ratio);redraw()}
function redraw(){const c=$('pad'),ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle='#233e88';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';for(const points of strokes){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(points.length===1){ctx.lineTo(points[0][0]+.1,points[0][1]+.1)}ctx.stroke()}}
function point(e){const r=$('pad').getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
$('pad').addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;$('pad').setPointerCapture(e.pointerId);strokes.push([point(e)]);redraw()});$('pad').addEventListener('pointermove',e=>{if(!drawing)return;strokes[strokes.length-1].push(point(e));redraw()});['pointerup','pointercancel'].forEach(event=>$('pad').addEventListener(event,()=>drawing=false));
$('begin').onclick=()=>{state={...defaults(),initials:$('initials').value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2),avatar:setupAvatar,world:setupWorld,unlocked:[setupWorld],mystery:setupMystery};state.learning=LE.normalize(null);q=makeProblem(pickQuestionSkill());currentSkillId=q.skillId;answer=['','','',''];startAtLeft();save();mapView()};$('worldBtn').onclick=()=>{stopVoice();worldsView()};$('return').onclick=mapView;$('backToMap').onclick=()=>{stopVoice();save();mapView()};$('playFromMap').onclick=()=>enterWorld(state.world);$('mapCollection').onclick=worldsView;$('mathTopic').onchange=()=>{state.mathTopic=$('mathTopic').value;save();generate()};$('workBtn').onclick=()=>{workspace=true;save();render()};$('quickBtn').onclick=()=>{workspace=false;save();render()};$('quickInput').addEventListener('input',e=>{const str=e.target.value.replace(/\D/g,'').slice(0,4);answer=str.padStart(4,' ').split('').map(x=>x===' '?'':x);save();renderColumns()});$('check').onclick=check;$('retry').onclick=()=>{show('retry',false);$('feedback').textContent='Give it another try. You can do this!';render()};$('next').onclick=()=>{stopVoice();generate()};$('coachTeach').onclick=()=>{workspace=true;usedHelp=true;save();render();teach=teachingSteps();teachIndex=0;tutorMode='watch';show('teaching',true);teachRender()};
$('tutorWatch').onclick=()=>{tutorMode='watch';tutorVisual='place';teachRender()};
$('tutorTry').onclick=()=>{usedHelp=true;tutorMode='try';save();tutorView()};
$('tutorSolve').onclick=()=>{tutorMode='solve';tutorView()};
$('tutorNumberLine').onclick=()=>{usedHelp=true;tutorMode='watch';tutorVisual='numberline';save();teachRender()};
$('tutorPlaceValue').onclick=()=>{usedHelp=true;tutorMode='watch';tutorVisual='place';save();teachRender()};
$('teachBtn').onclick=()=>{usedHelp=true;save();teach=teachingSteps();teachIndex=0;show('teaching',true);teachRender()};$('stepBtn').onclick=()=>{if(teachIndex<teach.length-1){teachIndex++;teachRender();stopVoice()}};$('playgroundBtn').onclick=openPlayground;
$('playgroundBack').onclick=closePlayground;
$('playgroundProblem').onchange=()=>{
 const [a,b]=$('playgroundProblem').value.split(',').map(Number);
 playgroundA=a;playgroundB=b;playgroundMoved=0;playgroundRender();
};
$('playgroundRandom').onclick=()=>{
 const options=[[9,6],[8,7],[7,5],[6,8],[9,4],[8,5]];
 const next=options.filter(([a,b])=>a!==playgroundA||b!==playgroundB);
 const [a,b]=next[Math.floor(Math.random()*next.length)];
 playgroundA=a;playgroundB=b;playgroundMoved=0;
 $('playgroundProblem').value=a+','+b;playgroundRender();
};
$('playgroundUndo').onclick=()=>{playgroundMoved=Math.max(0,playgroundMoved-1);playgroundRender()};
$('playgroundReset').onclick=()=>{playgroundMoved=0;playgroundRender()};
$('playgroundNext').onclick=()=>$('playgroundRandom').onclick();
$('cleverBtn').onclick=()=>{cleverOpen=!cleverOpen;cleverIndex=0;usedHelp=true;save();cleverRender()};
$('cleverPrev').onclick=()=>{cleverIndex=Math.max(0,cleverIndex-1);cleverRender()};
$('cleverNext').onclick=()=>{const st=LE.cleverStrategy(q);if(st)cleverIndex=Math.min(st.steps.length-1,cleverIndex+1);cleverRender()};
$('speakBtn').onclick=speak;$('tradeBtn').onclick=()=>{tutorTraded=!tutorTraded;pictorial('teachVisual',q,teachIndex);$('tradeBtn').textContent=tutorTraded?'↩️ Show before trading':'🔁 Trade 1 ten for 10 ones'};$('drawBtn').onclick=()=>{const open=$('drawing').hidden;show('drawing',open);if(open)requestAnimationFrame(canvas)};$('undo').onclick=()=>{strokes.pop();redraw()};$('clear').onclick=()=>{strokes=[];redraw()};
['playmode'].forEach(id=>$(id).addEventListener('change',()=>{state[id]=$ (id).value;save();if(id==='playmode'){clearInterval(timerId);timerId=null;if(state.playmode==='minute'){roundEnd=Date.now()+60000;timerId=setInterval(()=>{const left=Math.max(0,Math.ceil((roundEnd-Date.now())/1000));$('timer').textContent=`⏱️ ${left}s`;if(left===0){clearInterval(timerId);timerId=null;$('check').disabled=true;$('feedback').textContent='⏰ Time is up! Great effort. Change to Practice Lab to continue.'}},250)}else{$('timer').textContent='';$('check').disabled=false}}generate()}));
$('reset').onclick=()=>{if(confirm('Clear stars, unlocked worlds, avatar and all progress on this device? This cannot be undone.')){localStorage.removeItem(STORE);location.reload()}};
if(localStorage.getItem(STORE)){if(!q.skillId||q.answer===undefined){q=makeProblem(pickQuestionSkill());answer=['','','',''];startAtLeft();checked=false;}currentSkillId=q.skillId||LE.choose(state.learning).skill.id;save();mapView()}else setup();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
