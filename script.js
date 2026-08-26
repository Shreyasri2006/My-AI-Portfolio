const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE_KEY = "shreyaPortfolioProgressV5";
const savedProgress = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
})();

const state = {
  xp: Number(savedProgress.xp || 0),
  quests: new Set(Array.isArray(savedProgress.quests) ? savedProgress.quests : []),
  unlocked: new Set(Array.isArray(savedProgress.unlocked) ? savedProgress.unlocked : ["about"]),
  completedGates: new Set(Array.isArray(savedProgress.completedGates) ? savedProgress.completedGates : []),
  finalBonus: Boolean(savedProgress.finalBonus),
  sound: true
};

if (!state.unlocked.has("about")) state.unlocked.add("about");
const completedUnlockMap = { about: "skills", skills: "projects", projects: "journey", journey: "contact" };
state.completedGates.forEach((gate) => { if (completedUnlockMap[gate]) state.unlocked.add(completedUnlockMap[gate]); });

const xpBar = $("#xpBar");
const xpText = $("#xpText");
const toast = $("#toast");
const levelHud = $("#levelHud");

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        xp: state.xp,
        quests: [...state.quests],
        unlocked: [...state.unlocked],
        completedGates: [...state.completedGates],
        finalBonus: state.finalBonus
      })
    );
  } catch {}
}

function refreshXP() {
  if (xpBar) xpBar.style.width = `${Math.min(100, state.xp)}%`;
  if (xpText) xpText.textContent = `${Math.min(100, state.xp)} / 100`;
}

function showToast(text, duration = 1800) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), duration);
}

function gainXP(amount, label) {
  state.xp = Math.min(100, state.xp + amount);
  refreshXP();
  saveProgress();
  if (label) showToast(`+${amount} XP · ${label}`);
}

function markQuest(name) {
  if (state.quests.has(name)) return;
  state.quests.add(name);
  const el = document.querySelector(`[data-quest="${name}"]`);
  el?.classList.add("done");
  const questCount = $("#questCount");
  if (questCount) questCount.textContent = `${state.quests.size} / 5`;
  gainXP(name === "projects" ? 20 : 10, `${name.toUpperCase()} QUEST COMPLETE`);
  saveProgress();
}

function restoreMissionBoard() {
  state.quests.forEach((name) => document.querySelector(`[data-quest="${name}"]`)?.classList.add("done"));
  const questCount = $("#questCount");
  if (questCount) questCount.textContent = `${state.quests.size} / 5`;
  refreshXP();
}

/* -----------------------------------------------------
   Reveal animations + current level HUD
----------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

$$('.reveal').forEach((el) => revealObserver.observe(el));

const levelNumbers = { about: "01", skills: "02", projects: "03", journey: "04", contact: "FINAL" };
const levelObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    if (levelHud && levelNumbers[id]) levelHud.textContent = levelNumbers[id];

    if (id === "contact" && state.unlocked.has("contact")) {
      markQuest("contact");
      if (!state.finalBonus) {
        state.finalBonus = true;
        gainXP(40, "PORTFOLIO COMPLETE BONUS");
        saveProgress();
      }
    }
  },
  { threshold: [0.25, 0.5, 0.7] }
);

$$('.level-section').forEach((section) => levelObserver.observe(section));

/* -----------------------------------------------------
   Navigation
----------------------------------------------------- */
$("#menuBtn")?.addEventListener("click", () => $("#navMenu")?.classList.toggle("active"));

const previousGateFor = { skills: "about", projects: "skills", journey: "projects", contact: "journey" };

$$('nav a').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    $("#navMenu")?.classList.remove("active");
    const target = anchor.dataset.navLevel;
    if (target && target !== "about" && !state.unlocked.has(target)) {
      event.preventDefault();
      openCheckpoint(previousGateFor[target]);
    }
  });
});

/* -----------------------------------------------------
   Sound FX
----------------------------------------------------- */
let audioCtx;
function blip(freq = 520, dur = 0.06) {
  if (!state.sound) return;
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.frequency.value = freq;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    oscillator.connect(gain).connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + dur);
  } catch {}
}

$("#soundToggle")?.addEventListener("click", (event) => {
  state.sound = !state.sound;
  event.currentTarget.textContent = state.sound ? "🔊" : "🔇";
  if (state.sound) blip(650, 0.08);
  else stopGameMusic();
});

/* -----------------------------------------------------
   Background FX
----------------------------------------------------- */
const canvas = $("#fxCanvas");
const ctx = canvas?.getContext("2d");
let particles = [];

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seedParticles() {
  particles = Array.from({ length: 72 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.9 + 0.3,
    v: Math.random() * 0.32 + 0.07,
    a: Math.random() * 0.5 + 0.08,
    c: ["#57e8ff", "#a878ff", "#ff79c9", "#7df5b4"][Math.floor(Math.random() * 4)]
  }));
}

function animateFX() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles.forEach((particle) => {
    particle.y -= particle.v;
    if (particle.y < -8) {
      particle.y = innerHeight + 8;
      particle.x = Math.random() * innerWidth;
    }
    ctx.globalAlpha = particle.a;
    ctx.fillStyle = particle.c;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateFX);
}

if (canvas && ctx) {
  addEventListener("resize", resizeCanvas);
  resizeCanvas();
  seedParticles();
  animateFX();
}

const cursor = $("#cursorGlow");
addEventListener("pointermove", (event) => {
  if (!cursor) return;
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

$$('.skill-node').forEach((node) => node.addEventListener("mouseenter", () => blip(760, 0.05)));

/* -----------------------------------------------------
   Interactive Resume Rooms — point, click, discover
----------------------------------------------------- */
const checkpoints = {
  about: {
    code: "01", label: "INTERACTIVE RESUME · ROOM 01", title: "The Builder's Office",
    intro: "Walk around Shreya's virtual office. Click the glowing artifacts to discover who she is.",
    successTitle: "ROOM 02 UNLOCKED", successText: "The Skill Lab is ready.", image: "assets/unlock-skills.svg", next: "skills",
    objects: [
      {id:"degree", icon:"🎓", name:"Degree Badge", x:16, y:28, title:"Artificial Intelligence + Data Science", text:"Shreya Sri is pursuing a B.E. in Artificial Intelligence and Data Science at East Point College of Engineering and Technology, 2024–2028."},
      {id:"desk", icon:"💻", name:"Builder Desk", x:52, y:45, title:"Builder mode: ON", text:"Shreya enjoys turning classroom learning into practical digital experiences using AI, data and software development."},
      {id:"spark", icon:"✦", name:"Idea Board", x:76, y:25, title:"Curious by design", text:"Her portfolio is built around curiosity, hands-on projects, hackathons and experiments that turn ideas into things people can interact with."}
    ]
  },
  skills: {
    code: "02", label: "INTERACTIVE RESUME · ROOM 02", title: "The Skill Lab",
    intro: "Explore the workstation. Each artifact reveals a part of Shreya's technical stack.",
    successTitle: "ROOM 03 UNLOCKED", successText: "The Project Studio is ready.", image: "assets/unlock-projects.svg", next: "projects",
    objects: [
      {id:"frontend", icon:"</>", name:"Frontend Console", x:18, y:30, title:"Frontend + UI", text:"HTML, CSS and JavaScript form Shreya's core frontend toolkit for interactive interfaces and portfolio experiences."},
      {id:"data", icon:"◈", name:"Data Terminal", x:52, y:25, title:"Data + Databases", text:"SQL, MongoDB and R Programming support her data and database learning path."},
      {id:"ai", icon:"✦", name:"AI Core", x:78, y:46, title:"AI Exploration", text:"Shreya is exploring AI tools and intelligent products while building foundations in Python, C, C++, Java and Excel."}
    ]
  },
  projects: {
    code: "03", label: "INTERACTIVE RESUME · ROOM 03", title: "The Project Studio",
    intro: "Click the builds on the studio floor. The more you explore, the more of the portfolio you unlock.",
    successTitle: "ROOM 04 UNLOCKED", successText: "The Journey Vault is ready.", image: "assets/unlock-journey.svg", next: "journey",
    objects: [
      {id:"aqua", icon:"💧", name:"AquaSentinel", x:19, y:46, title:"AquaSentinel AI · Completed", text:"A completed team project focused on waterborne disease awareness. Shreya worked as Frontend/UI Lead and contributed to the backend using HTML, CSS, JavaScript and Python."},
      {id:"trip", icon:"✈", name:"Trip Crafter", x:52, y:28, title:"Trip Crafter · In development", text:"A travel-focused project built around practical, user-friendly digital experiences. The repository is available on GitHub."},
      {id:"learn", icon:"🧠", name:"AI Learning Platform", x:78, y:50, title:"AI-Based Learning Platform", text:"An AI-focused learning project currently in development, representing Shreya's interest in personalized and intelligent digital products."}
    ]
  },
  journey: {
    code: "04", label: "INTERACTIVE RESUME · ROOM 04", title: "The Journey Vault",
    intro: "The final room is a memory vault. Click the artifacts to see how Shreya is building her next chapter.",
    successTitle: "FINAL MISSION UNLOCKED", successText: "The collaboration portal is open.", image: "assets/unlock-final.svg", next: "contact",
    objects: [
      {id:"hack", icon:"⚡", name:"Hackathon Log", x:18, y:30, title:"Build under pressure", text:"Hackathon and project experiences have helped Shreya practice teamwork, experimentation and turning ideas into working prototypes."},
      {id:"cert", icon:"◈", name:"Learning Badge", x:51, y:24, title:"Keep learning", text:"Certifications, coursework and continuous practice are part of Shreya's evolving technical journey."},
      {id:"future", icon:"∞", name:"Future Portal", x:78, y:44, title:"Next level", text:"The goal is simple: keep growing across AI, data and software while building useful experiences that people enjoy using."}
    ]
  }
};

const checkpointOverlay = $("#checkpointOverlay");
const checkpointLabel = $("#checkpointLabel");
const checkpointTitle = $("#checkpointTitle");
const checkpointQuestion = $("#checkpointQuestion");
const checkpointChoices = $("#checkpointChoices");
const checkpointFeedback = $("#checkpointFeedback");
const checkpointCore = $("#checkpointCore");
const roomProgress = $("#roomProgress");
const roomProgressBar = $("#roomProgressBar");
const roomAvatar = $("#roomAvatar");
let activeCheckpoint = null;
let discoveredArtifacts = new Set();

function applyLocks() {
  ["skills", "projects", "journey", "contact"].forEach((level) => {
    const section = document.querySelector(`[data-level="${level}"]`);
    if (!section) return;
    const unlocked = state.unlocked.has(level);
    section.classList.toggle("locked-level", !unlocked);
    const lock = section.querySelector(`[data-lock="${level}"]`);
    if (lock) lock.setAttribute("aria-hidden", unlocked ? "true" : "false");
  });
  Object.entries(checkpoints).forEach(([gate, data]) => {
    const button = document.querySelector(`[data-gate="${gate}"]`);
    if (!button) return;
    if (state.completedGates.has(gate)) {
      button.classList.add("cleared");
      button.innerHTML = `${data.successTitle.replace(" UNLOCKED", "")} <span>✓</span>`;
    }
  });
}

function pauseNarrationForRoom() {
  if (!("speechSynthesis" in window)) return;
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    if (status) status.textContent = "PAUSED · EXPLORE ROOM";
    if (playPause) playPause.textContent = "▶ Resume narration";
  }
  startGameMusic();
}

function resumeNarrationAfterRoom() {
  stopGameMusic();
  if (!("speechSynthesis" in window)) return;
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    touring = true;
    if (playPause) playPause.textContent = "❚❚ Pause narration";
    if (status) status.textContent = `SPEAKING · ${Math.min(tourIndex + 1, tourKeys.length)}/${tourKeys.length}`;
  }
}

function openCheckpoint(gate) {
  const data = checkpoints[gate];
  if (!data || !checkpointOverlay) return;
  if (state.completedGates.has(gate)) {
    document.getElementById(data.next)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  activeCheckpoint = gate;
  discoveredArtifacts = new Set();
  checkpointLabel.textContent = data.label;
  checkpointTitle.textContent = data.title;
  checkpointQuestion.textContent = data.intro;
  if (checkpointCore) checkpointCore.textContent = data.code;
  checkpointFeedback.textContent = "Click an object. Its story will appear here.";
  checkpointFeedback.className = "artifact-panel";
  roomProgress.textContent = `0 / ${data.objects.length} ARTIFACTS`;
  roomProgressBar.style.width = "0%";
  checkpointChoices.innerHTML = data.objects.map((item) => `
    <button class="room-object" data-artifact="${item.id}" style="left:${item.x}%;top:${item.y}%" aria-label="Explore ${item.name}">
      <span class="object-pulse"></span><b>${item.icon}</b><small>${item.name}</small>
    </button>`).join("");
  checkpointOverlay.classList.add("active");
  checkpointOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  pauseNarrationForRoom();
  blip(640, 0.08);
}

function closeCheckpoint(resume = false) {
  stopGameMusic();
  checkpointOverlay?.classList.remove("active");
  checkpointOverlay?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeCheckpoint = null;
  if (resume) resumeNarrationAfterRoom();
}

function revealArtifact(id, button) {
  const data = checkpoints[activeCheckpoint];
  const item = data?.objects.find((obj) => obj.id === id);
  if (!item) return;
  button.classList.add("discovered");
  discoveredArtifacts.add(id);
  roomAvatar?.style.setProperty("left", `${Math.max(8, Math.min(82, item.x - 4))}%`);
  roomAvatar?.style.setProperty("top", `${Math.max(45, Math.min(80, item.y + 22))}%`);
  checkpointFeedback.innerHTML = `<small>ARTIFACT DISCOVERED</small><strong>${item.title}</strong><p>${item.text}</p>`;
  checkpointFeedback.className = "artifact-panel revealed";
  const total = data.objects.length;
  const count = discoveredArtifacts.size;
  roomProgress.textContent = `${count} / ${total} ARTIFACTS`;
  roomProgressBar.style.width = `${count / total * 100}%`;
  blip(760 + count * 90, 0.09);
  if (count === total) {
    checkpointFeedback.innerHTML += `<div class="room-complete">✦ ROOM COMPLETE · NEXT ROOM UNLOCKED</div>`;
    state.completedGates.add(activeCheckpoint);
    state.unlocked.add(data.next);
    markQuest(activeCheckpoint);
    saveProgress();
    applyLocks();
    setTimeout(() => {
      closeCheckpoint();
      showLevelBurst(data);
      setTimeout(resumeNarrationAfterRoom, 1600);
    }, 800);
  }
}

checkpointChoices?.addEventListener("click", (event) => {
  const button = event.target.closest(".room-object");
  if (!button) return;
  revealArtifact(button.dataset.artifact, button);
});

$$('[data-gate]').forEach((button) => button.addEventListener("click", () => openCheckpoint(button.dataset.gate)));
$$('[data-open-prev]').forEach((button) => button.addEventListener("click", () => openCheckpoint(button.dataset.openPrev)));
$("#checkpointClose")?.addEventListener("click", () => closeCheckpoint(true));
checkpointOverlay?.addEventListener("click", (event) => { if (event.target === checkpointOverlay) closeCheckpoint(true); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && checkpointOverlay?.classList.contains("active")) closeCheckpoint(true); });

/* -----------------------------------------------------
   Game music — generated locally, no external audio files
----------------------------------------------------- */
let musicTimer = null;
let musicGain = null;
let musicPlaying = false;
function startGameMusic() {
  if (!state.sound || musicPlaying) return;
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume?.();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.018;
    musicGain.connect(audioCtx.destination);
    musicPlaying = true;
    const notes = [110, 138.59, 164.81, 220, 277.18, 329.63];
    let step = 0;
    const tick = () => {
      if (!musicPlaying || !audioCtx || !musicGain) return;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = step % 4 === 0 ? "triangle" : "sine";
      osc.frequency.value = notes[step % notes.length];
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.045, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.42);
      osc.connect(g).connect(musicGain); osc.start(); osc.stop(audioCtx.currentTime + 0.45);
      step += 1;
    };
    tick(); musicTimer = setInterval(tick, 520);
  } catch {}
}
function stopGameMusic() {
  musicPlaying = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (musicGain && audioCtx) {
    try { musicGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12); } catch {}
  }
  musicGain = null;
}

/* -----------------------------------------------------
   Narrator — faster, finite, no repeat loop
----------------------------------------------------- */
const narration = {
  home: "Welcome to Shreya's portfolio. I'm Shreya Sri, an Artificial Intelligence and Data Science undergraduate. This portfolio is designed like a small game, so you can explore my work without feeling like you're reading a traditional resume.",
  about: "I'm Shreya Sri, studying Artificial Intelligence and Data Science at East Point College of Engineering and Technology. I enjoy combining what I learn in class with hands-on projects, hackathons and AI-assisted development. My goal is to keep growing across AI, data and software while building useful experiences.",
  skills: "Here is my skill tree. My development tools include HTML, CSS, JavaScript and Python. For data and databases I work with SQL, MongoDB and R programming. I also have programming foundations in C, C plus plus and Java, along with Excel and AI tools.",
  projects: "Let's look at the builds. AquaSentinel AI is a completed team project about waterborne disease awareness, where I worked as the frontend and UI lead and contributed to the backend. Trip Crafter is currently in development. I am also building an AI-based learning platform.",
  journey: "This is the journey level. Hackathon memories, team moments, certifications and learning milestones will be added as the portfolio grows. Think of this section as an evolving memory vault.",
  contact: "You've reached the final mission. If you'd like to discuss a project, collaboration or opportunity, you can email Shreya or connect with her through GitHub and LinkedIn. Thanks for exploring the portfolio."
};

const transcript = $("#transcriptText");
const status = $("#narrationStatus");
const playPause = $("#playPause");
const tourKeys = ["home", "about", "skills", "projects", "journey", "contact"];
let tourIndex = 0;
let touring = false;
let activeUtterance = null;

function safeCancelSpeech() {
  if (!("speechSynthesis" in window)) return;
  if (activeUtterance) activeUtterance.onend = null;
  activeUtterance = null;
  speechSynthesis.cancel();
}

function speak(text, onend, rate = 1.12) {
  if (!("speechSynthesis" in window)) {
    showToast("Speech is not supported in this browser.");
    return;
  }
  safeCancelSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;
  utterance.lang = "en-IN";
  utterance.rate = rate;
  utterance.pitch = 1.03;
  utterance.onend = () => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    if (typeof onend === "function") onend();
  };
  utterance.onerror = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  speechSynthesis.speak(utterance);
  if (transcript) transcript.textContent = text;
}

function finishTour() {
  touring = false;
  tourIndex = tourKeys.length;
  safeCancelSpeech();
  if (playPause) playPause.textContent = "↻ Replay narration";
  if (status) status.textContent = "FINISHED";
  if (transcript) transcript.textContent = "Narration complete. It stops here — replay only if you choose to.";
  showToast("Narration finished · no auto-repeat", 2300);
}

function playTour() {
  if (!("speechSynthesis" in window)) return;
  if (tourIndex >= tourKeys.length) {
    finishTour();
    return;
  }

  touring = true;
  if (playPause) playPause.textContent = "❚❚ Pause narration";
  if (status) status.textContent = `SPEAKING · ${tourIndex + 1}/${tourKeys.length}`;

  const key = tourKeys[tourIndex];
  document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "center" });

  speak(narration[key], () => {
    if (!touring) return;
    tourIndex += 1;
    if (tourIndex >= tourKeys.length) {
      finishTour();
      return;
    }
    setTimeout(() => {
      if (touring) playTour();
    }, 320);
  });
}

function startTourFromBeginning() {
  safeCancelSpeech();
  tourIndex = 0;
  touring = true;
  playTour();
}

$("#startTour")?.addEventListener("click", () => {
  startTourFromBeginning();
});

playPause?.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) return;

  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    touring = false;
    playPause.textContent = "▶ Resume narration";
    if (status) status.textContent = "PAUSED";
    return;
  }

  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    touring = true;
    playPause.textContent = "❚❚ Pause narration";
    if (status) status.textContent = "SPEAKING";
    return;
  }

  startTourFromBeginning();
});

$("#stopNarration")?.addEventListener("click", () => {
  touring = false;
  tourIndex = 0;
  safeCancelSpeech();
  if (playPause) playPause.textContent = "▶ Start narration";
  if (status) status.textContent = "READY";
  if (transcript) transcript.textContent = "Press “Start narration” and the portfolio will explain itself while you read along.";
});

$$('[data-tour]').forEach((button) => {
  button.addEventListener("click", () => {
    touring = false;
    const key = button.dataset.tour;
    if (transcript) transcript.textContent = narration[key];
    speak(narration[key]);
  });
});

/* -----------------------------------------------------
   AI assistant
----------------------------------------------------- */
const overlay = $("#aiOverlay");
const openAi = $("#openAi");
const closeAi = $("#closeAi");
const input = $("#aiInput");
const send = $("#sendButton");
const messages = $("#aiMessages");
const voice = $("#voiceButton");
const autoSpeak = $("#autoSpeak");

function showAI() {
  overlay?.classList.add("active");
  overlay?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => input?.focus(), 200);
}

function hideAI() {
  overlay?.classList.remove("active");
  overlay?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  safeCancelSpeech();
}

openAi?.addEventListener("click", showAI);
closeAi?.addEventListener("click", hideAI);
overlay?.addEventListener("click", (event) => {
  if (event.target === overlay) hideAI();
});

function addMsg(text, type) {
  if (!messages) return null;
  const el = document.createElement("div");
  el.className = `message ${type}`;
  if (type === "ai") {
    const small = document.createElement("small");
    small.textContent = "GUIDE";
    el.append(small);
  }
  el.append(document.createTextNode(text));
  messages.append(el);
  messages.scrollTop = messages.scrollHeight;
  return el;
}

const localGuideAnswers = [
  { test: /project|build|built|aqua|trip crafter|learning platform/i, answer: "Shreya has three featured builds. AquaSentinel AI is a completed team project focused on waterborne disease awareness, where she worked as the Frontend and UI Lead and also contributed to the backend. Trip Crafter is currently in development, and she is also building an AI-based learning platform." },
  { test: /skill|technology|tech stack|know|programming/i, answer: "Shreya's skills include HTML, CSS, JavaScript, Python, SQL, MongoDB, R Programming, C, C++, Java, Microsoft Excel and AI tools. Her main interests are AI, data and software development." },
  { test: /education|college|degree|study|student/i, answer: "Shreya Sri is pursuing a B.E. in Artificial Intelligence and Data Science at East Point College of Engineering and Technology, with graduation planned for 2028." },
  { test: /contact|email|reach|linkedin|github/i, answer: "You can contact Shreya at shreyasri2613@gmail.com. Her GitHub is github.com/Shreyasri2006 and her LinkedIn is linkedin.com/in/shreya-sri-844198314." },
  { test: /tour|portfolio|about|who is shreya|tell me about/i, answer: "Welcome to Shreya's portfolio. She is an Artificial Intelligence and Data Science undergraduate interested in AI, data and software development. Explore the About, Skills and Projects sections, or use the narrator to listen while you read." },
  { test: /hackathon|journey|experience|achievement/i, answer: "Shreya has participated in hackathon and project experiences and is continuing to build her skills. This portfolio's journey section is designed as an evolving space for future milestones and projects." }
];

function localGuide(question) {
  const hit = localGuideAnswers.find((item) => item.test.test(question));
  return hit?.answer || "I'm Shreya's portfolio guide. Ask me about her education, skills, projects, journey or contact details, and I'll explain them in a simple way.";
}

async function ask(question) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ message: question })
    });
    const type = response.headers.get("content-type") || "";
    if (!type.includes("application/json")) return localGuide(question);
    const data = await response.json();
    if (!response.ok) return data.error || localGuide(question);
    return data.answer || localGuide(question);
  } catch {
    return localGuide(question);
  }
}

async function sendMessage() {
  const question = input?.value.trim();
  if (!question || !send || send.disabled) return;
  addMsg(question, "user");
  input.value = "";
  send.disabled = true;
  send.textContent = "…";
  const el = addMsg("Thinking…", "ai");

  try {
    const answer = await ask(question);
    if (el) {
      el.innerHTML = "<small>GUIDE</small>" + answer.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char]));
    }
    if (autoSpeak?.checked) {
      touring = false;
      speak(answer, null, 1.12);
    }
  } catch (error) {
    if (el) el.textContent = error.message;
  } finally {
    send.disabled = false;
    send.textContent = "→";
  }
}

send?.addEventListener("click", sendMessage);
input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});
$$('.quick-asks button').forEach((button) => button.addEventListener("click", () => {
  if (input) input.value = button.dataset.question;
  sendMessage();
}));

let recognition;
let listening = false;
voice?.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMsg("Voice input is not supported here. Try Chrome or Edge.", "ai");
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      listening = true;
      voice.textContent = "●";
      voice.classList.add("listening");
    };
    recognition.onresult = (event) => {
      if (input) input.value = event.results[0][0].transcript;
      sendMessage();
    };
    recognition.onerror = () => addMsg("I couldn't hear that clearly. Please try again.", "ai");
    recognition.onend = () => {
      listening = false;
      voice.textContent = "🎙";
      voice.classList.remove("listening");
    };
  }

  if (listening) recognition.stop();
  else {
    try { recognition.start(); } catch {}
  }
});

$("#stopVoice")?.addEventListener("click", safeCancelSpeech);

document.addEventListener("click", (event) => {
  if (event.target.closest("a,button")) blip(560, 0.035);
});

/* -----------------------------------------------------
   Startup
----------------------------------------------------- */
restoreMissionBoard();
applyLocks();
