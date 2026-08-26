# Shreya Sri — Interactive AI Portfolio 🎮✨

A GitHub-ready, game-style portfolio for Shreya Sri with finite voice narration, playable level checkpoints, animated profile graphics, XP progression, browser voice input, an optional OpenAI backend, and a built-in offline portfolio guide.

## ✨ What is new in this version

- 🎮 **Playable checkpoint after every portfolio level**
  - Level 01 → Profile Pulse
  - Level 02 → Stack Sync
  - Level 03 → Build Scanner
  - Level 04 → Journey Link
- 🔐 The next level is visually locked until its simple profile-based checkpoint is cleared.
- ✨ A full-screen animated **LEVEL UNLOCKED** graphic + text pop appears after every successful checkpoint.
- 🧬 New profile-constellation artwork and richer visual effects.
- 🏆 XP and mission progress are saved in `localStorage` so the journey can continue after refresh.
- 🎙️ Portfolio narration runs at roughly **1.12× browser speech rate** so it feels more energetic.
- 🛑 Narration now **stops after the final mission** instead of looping back to the beginning automatically.
- 🤖 AI assistant answers can still be read aloud, also using the quicker voice rate.
- 📱 Responsive checkpoint game, level locks and graphics.
- ♿ Reduced-motion support and keyboard focus states.

## 🚀 Run locally with the backend

Requirements: Node.js 18+

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

### Optional OpenAI assistant

1. Copy `.env.example` to `.env`.
2. Add your API key to `OPENAI_API_KEY`.
3. Optionally set `OPENAI_MODEL` to a model available to your account.
4. Restart the server.

Never commit `.env` or an API key to GitHub.

## 🌐 GitHub Pages / static hosting

The portfolio can also be deployed as a static site. The narrator, level games, XP system and built-in local assistant work without Node.js or an API key.

The optional `/api/chat` OpenAI backend **cannot run on GitHub Pages** because GitHub Pages is static hosting. For the full AI backend, deploy `server.js` to a Node-compatible host and keep the API key in that host's environment variables.

If you only want the static portfolio on GitHub Pages, upload the repository files and publish the site from the `main` branch. The local assistant will be used automatically when the API endpoint is unavailable.

## 🧪 Reset the game during development

Progress is stored in the browser under:

```text
shreyaPortfolioProgressV4
```

To test from Level 01 again, open DevTools → Application/Storage → Local Storage and remove that key, then refresh the page.

## 📁 Project structure

```text
.
├── assets/
│   ├── aquasentinel.png
│   ├── profile-constellation.svg
│   ├── level-unlocked.svg
│   └── final-mission.svg
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── script.js
├── server.js
├── style.css
├── README.md
└── LICENSE
```

## 🧪 Quick checks

```bash
node --check script.js
node --check server.js
npm start
```

Then check:

```text
http://localhost:3000/api/health
```

If no API key is configured, it should report local mode.

## 👩‍💻 About

Shreya Sri is an Artificial Intelligence and Data Science undergraduate focused on AI, data, software development and practical digital experiences.

- GitHub: https://github.com/Shreyasri2006
- LinkedIn: https://www.linkedin.com/in/shreya-sri-844198314
- Email: shreyasri2613@gmail.com

## 📄 License

MIT License — see `LICENSE`.
