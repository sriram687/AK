# Ollama Bot - Local AI Workspace

Ollama Bot is a premium, production-quality dark-themed AI chatbot web application built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. It connects directly to a locally hosted Ollama instance to provide a polished, responsive developer assistant interface (inspired by Claude, Vercel, and Linear).

---

## Features
- **Server-Side Streaming**: Streams AI responses token-by-token directly to the browser (using standard SSE streams on Next.js backend, bypassing CORS constraints).
- **Installed Models Discovery**: Queries the Ollama tags API dynamically, displaying available local models with support for warning triggers and fallback selections.
- **Persistent Chat History**: Local storage persistence for saving, renaming, deleting, and searching through past conversations.
- **Code Highlighting**: Beautiful horizontal-scrolling code blocks with individual language tags, indentation preservation, and quick clipboard copy functionality.
- **Composer Controls**: Auto-expanding text area supporting Enter-to-send toggle, model display tags, and Generation Stop triggers via `AbortController`.
- **Responsive Layout**: Collapsible sidebar navigation for desktop, tablet, and mobile drawer views.
- **Connection Health Checks**: Real-time polling to verify if the Ollama server is online, with status indicator dots (green, yellow, red).
- **Settings Dashboard**: Advanced user configuration for default models, generation temperature, context length (`num_ctx`), layout spacing density, and syntax themes.

---

## Requirements
- **Node.js**: `v18.x` or higher
- **Ollama**: A running Ollama server reachable from your network.

---

## Getting Started

### 1. Clone or Move to Project Directory
Ensure you are in the workspace root:
```bash
cd /home/sriram/PROJECTS/OLLAMA_BOT
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` is used to ensure compatibility of packages like `react-markdown` with React 19)*

### 3. Environment Variables
Create or verify `.env.local` in the root of the project:
```env
OLLAMA_BASE_URL=http://172.16.7.240:11434
```
Ensure this URL matches your Ollama installation.

### 4. Running the Development Server
Start the Next.js server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Running the Production Build
To build and start the optimized production version:
```bash
npm run build
npm start
```

---

## Usage Guide

### Pulling the Default Model
By default, the application is configured to look for the **`qwen2.5-coder:14b`** model. If you do not have it installed, pull it by executing the following in your terminal:
```bash
ollama pull qwen2.5-coder:14b
```
If this model is not present, the model selector will automatically fall back to the first available model on your Ollama server and alert you with a gentle notification.

### Customizing Generation Parameters
Click on **Settings** in the bottom left of the sidebar:
- **Generation Tab**: Adjust `temperature` (higher for more creative responses, lower for deterministic logic) and `context length` (retains memory for longer code projects).
- **Appearance Tab**: Choose between comfortable or compact message layouts and set your favorite syntax highlighting style.

---

## Troubleshooting

### "Unable to connect to Ollama at the configured server."
1. Ensure the Ollama background service is running on the target machine.
2. Verify that network routing allows connecting to `http://172.16.7.240:11434`. (If hosted on another machine, ensure Ollama is launched with `OLLAMA_HOST=0.0.0.0` environment variable to accept external requests).
3. Test connectivity using `curl`:
   ```bash
   curl http://172.16.7.240:11434
   ```

### Hydration Warnings or State Desyncs
If there are minor mismatches due to active browsers, clean the cookies and local storage keys containing `ollama_bot_conversations` and `ollama_bot_settings` or refresh the page.
