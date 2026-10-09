'use strict';
/* Max Mode: an original, offline fan tribute celebrating curiosity and engineering.
   Nothing here affects school-math mastery or the normal adventure rewards. */
(function(root){
 const $=id=>document.getElementById(id);
 const PATTERN=['space','drawing','jungle','space'];
 const LAUNCH_TARGETS=[18,24,30];
 const BRIDGE_LOADS=[13,21,26];
 const CHAIN_PUZZLES=[
  {question:'8 + □ = 12',options:[2,4,6],answer:4,hint:'Think: how far is 8 from 12?'},
  {question:'15 − □ = 9',options:[4,6,8],answer:6,hint:'Think: what would you take away from 15 to get 9?'},
  {question:'□ + 7 = 16',options:[7,9,11],answer:9,hint:'Think: 7 plus what makes 16?'}
 ];
 let armed=false,entered=[],lastCodeMessage='';
 let holdTimer=null,avatarTaps=0,tapTimer=null;
 let station='launcher',launchRound=0,launchReady=false;
 let bridgeRound=0,bridgeBeams=3,bridgeReady=false;
 let chainStage=0,chainReady=false;
 let ready=false;

 function saveLab(){
  if(!state.maxLab||typeof state.maxLab!=='object')state.maxLab={};
  if(!state.maxLab.cleared||typeof state.maxLab.cleared!=='object')state.maxLab.cleared={};
  if(!Array.isArray(state.maxLab.notes))state.maxLab.notes=[];
 }
 function completedCount(){saveLab();return ['launcher','bridge','chain'].filter(id=>!!state.maxLab.cleared[id]).length}
 function refreshBadges(){
  const count=completedCount();
  $('maxBadgeCount').textContent=count+' / 3 collected';
  for(const [key,el] of [['launcher','maxBadgeLaunch'],['bridge','maxBadgeBridge'],['chain','maxBadgeChain']]){
   $(el).classList.toggle('earned',!!state.maxLab.cleared[key]);
   $(el).setAttribute('aria-label',key+(state.maxLab.cleared[key]?' badge earned':' badge not earned'));
  }
  $('maxVictory').hidden=count!==3;
 }
 function note(text){
  saveLab();
  state.maxLab.notes.unshift(text);
  state.maxLab.notes=state.maxLab.notes.slice(0,12);
  save();renderNotebook();
 }
 function renderNotebook(){
  saveLab();
  const box=$('maxNotebookEntries');box.replaceChildren();
  if(!state.maxLab.notes.length){box.textContent='No experiments yet. Time to start inventing!';return}
  for(const text of state.maxLab.notes){
   const p=document.createElement('p');p.textContent=text;box.append(p);
  }
 }
 function award(key){
  saveLab();
  if(state.maxLab.cleared[key])return;
  state.maxLab.cleared[key]=true;
  note({launcher:'🏅 LAUNCH LAB badge!',bridge:'🏅 BRIDGE BUILDER badge!',chain:'🏅 CHAIN REACTION badge!'}[key]);
  refreshBadges();save();
 }
 function clearCode(){
  armed=false;entered=[];document.body.classList.remove('max-code-armed');
 }
 function refreshMap(){
  if(!$('map')||$('map').hidden)return;
  $('map').classList.toggle('max-code-active',armed);
  const status=$('secretStatus');
  if(armed){
   status.hidden=false;
   status.textContent='🔐 ENGINEER CODE: '+entered.map(()=>'●').join(' ')+' '+Array(PATTERN.length-entered.length).fill('○').join(' ')+' • Tap the secret world pattern!';
  }else if(lastCodeMessage){
   status.hidden=false;status.textContent=lastCodeMessage;
  }else status.hidden=true;
 }
 function arm(){
  clearTimeout(holdTimer);clearTimeout(tapTimer);avatarTaps=0;
  armed=true;entered=[];lastCodeMessage='';
  document.body.classList.add('max-code-armed');
  mapView();
 }
 function worldTap(id){
  if(!armed)return false;
  if(id!==PATTERN[entered.length]){
   clearCode();
   lastCodeMessage='🔒 Not quite the secret pattern. Hold your avatar to try again!';
   mapView();return true;
  }
  entered.push(id);
  if(entered.length===PATTERN.length){
   clearCode();lastCodeMessage='';
   open();
  }else refreshMap();
  return true;
 }
 function open(){
  clearCode();lastCodeMessage='';
  saveLab();
  for(const screen of ['setup','map','game','worlds','playground'])show(screen,false);
  show('maxMode',true);
  document.body.classList.add('max-lab-active');
  refreshBadges();renderNotebook();
  launchRound=0;launchReady=false;bridgeRound=0;bridgeReady=false;chainStage=0;chainReady=false;
  $('maxPower').value='7';$('maxAngle').value='45';$('maxPredict').value='';
  launchReset();bridgeBeams=3;bridgeReset();chainRender();
  chooseStation('launcher');
  if(root.scrollTo)root.scrollTo(0,0);
 }
 function hide(){
  show('maxMode',false);
  document.body.classList.remove('max-lab-active');
 }
 function exit(){
  hide();
  mapView();
  if(root.scrollTo)root.scrollTo(0,0);
 }
 function chooseStation(which){
  station=which;
  for(const [id,panel,tab] of [
   ['launcher','maxLabLauncher','maxPickLauncher'],
   ['bridge','maxLabBridge','maxPickBridge'],
   ['chain','maxLabChain','maxPickChain']]){
   show(panel,which===id);
   $(tab).classList.toggle('active',which===id);
   $(tab).setAttribute('aria-pressed',String(which===id));
  }
  if(which==='launcher')launchReset(false);
  if(which==='bridge')bridgeRender();
  if(which==='chain')chainRender();
 }
 const markerPosition=units=>Math.max(5,Math.min(94,5+units/40*88));
 function range(power,angle){
  return Math.round((power*power/3)*Math.sin(angle*2*Math.PI/180));
 }
 function launchLabels(){
  $('maxPowerValue').textContent=$('maxPower').value;
  $('maxAngleValue').textContent=$('maxAngle').value+'°';
 }
 function launchReset(clearMessage=true){
  const target=LAUNCH_TARGETS[launchRound];
  launchLabels();
  $('maxLaunchTarget').textContent=target+' units';
  $('maxLaunchRound').textContent='Challenge '+(launchRound+1)+' of 3';
  $('maxLaunchGoal').style.left=markerPosition(target)+'%';
  $('maxLaunchBall').style.left='5%';
  $('maxLaunchBall').classList.remove('max-ball-fly','max-ball-hit');
  $('maxLaunchTest').disabled=launchReady;
  show('maxLaunchNext',launchReady);
  $('maxLaunchNext').textContent=launchRound===2?'Try another launch ↻':'Next target →';
  if(clearMessage)$('maxLaunchFeedback').textContent='Pick your power and angle. Predict, test, then tweak!';
 }
 function launchTest(){
  if(launchReady)return;
  const prediction=$('maxPredict').value;
  if(!prediction){$('maxLaunchFeedback').textContent='🔮 First make your prediction: short, on target, or too far?';return}
  const power=Number($('maxPower').value),angle=Number($('maxAngle').value);
  const distance=range(power,angle),target=LAUNCH_TARGETS[launchRound];
  const difference=distance-target;
  const actual=difference< -2?'short':difference>2?'far':'hit';
  const correctPrediction=prediction===actual;
  const ball=$('maxLaunchBall');
  ball.classList.remove('max-ball-fly','max-ball-hit');void ball.offsetWidth;
  ball.style.left=markerPosition(distance)+'%';ball.classList.add('max-ball-fly');
  const relative=Math.abs(difference);
  const comparison=relative===0?'exactly on target':relative+' '+(relative===1?'unit':'units')+' '+(difference<0?'short':'too far');
  note('🚀 Power '+power+', angle '+angle+'° → '+distance+' units; target '+target+'.');
  if(actual==='hit'){
   launchReady=true;
   ball.classList.add('max-ball-hit');
   $('maxLaunchFeedback').textContent='🎉 DESIGN SUCCESS! You landed '+comparison+'. '+(correctPrediction?'Great prediction! ':'The test surprised us — that is science! ')+'Ready for a new target?';
   $('maxLaunchTest').disabled=true;
   show('maxLaunchNext',true);
   if(launchRound===2){award('launcher');$('maxLaunchNext').textContent='Try another launch ↻'}
   else $('maxLaunchNext').textContent='Next target →';
  }else{
   const advice=difference<0?'Try a little more power or a better angle.':'Try a little less power.';
   $('maxLaunchFeedback').textContent='📋 TEST RESULT: '+distance+' units, '+comparison+'. '+(correctPrediction?'Your prediction was right! ':'That result is different from your prediction. ')+advice+' Test again!';
  }
 }
 function launchNext(){
  launchRound=launchRound===LAUNCH_TARGETS.length-1?0:launchRound+1;
  launchReady=false;$('maxPredict').value='';launchReset();
 }

 function bridgeRender(){
  const load=BRIDGE_LOADS[bridgeRound],strength=bridgeBeams*5;
  $('maxBridgeLoad').textContent=load+' units';
  $('maxBridgeRound').textContent='Challenge '+(bridgeRound+1)+' of 3';
  $('maxBeams').textContent=String(bridgeBeams);
  $('maxBridgeFormula').textContent=bridgeBeams+' '+(bridgeBeams===1?'beam':'beams')+' × 5 strength = '+strength+' units';
  $('maxBeamMinus').disabled=bridgeBeams<=1||bridgeReady;
  $('maxBeamPlus').disabled=bridgeBeams>=8||bridgeReady;
  $('maxBridgeTest').disabled=bridgeReady;
  show('maxBridgeNext',bridgeReady);
  $('maxBridgeNext').textContent=bridgeRound===2?'Build another bridge ↻':'Next cargo →';
  const supports=$('maxBridgeSupports');supports.replaceChildren();
  for(let i=0;i<bridgeBeams;i++){
   const beam=document.createElement('span');beam.className='max-beam';beam.textContent='▥';supports.append(beam);
  }
 }
 function bridgeReset(){
  bridgeReady=false;
  bridgeRender();
  $('maxBridgeFeedback').textContent='Each beam holds 5 cargo units. Build a bridge strong enough without wasting extra supports!';
  $('maxBridgeSupports').classList.remove('max-bridge-shake','max-bridge-success');
 }
 function bridgeTest(){
  if(bridgeReady)return;
  const load=BRIDGE_LOADS[bridgeRound],strength=bridgeBeams*5;
  const need=Math.ceil(load/5);
  note('🌉 '+bridgeBeams+' beams → strength '+strength+'; cargo '+load+'.');
  const platform=$('maxBridgeSupports');
  platform.classList.remove('max-bridge-shake','max-bridge-success');void platform.offsetWidth;
  if(strength<load){
   platform.classList.add('max-bridge-shake');
   $('maxBridgeFeedback').textContent='📦 Bridge bends! You have '+strength+' strength but need '+load+'. Try adding '+(need-bridgeBeams)+' '+(need-bridgeBeams===1?'beam':'beams')+'.';
  }else if(bridgeBeams>need){
   $('maxBridgeFeedback').textContent='✅ It holds! But '+bridgeBeams+' beams is more than you need. Can you build the same strength with just '+need+'?';
  }else{
   bridgeReady=true;platform.classList.add('max-bridge-success');
   $('maxBridgeFeedback').textContent='🏆 SUPER EFFICIENT! '+bridgeBeams+' × 5 = '+strength+'. The '+load+'-unit load is safe and you used the fewest beams!';
   bridgeRender();
   if(bridgeRound===2)award('bridge');
  }
 }
 function bridgeNext(){
  bridgeRound=bridgeRound===BRIDGE_LOADS.length-1?0:bridgeRound+1;
  bridgeBeams=3;bridgeReset();
 }
 function chainRender(){
  const puzzle=CHAIN_PUZZLES[chainStage];
  $('maxChainStage').textContent='GEAR '+(chainStage+1)+' OF 3';
  $('maxChainQuestion').textContent=puzzle.question;
  for(let i=0;i<3;i++)$('maxChainNode'+i).classList.toggle('lit',i<chainStage||(i===chainStage&&chainReady));
  const choices=$('maxChainChoices');choices.replaceChildren();
  puzzle.options.forEach(value=>{
   const button=document.createElement('button');
   button.type='button';button.className='max-choice-btn';button.textContent=String(value);
   button.disabled=chainReady;button.onclick=()=>chainAnswer(value);
   choices.append(button);
  });
  show('maxChainNext',chainReady);
  $('maxChainNext').textContent=chainStage===2?'Run the machine again ↻':'Power the next gear →';
  if(!chainReady)$('maxChainFeedback').textContent=puzzle.hint;
 }
 function chainAnswer(value){
  if(chainReady)return;
  const puzzle=CHAIN_PUZZLES[chainStage];
  if(value!==puzzle.answer){
   $('maxChainFeedback').textContent='🔧 Not that gear! '+puzzle.hint+' You can test another number.';
   return;
  }
  chainReady=true;
  note('⚙️ Solved '+puzzle.question.replace('□',String(value))+' — gear '+(chainStage+1)+' activated.');
  $('maxChainFeedback').textContent=chainStage===2
   ?'🎉 CHAIN REACTION! All three gears are powered! Your invention works!'
   :'⚡ CLICK! Gear '+(chainStage+1)+' is spinning. Ready to connect the next part?';
  chainRender();
  if(chainStage===2)award('chain');
 }
 function chainNext(){
  if(!chainReady)return;
  chainStage=chainStage===2?0:chainStage+1;
  chainReady=false;chainRender();
 }
 function init(){
  if(ready)return;
  ready=true;
  saveLab();
  const avatar=$('mapAvatar');
  function cancelHold(){if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null}}
  avatar.addEventListener('pointerdown',e=>{
   if(e.button!==undefined&&e.button!==0)return;
   cancelHold();holdTimer=setTimeout(()=>{holdTimer=null;arm()},900);
  });
  for(const name of ['pointerup','pointercancel','pointerleave'])avatar.addEventListener(name,cancelHold);
  avatar.addEventListener('contextmenu',e=>e.preventDefault());
  avatar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();arm()}});
  avatar.addEventListener('click',()=>{
   avatarTaps++;clearTimeout(tapTimer);
   if(avatarTaps>=3){avatarTaps=0;arm();}
   else tapTimer=setTimeout(()=>avatarTaps=0,1600);
  });
  $('maxModeExit').onclick=exit;
  $('maxPickLauncher').onclick=()=>chooseStation('launcher');
  $('maxPickBridge').onclick=()=>chooseStation('bridge');
  $('maxPickChain').onclick=()=>chooseStation('chain');
  $('maxPower').oninput=launchLabels;
  $('maxAngle').oninput=launchLabels;
  $('maxLaunchTest').onclick=launchTest;
  $('maxLaunchNext').onclick=launchNext;
  $('maxBeamMinus').onclick=()=>{if(bridgeReady)return;bridgeBeams=Math.max(1,bridgeBeams-1);bridgeRender()};
  $('maxBeamPlus').onclick=()=>{if(bridgeReady)return;bridgeBeams=Math.min(8,bridgeBeams+1);bridgeRender()};
  $('maxBridgeTest').onclick=bridgeTest;
  $('maxBridgeNext').onclick=bridgeNext;
  $('maxChainNext').onclick=chainNext;
 }
 root.MaxMode={init,refreshMap,worldTap,open,hide,exit,get armed(){return armed},get codeLength(){return entered.length},
  // Diagnostic hooks for repeatable tests, not exposed in the player UI.
  _debug(){return {station,launchRound,launchReady,bridgeRound,bridgeBeams,bridgeReady,chainStage,chainReady,completed:completedCount()}}};
})(window);
