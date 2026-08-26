require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

const KNOWLEDGE = `
You are Shreya Sri's portfolio guide. Answer only from the verified information below. Never invent awards, dates, employers, rankings, project details, technologies or personal facts.
Name: Shreya Sri.
Education: B.E. in Artificial Intelligence and Data Science, East Point College of Engineering and Technology, 2024-2028.
Focus: AI, data, software development and practical digital experiences.
Skills: HTML, CSS, JavaScript, Python, SQL, MongoDB, R Programming, C, C++, Java, Microsoft Excel and AI tools.
AquaSentinel AI: completed team project about waterborne disease awareness. Shreya's role: Frontend/UI Lead plus backend contribution. Stack: HTML, CSS, JavaScript, Python. GitHub: https://github.com/Shreyasri2006/AquaSentinel-AI
Trip Crafter: currently in development. GitHub: https://github.com/Shreyasri2006/trip-crafter
AI-Based Learning Platform: currently in development; no public link yet.
Hackathons: Shreya has participated in hackathon/project experiences, but do not claim event names, dates, rankings or awards.
Contact: shreyasri2613@gmail.com
GitHub: https://github.com/Shreyasri2006
LinkedIn: https://www.linkedin.com/in/shreya-sri-844198314
Style: friendly, encouraging, concise, natural for voice. If asked something unrelated, say you are the portfolio guide and offer to discuss Shreya's work.
`;

function localAnswer(message) {
  const q = message.toLowerCase();
  if (/project|build|built|aqua|trip crafter|learning platform/.test(q)) {
    return "Shreya has three featured builds. AquaSentinel AI is a completed team project focused on waterborne disease awareness, where she worked as the Frontend and UI Lead and also contributed to the backend. Trip Crafter is currently in development, and she is also building an AI-based learning platform.";
  }
  if (/skill|technology|tech stack|know|programming/.test(q)) {
    return "Shreya's skills include HTML, CSS, JavaScript, Python, SQL, MongoDB, R Programming, C, C++, Java, Microsoft Excel and AI tools. Her main interests are AI, data and software development.";
  }
  if (/education|college|degree|study|student/.test(q)) {
    return "Shreya Sri is pursuing a B.E. in Artificial Intelligence and Data Science at East Point College of Engineering and Technology, with graduation planned for 2028.";
  }
  if (/contact|email|reach|linkedin|github/.test(q)) {
    return "You can contact Shreya at shreyasri2613@gmail.com. Her GitHub is github.com/Shreyasri2006 and her LinkedIn is linkedin.com/in/shreya-sri-844198314.";
  }
  if (/tour|portfolio|about|who is shreya|tell me about/.test(q)) {
    return "Welcome to Shreya's portfolio. She is an Artificial Intelligence and Data Science undergraduate interested in AI, data and software development. Explore the About, Skills and Projects sections, or use the narrator to listen while you read.";
  }
  if (/hackathon|journey|experience|achievement/.test(q)) {
    return "Shreya has participated in hackathon and project experiences and is continuing to build her skills. This portfolio's journey section is designed as an evolving space for future milestones and projects.";
  }
  return "I'm Shreya's portfolio guide. Ask me about her education, skills, projects, journey or contact details, and I'll explain them in a simple way.";
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(client), model: MODEL, mode: client ? "openai" : "local" });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Please enter a question." });
  if (message.length > 1200) return res.status(413).json({ error: "Please keep the question under 1200 characters." });

  // The portfolio remains useful even without an API key.
  if (!client) return res.json({ answer: localAnswer(message), source: "local" });

  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: KNOWLEDGE,
      input: message,
      max_output_tokens: 260
    });
    res.json({ answer: response.output_text || localAnswer(message), source: "openai" });
  } catch (error) {
    console.error("OpenAI error:", error?.message || error);
    // Never send an HTML page or a raw server error to the frontend.
    res.json({ answer: localAnswer(message), source: "local-fallback" });
  }
});

// Return JSON for unknown API routes so a frontend never gets an HTML document
// when it is expecting JSON.
app.use("/api", (req, res) => res.status(404).json({ error: "API route not found." }));

app.listen(PORT, () => console.log(`Shreya portfolio running at http://localhost:${PORT}`));
