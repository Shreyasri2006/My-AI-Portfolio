const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const state={xp:0,quests:new Set(),sound:true};
const xpBar=$("#xpBar"),xpText=$("#xpText"),toast=$("#toast");

function gainXP(amount,label){
  state.xp=Math.min(100,state.xp+amount); xpBar.style.width=state.xp+"%"; xpText.textContent=`${state.xp} / 100`;
  if(label) showToast(`+${amount} XP · ${label}`);
}
function showToast(text){toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}
function markQuest(name){
  if(state.quests.has(name))return;
  state.quests.add(name); const el=document.querySelector(`[data-quest="${name}"]`);
  el?.classList.add("done"); $("#questCount").textContent=`${state.quests.size} / 5`; gainXP(name==="projects"?20:10,name.toUpperCase()+" QUEST COMPLETE");
}
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("visible"); const id=e.target.closest("section")?.id; if(id)markQuest(id)}
}),{threshold:.18});
$$(".reveal").forEach(el=>observer.observe(el));

$("#menuBtn")?.addEventListener("click",()=>$("#navMenu").classList.toggle("active"));
$$("nav a").forEach(a=>a.addEventListener("click",()=>$("#navMenu").classList.remove("active")));

let audioCtx;
function blip(freq=520,dur=.06){
  if(!state.sound)return;
  try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type="sine";g.gain.setValueAtTime(.025,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}catch{}
}
$("#soundToggle").addEventListener("click",e=>{state.sound=!state.sound;e.target.textContent=state.sound?"🔊":"🔇";blip(650,.08)});

const canvas=$("#fxCanvas"),ctx=canvas.getContext("2d");let W,H,particles=[];
function resize(){W=canvas.width=innerWidth*devicePixelRatio;H=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
addEventListener("resize",resize);resize();
for(let i=0;i<65;i++)particles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.3,v:Math.random()*.35+.08,a:Math.random()*.55+.1});
function fx(){
 ctx.clearRect(0,0,innerWidth,innerHeight);
 particles.forEach(p=>{p.y-=p.v;if(p.y<0){p.y=innerHeight;p.x=Math.random()*innerWidth}ctx.globalAlpha=p.a;ctx.fillStyle=Math.random()>.5?"#57e8ff":"#a878ff";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});
 requestAnimationFrame(fx)
}fx();

const cursor=$("#cursorGlow");addEventListener("pointermove",e=>{cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px"});
$$(".skill-node").forEach(n=>n.addEventListener("mouseenter",()=>blip(760,.05)));

const narration={
 home:"Welcome to Shreya's portfolio. I'm Shreya Sri, an Artificial Intelligence and Data Science undergraduate. This portfolio is designed like a small game, so you can explore my work without feeling like you're reading a traditional resume.",
 about:"I'm Shreya Sri, studying Artificial Intelligence and Data Science at East Point College of Engineering and Technology. I enjoy combining what I learn in class with hands-on projects, hackathons and AI-assisted development. My goal is to keep growing across AI, data and software while building useful experiences.",
 skills:"Here is my skill tree. My development tools include HTML, CSS, JavaScript and Python. For data and databases I work with SQL, MongoDB and R programming. I also have programming foundations in C, C plus plus and Java, along with Excel and AI tools.",
 projects:"Let's look at the builds. AquaSentinel AI is a completed team project about waterborne disease awareness, where I worked as the frontend and UI lead and contributed to the backend. Trip Crafter is currently in development. I am also building an AI-based learning platform.",
 journey:"This is the journey level. Hackathon memories, team moments, certifications and learning milestones will be added as the portfolio grows. Think of this section as an evolving memory vault.",
 contact:"You've reached the final mission. If you'd like to discuss a project, collaboration or opportunity, you can email Shreya or connect with her through GitHub and LinkedIn."
};
const transcript=$("#transcriptText"),status=$("#narrationStatus");let tourKeys=["home","about","skills","projects","journey","contact"],tourIndex=0,touring=false;
function speak(text,onend){
 if(!("speechSynthesis"in window)){showToast("Speech is not supported in this browser.");return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=.96;u.pitch=1.03;u.onend=onend;speechSynthesis.speak(u);transcript.textContent=text;
}
function playTour(){
 if(!("speechSynthesis"in window))return;
 touring=true;$("#playPause").textContent="❚❚ Pause narration";status.textContent="SPEAKING";
 const key=tourKeys[tourIndex];document.getElementById(key)?.scrollIntoView({behavior:"smooth",block:"center"});
 speak(narration[key],()=>{if(touring){tourIndex=(tourIndex+1)%tourKeys.length;setTimeout(playTour,450)}});
}
$("#startTour").addEventListener("click",()=>{tourIndex=0;playTour();document.querySelector("#narrator")?.scrollIntoView({behavior:"smooth"})});
$("#playPause").addEventListener("click",()=>{
 if(!("speechSynthesis"in window))return;
 if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();touring=false;$("#playPause").textContent="▶ Resume narration";status.textContent="PAUSED"}
 else if(speechSynthesis.paused){speechSynthesis.resume();touring=true;$("#playPause").textContent="❚❚ Pause narration";status.textContent="SPEAKING"}
 else{tourIndex=0;playTour()}
});
$("#stopNarration").addEventListener("click",()=>{touring=false;tourIndex=0;speechSynthesis?.cancel();$("#playPause").textContent="▶ Start narration";status.textContent="READY";transcript.textContent="Press “Start narration” and the portfolio will explain itself while you read along."});
$$("[data-tour]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.tour;transcript.textContent=narration[k];speak(narration[k]);}));

const overlay=$("#aiOverlay"),openAi=$("#openAi"),closeAi=$("#closeAi"),input=$("#aiInput"),send=$("#sendButton"),messages=$("#aiMessages"),voice=$("#voiceButton"),autoSpeak=$("#autoSpeak");
function showAI(){overlay.classList.add("active");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";setTimeout(()=>input.focus(),200)}
function hideAI(){overlay.classList.remove("active");overlay.setAttribute("aria-hidden","true");document.body.style.overflow="";speechSynthesis?.cancel()}
openAi.addEventListener("click",showAI);closeAi.addEventListener("click",hideAI);overlay.addEventListener("click",e=>{if(e.target===overlay)hideAI()});
function addMsg(text,type){const el=document.createElement("div");el.className=`message ${type}`;if(type==="ai"){const s=document.createElement("small");s.textContent="GUIDE";el.append(s)}el.append(document.createTextNode(text));messages.append(el);messages.scrollTop=messages.scrollHeight;return el}
const localGuideAnswers=[
  {test:/project|build|built|aqua|trip crafter|learning platform/i,answer:"Shreya has three featured builds. AquaSentinel AI is a completed team project focused on waterborne disease awareness, where she worked as the Frontend and UI Lead and also contributed to the backend. Trip Crafter is currently in development, and she is also building an AI-based learning platform."},
  {test:/skill|technology|tech stack|know|programming/i,answer:"Shreya's skills include HTML, CSS, JavaScript, Python, SQL, MongoDB, R Programming, C, C++, Java, Microsoft Excel and AI tools. Her main interests are AI, data and software development."},
  {test:/education|college|degree|study|student/i,answer:"Shreya Sri is pursuing a B.E. in Artificial Intelligence and Data Science at East Point College of Engineering and Technology, with graduation planned for 2028."},
  {test:/contact|email|reach|linkedin|github/i,answer:"You can contact Shreya at shreyasri2613@gmail.com. Her GitHub is github.com/Shreyasri2006 and her LinkedIn is linkedin.com/in/shreya-sri-844198314."},
  {test:/tour|portfolio|about|who is shreya|tell me about/i,answer:"Welcome to Shreya's portfolio. She is an Artificial Intelligence and Data Science undergraduate interested in AI, data and software development. Explore the About, Skills and Projects sections, or use the narrator to listen while you read."},
  {test:/hackathon|journey|experience|achievement/i,answer:"Shreya has participated in hackathon and project experiences and is continuing to build her skills. This portfolio's journey section is designed as an evolving space for future milestones and projects."}
];
function localGuide(q){const hit=localGuideAnswers.find(x=>x.test.test(q));return hit?.answer||"I'm Shreya's portfolio guide. Ask me about her education, skills, projects, journey or contact details, and I'll explain them in a simple way."}
async function ask(q){
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({message:q})});
    const type=r.headers.get("content-type")||"";
    if(!type.includes("application/json")) return localGuide(q);
    const d=await r.json();
    if(!r.ok) return d.error||localGuide(q);
    return d.answer||localGuide(q);
  }catch(err){
    // If the page was opened with Live Server, file://, or another static host,
    // keep the portfolio assistant working instead of showing a JSON parse error.
    return localGuide(q);
  }
}
async function sendMessage(){const q=input.value.trim();if(!q||send.disabled)return;addMsg(q,"user");input.value="";send.disabled=true;send.textContent="…";const el=addMsg("Thinking…","ai");try{const answer=await ask(q);el.innerHTML="<small>GUIDE</small>"+answer.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));if(autoSpeak.checked)speak(answer)}catch(e){el.textContent=e.message}finally{send.disabled=false;send.textContent="→"}}
send.addEventListener("click",sendMessage);input.addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage()});
$$(".quick-asks button").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.question;sendMessage()}));
let recognition,listening=false;
voice.addEventListener("click",()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){addMsg("Voice input is not supported here. Try Chrome or Edge.","ai");return}
 if(!recognition){recognition=new SR();recognition.lang="en-IN";recognition.interimResults=false;recognition.continuous=false;recognition.onstart=()=>{listening=true;voice.textContent="●";voice.classList.add("listening")};recognition.onresult=e=>{input.value=e.results[0][0].transcript;sendMessage()};recognition.onerror=()=>addMsg("I couldn't hear that clearly. Please try again.","ai");recognition.onend=()=>{listening=false;voice.textContent="🎙";voice.classList.remove("listening")}}
 if(listening)recognition.stop();else try{recognition.start()}catch{}
});
$("#stopVoice").addEventListener("click",()=>speechSynthesis?.cancel());
document.addEventListener("click",e=>{if(e.target.closest("a,button"))blip(560,.035)});
