const menuBtn=document.getElementById("menuBtn"),navMenu=document.getElementById("navMenu");menuBtn.addEventListener("click",()=>navMenu.classList.toggle("active"));document.querySelectorAll("#navMenu a").forEach(a=>a.addEventListener("click",()=>navMenu.classList.remove("active")));

const aiOverlay=document.getElementById("aiOverlay"),openAi=document.getElementById("openAi"),openAiHero=document.getElementById("openAiHero"),closeAi=document.getElementById("closeAi");
function showAI(){aiOverlay.classList.add("active");document.body.style.overflow="hidden"}
function hideAI(){aiOverlay.classList.remove("active");document.body.style.overflow=""}
openAi.addEventListener("click",showAI);openAiHero.addEventListener("click",showAI);closeAi.addEventListener("click",hideAI);aiOverlay.addEventListener("click",e=>{if(e.target===aiOverlay)hideAI()});

const portfolioKnowledge={
about:"Shreya Sri is an Artificial Intelligence and Data Science undergraduate at East Point College of Engineering and Technology, pursuing her B.E. from 2024 to 2028. She is interested in AI, data and software development.",
skills:"Shreya's skills include HTML, CSS, JavaScript, Python, SQL, MongoDB and R programming. She also has academic foundations in C, C++ and Java, along with basic Excel.",
projects:"Shreya currently has three portfolio projects. AquaSentinel AI is a completed team project where she handled the frontend and UI design and contributed to the backend. Trip Crafter is currently in development. Her third project is an AI-Based Learning Platform, which is also in development.",
aquasentinel:"AquaSentinel AI is a team-developed platform focused on awareness of waterborne disease risks. Shreya's primary contribution was the complete frontend and UI design, with additional backend contribution. The frontend uses HTML, CSS and JavaScript, while Python is used for the backend."
};
function getAIResponse(q){
 q=q.toLowerCase();
 if(q.includes("who")||q.includes("about shreya")||q.includes("about her"))return portfolioKnowledge.about;
 if(q.includes("skill")||q.includes("technology")||q.includes("tech stack"))return portfolioKnowledge.skills;
 if(q.includes("aquasentinel")||q.includes("aqua sentinel"))return portfolioKnowledge.aquasentinel;
 if(q.includes("trip crafter"))return "Trip Crafter is one of Shreya's projects and is currently under development. Its GitHub repository is available through the Projects section.";
 if(q.includes("learning platform")||q.includes("learning"))return "Shreya's AI-Based Learning Platform is currently under development. More details will be added as the project progresses.";
 if(q.includes("project")||q.includes("built"))return portfolioKnowledge.projects;
 return "I can tell you about Shreya's education, skills, projects and current development work. Try asking about one of those.";
}
const aiInput=document.getElementById("aiInput"),sendButton=document.getElementById("sendButton"),aiMessages=document.getElementById("aiMessages");
function addMessage(text,type){const m=document.createElement("div");m.className=`message ${type}`;m.innerHTML=type==="ai-message"?`<span class="message-label">SHREYA'S AI</span>${text}`:text;aiMessages.appendChild(m);aiMessages.scrollTop=aiMessages.scrollHeight}
function sendMessage(){const q=aiInput.value.trim();if(!q)return;addMessage(q,"user-message");aiInput.value="";setTimeout(()=>addMessage(getAIResponse(q),"ai-message"),350)}
sendButton.addEventListener("click",sendMessage);aiInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage()});
document.querySelectorAll(".ai-suggestions button").forEach(b=>b.addEventListener("click",()=>{aiInput.value=b.dataset.question;sendMessage()}));

const voiceButton=document.getElementById("voiceButton");
voiceButton.addEventListener("click",()=>{
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){addMessage("Voice recognition is not supported in this browser yet.","ai-message");return}
 const recognition=new SR();recognition.lang="en-IN";recognition.interimResults=false;recognition.start();voiceButton.textContent="●";
 recognition.onresult=e=>{aiInput.value=e.results[0][0].transcript;voiceButton.textContent="🎙";sendMessage()};
 recognition.onerror=()=>{voiceButton.textContent="🎙";addMessage("I couldn't hear that clearly. Please try again.","ai-message")};
 recognition.onend=()=>voiceButton.textContent="🎙";
});
