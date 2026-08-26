# Shreya Sri — Interactive AI Portfolio

A redesigned portfolio that feels like a calm, playful mini-game rather than a traditional resume.

## Included

- Medium, readable typography (no oversized wall-of-text headings).
- Voice portfolio narrator: the visitor can read the transcript while the browser reads each section aloud.
- Voice input for the AI assistant using the browser Speech Recognition API.
- AI answers are also read aloud when "Read AI answers aloud" is enabled.
- Game-style XP bar, quests, levels, unlockable sections and small interaction sounds.
- Animated portal, floating tokens, lightning flashes, particles, cursor glow and hover effects.
- Reduced-motion support for accessibility.
- Responsive layout for desktop, tablet and mobile.
- Express backend with OpenAI Responses API integration.
- Existing AquaSentinel project image retained from the supplied ZIP.

## Run locally

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your OpenAI API key in `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

The frontend still works without an API key; the scripted portfolio narrator is browser-based. The AI chat requires the backend API key.

## Voice notes

Chrome/Edge provide the best browser support for speech recognition. Speech synthesis is handled by the browser, so the exact voice depends on the visitor's operating system/browser.

## Files

- `index.html` — frontend structure/content
- `style.css` — visual system, animations and responsive design
- `script.js` — game effects, narrator, speech controls and AI chat UI
- `server.js` — Express backend and AI endpoint
- `.env.example` — environment variable template
- `assets/aquasentinel.png` — retained project image
