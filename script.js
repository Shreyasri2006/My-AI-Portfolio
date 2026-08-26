const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE_KEY = "shreyaPortfolioProgressV4";
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
   Level checkpoint mini-games
----------------------------------------------------- */
const checkpoints = {
  about: {
    code: "01",
    label: "LEVEL 01 CHECKPOINT · PROFILE PULSE",
    title: "Which path is Shreya studying?",
    question: "Scan the profile and pick the field that matches Shreya's degree.",
    choices: ["Artificial Intelligence & Data Science", "Civil Engineering", "Architecture"],
    correct: 0,
    successTitle: "LEVEL 02 UNLOCKED",
    successText: "Skill Tree is online.",
    image: "assets/unlock-skills.svg",
    next: "skills"
  },
  skills: {
    code: "02",
    label: "LEVEL 02 CHECKPOINT · STACK SYNC",
    title: "Activate the frontend combo.",
    question: "Which stack appears in Shreya's development skill tree?",
    choices: ["HTML + CSS + JavaScript", "Swift + Kotlin + Rust", "MATLAB + Unity + Go"],
    correct: 0,
    successTitle: "LEVEL 03 UNLOCKED",
    successText: "Project scanner is ready.",
    image: "assets/unlock-projects.svg",
    next: "projects"
  },
  projects: {
    code: "03",
    label: "LEVEL 03 CHECKPOINT · BUILD SCANNER",
    title: "Find the completed team build.",
    question: "Which project is shown as Shreya's completed AquaSentinel team build?",
    choices: ["Trip Crafter", "AquaSentinel AI", "AI-Based Learning Platform"],
    correct: 1,
    successTitle: "LEVEL 04 UNLOCKED",
    successText: "Journey Vault is open.",
    image: "assets/unlock-journey.svg",
    next: "journey"
  },
  journey: {
    code: "04",
    label: "FINAL CHECKPOINT · JOURNEY LINK",
    title: "Complete the learning loop.",
    question: "Which pair belongs in Shreya's evolving journey and memory vault?",
    choices: ["Hackathons + certifications", "Only exam scores", "Only social media posts"],
    correct: 0,
    successTitle: "FINAL MISSION UNLOCKED",
    successText: "Contact portal is ready.",
    image: "assets/unlock-final.svg",
    next: "contact"
  }
};

const checkpointOverlay = $("#checkpointOverlay");
const checkpointLabel = $("#checkpointLabel");
const checkpointTitle = $("#checkpointTitle");
const checkpointQuestion = $("#checkpointQuestion");
const checkpointChoices = $("#checkpointChoices");
const checkpointFeedback = $("#checkpointFeedback");
const checkpointCore = $("#checkpointCore");
let activeCheckpoint = null;

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

function openCheckpoint(gate) {
  const data = checkpoints[gate];
  if (!data || !checkpointOverlay) return;

  if (state.completedGates.has(gate)) {
    document.getElementById(data.next)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  activeCheckpoint = gate;
  checkpointLabel.textContent = data.label;
  checkpointTitle.textContent = data.title;
  checkpointQuestion.textContent = data.question;
  checkpointCore.textContent = data.code;
  checkpointFeedback.textContent = "Pick one answer to open the next portal.";
  checkpointFeedback.className = "checkpoint-feedback";

  checkpointChoices.innerHTML = data.choices
    .map((choice, index) => `<button class="checkpoint-choice" data-choice="${index}"><span>0${index + 1}</span>${choice}</button>`)
    .join("");

  checkpointOverlay.classList.add("active");
  checkpointOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  blip(640, 0.08);

  checkpointChoices.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerCheckpoint(Number(button.dataset.choice), button));
  });
}

function closeCheckpoint() {
  checkpointOverlay?.classList.remove("active");
  checkpointOverlay?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeCheckpoint = null;
}

function answerCheckpoint(index, button) {
  const data = checkpoints[activeCheckpoint];
  if (!data) return;

  checkpointChoices.querySelectorAll("button").forEach((choice) => choice.classList.remove("wrong", "correct"));

  if (index !== data.correct) {
    button.classList.add("wrong");
    checkpointFeedback.textContent = "Not this signal. Re-scan the profile and try once more.";
    checkpointFeedback.className = "checkpoint-feedback error";
    checkpointOverlay.querySelector(".checkpoint-shell")?.classList.add("shake");
    setTimeout(() => checkpointOverlay.querySelector(".checkpoint-shell")?.classList.remove("shake"), 420);
    blip(190, 0.13);
    return;
  }

  button.classList.add("correct");
  checkpointFeedback.textContent = "Signal matched. Portal unlocked.";
  checkpointFeedback.className = "checkpoint-feedback success";
  blip(920, 0.13);

  state.completedGates.add(activeCheckpoint);
  state.unlocked.add(data.next);
  markQuest(activeCheckpoint);
  saveProgress();
  applyLocks();

  setTimeout(() => {
    closeCheckpoint();
    showLevelBurst(data);
  }, 520);
}

function showLevelBurst(data) {
  const burst = $("#levelBurst");
  if (!burst) return;
  $("#burstTitle").textContent = data.successTitle;
  $("#burstText").textContent = data.successText;
  if (data.image && $("#burstImage")) $("#burstImage").src = data.image;
  burst.classList.add("active");
  burst.setAttribute("aria-hidden", "false");
  blip(1040, 0.16);

  setTimeout(() => {
    burst.classList.remove("active");
    burst.setAttribute("aria-hidden", "true");
    document.getElementById(data.next)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1500);
}

$$('[data-gate]').forEach((button) => button.addEventListener("click", () => openCheckpoint(button.dataset.gate)));
$$('[data-open-prev]').forEach((button) => button.addEventListener("click", () => openCheckpoint(button.dataset.openPrev)));
$("#checkpointClose")?.addEventListener("click", closeCheckpoint);
checkpointOverlay?.addEventListener("click", (event) => {
  if (event.target === checkpointOverlay) closeCheckpoint();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && checkpointOverlay?.classList.contains("active")) closeCheckpoint();
});

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
