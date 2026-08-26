const menuBtn=document.getElementById("menuBtn"),navMenu=document.getElementById("navMenu");
menuBtn?.addEventListener("click",()=>navMenu.classList.toggle("active"));
document.querySelectorAll("#navMenu a").forEach(a=>a.addEventListener("click",()=>navMenu.classList.remove("active")));

const overlay=document.getElementById("aiOverlay"),open1=document.getElementById("openAi"),open2=document.getElementById("openAiHero"),close=document.getElementById("closeAi");
function showAI(){overlay.classList.add("active");document.body.style.overflow="hidden";setTimeout(()=>document.getElementById("aiInput")?.focus(),200)}
function hideAI(){overlay.classList.remove("active");document.body.style.overflow=""}
open1?.addEventListener("click",showAI);open2?.addEventListener("click",showAI);close?.addEventListener("click",hideAI);
overlay?.addEventListener("click",e=>{if(e.target===overlay)hideAI()});

const input=document.getElementById("aiInput"),send=document.getElementById("sendButton"),messages=document.getElementById("aiMessages"),voice=document.getElementById("voiceButton");

function addMessage(text,type){
  const el=document.createElement("div"); el.className=`message ${type}`;
  if(type==="ai-message"){const label=document.createElement("span");label.className="message-label";label.textContent="SHREYA'S AI";el.appendChild(label)}
  const body=document.createElement("span");body.textContent=text;el.appendChild(body);
  messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return body;
}
async function ask(question){
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:question})});
  const data=await r.json(); if(!r.ok)throw new Error(data.error||"AI request failed"); return data.answer;
}
function speak(text){
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=.96;u.pitch=1.03;speechSynthesis.speak(u);
}
async function sendMessage(){
  const q=input.value.trim();if(!q||send.disabled)return;
  addMessage(q,"user-message");input.value="";send.disabled=true;send.textContent="…";
  const body=addMessage("Thinking…","ai-message");
  try{const answer=await ask(q);body.textContent=answer;speak(answer)}
  catch(e){body.textContent=e.message}
  finally{send.disabled=false;send.textContent="↑"}
}
send?.addEventListener("click",sendMessage);input?.addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage()});
document.querySelectorAll(".ai-suggestions button").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.question||"";sendMessage()}));

let recognition=null,listening=false;
voice?.addEventListener("click",()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){addMessage("Voice input is not supported here. Please use Chrome or Edge.","ai-message");return}
  if(!recognition){
    recognition=new SR();recognition.lang="en-IN";recognition.interimResults=false;recognition.continuous=false;
    recognition.onstart=()=>{listening=true;voice.textContent="●";voice.classList.add("listening")};
    recognition.onresult=e=>{input.value=e.results[0][0].transcript;sendMessage()};
    recognition.onerror=()=>addMessage("I couldn't hear that clearly. Please try again.","ai-message");
    recognition.onend=()=>{listening=false;voice.textContent="🎙";voice.classList.remove("listening")};
  }
  if(listening)recognition.stop();else{try{recognition.start()}catch(e){}}
});
