require("dotenv").config();
const express=require("express");
const path=require("path");
const OpenAI=require("openai");

const app=express();
const PORT=process.env.PORT||3000;
const MODEL=process.env.OPENAI_MODEL||"gpt-5.6-mini";
const client=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;

app.use(express.json({limit:"20kb"}));
app.use(express.static(__dirname));

const KNOWLEDGE=`
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

app.get("/api/health",(req,res)=>res.json({ok:true,aiConfigured:Boolean(client),model:MODEL}));

app.post("/api/chat",async(req,res)=>{
  const message=String(req.body?.message||"").trim();
  if(!message)return res.status(400).json({error:"Please enter a question."});
  if(message.length>1200)return res.status(413).json({error:"Please keep the question under 1200 characters."});
  if(!client)return res.status(503).json({error:"AI backend is not configured. Add OPENAI_API_KEY to .env, then restart the server."});
  try{
    const response=await client.responses.create({
      model:MODEL,
      instructions:KNOWLEDGE,
      input:message,
      max_output_tokens:260
    });
    res.json({answer:response.output_text||"I couldn't answer that right now."});
  }catch(error){
    console.error(error);
    res.status(500).json({error:"The AI assistant is temporarily unavailable. Please try again."});
  }
});

app.listen(PORT,()=>console.log(`Shreya portfolio running at http://localhost:${PORT}`));
