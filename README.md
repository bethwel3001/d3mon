# Ghost in the Git

Ghost in the Git is a web application that surfaces abandoned GitHub repositories and channels their commit history into poetic laments and synthesized speech. It interrogates dormant codebases using open-weight language models and generates spoken eulogies using voice AI.

## Prerequisites

- <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="16" height="16" align="center" /> Node.js (v20 or higher)
- <img src="https://cdn.simpleicons.org/pnpm/F69220" width="16" height="16" align="center" /> pnpm (v9 or higher)
- <img src="https://cdn.simpleicons.org/elevenlabs/white" width="16" height="16" align="center" /> ElevenLabs API key (for text-to-speech audio synthesis)
- <img src="https://cdn.simpleicons.org/ollama/white" width="16" height="16" align="center" /> A local open-weight LLM instance (such as Gemma 2 via Ollama) or an OpenAI-compatible API endpoint

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/ghost-in-the-git.git
   cd ghost-in-the-git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Set `ELEVENLABS_API_KEY`, `LLM_ENDPOINT`, and optionally `GITHUB_TOKEN` in `.env.local`.

4. Start the development server:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser.

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **GitHub API** | Octokit |
| **AI Inference** | Gemma 2 (via Ollama or compatible API) |
| **Voice Synthesis** | ElevenLabs API |
| **Package Manager** | pnpm |

## Contributing

Please review the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on our workflow, coding standards, and pull request process.

## Submission Blog

Read the full Hacktoberfest challenge submission on DEV.to: [Ghost in the Git: Conjuring the Spirits of Abandoned Repositories](https://dev.to/bethwel3001/ghost-in-the-git-conjuring-the-spirits-of-abandoned-repositories-3i4p)
