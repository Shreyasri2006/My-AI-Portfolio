require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(__dirname));

const KNOWLEDGE = `
You are Shreya Sri's portfolio AI assistant.
Only use the verified information below. Never invent details.
Name: Shreya Sri.
Role: AI Data Science Engineer.
College: East Point College of Engineering and Technology.
Degree: B.E. in Artificial Intelligence and Data Science, 2024-2028.
Skills: HTML, CSS, JavaScript, SQL, MongoDB, Python, R programming; academic/basic C, C++, Java and Excel.
Project 1: AquaSentinel AI — completed team project about awareness of waterborne disease risks. Shreya handled full frontend/UI development and some backend work. Frontend HTML/CSS/JavaScript, backend Python.
GitHub: https://github.com/Shreyasri2006/AquaSentinel-AI
Project 2: Trip Crafter — currently in development.
GitHub: https://github.com/Shreyasri2006/trip-crafter
Project 3: AI-Based Learning Platform — currently in development; no public link yet.
Achievements: participated in/build a hackathon project using AI tools in a team and built a solo AI-assisted project. Do not invent event names, dates, rankings or awards.
Certificates and hackathon photos are pending and will be added later.
Email: shreyasri2613@gmail.com
GitHub: https://github.com/Shreyasri2006
LinkedIn: https://www.linkedin.com/in/shreya-sri-844198314
Answer naturally and briefly for voice conversation.
`;

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({error:"AI backend is not configured. Add OPENAI_API_KEY to .env."});
    }
    const message = String(req.body.message || "").trim();
    if (!message) return res.status(400).json({error:"Please enter a question."});

    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-mini",
      instructions: KNOWLEDGE,
      input: message,
      max_output_tokens: 220
    });

    res.json({answer: result.output_text || "I couldn't answer that right now."});
  } catch (error) {
    console.error(error);
    res.status(500).json({error:"The AI assistant is temporarily unavailable."});
  }
});

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
