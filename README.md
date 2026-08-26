# Shreya Sri — Interactive AI Portfolio 🎮✨

A creative, game-style portfolio for Shreya Sri with voice narration, browser voice input, animated effects, an optional AI assistant, and a built-in offline fallback.

## ✨ Features

- 🎙️ Read + listen portfolio narrator
- 🗣️ Browser speech input for asking questions
- 🤖 Optional OpenAI-powered portfolio assistant
- 🧠 Local assistant fallback when no backend/API is available
- ⚡ Animated particles, lightning, glowing UI and floating tech effects
- 🎮 XP, quests and game-style navigation
- 📱 Responsive design
- ♿ Reduced-motion support
- 🔐 API key stays on the server and is ignored by Git via `.gitignore`

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

The portfolio can also be deployed as a static site. The narrator and built-in local assistant work without Node.js or an API key.

The optional `/api/chat` OpenAI backend **cannot run on GitHub Pages** because GitHub Pages is static hosting. For the full AI backend, deploy `server.js` to a Node-compatible host and keep the API key in that host's environment variables.

If you only want the static portfolio on GitHub Pages, upload the repository files and publish the site from the `main` branch. The local assistant will be used automatically when the API endpoint is unavailable.

## 📁 Project structure

```text
.
├── assets/
│   └── aquasentinel.png
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── script.js
├── server.js
├── style.css
└── README.md
```

## 🧪 Test

```bash
npm start
```

Then check:

```text
http://localhost:3000/api/health
```

The response should be JSON. If no API key is configured, it should report local mode.

## 👩‍💻 About

Shreya Sri is an Artificial Intelligence and Data Science undergraduate focused on AI, data, software development and practical digital experiences.

- GitHub: https://github.com/Shreyasri2006
- LinkedIn: https://www.linkedin.com/in/shreya-sri-844198314
- Email: shreyasri2613@gmail.com

## 📄 License

MIT License — see `LICENSE`.
