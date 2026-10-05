# AI Tools & Technologies Disclosure

In accordance with PRD Section 20, this document itemizes all AI foundation models, orchestration engines, and software dependencies powering Valor AppStudio.

---

## 1. Foundation Models & Orchestration Architecture

* **Google Gemini API (`gemini-2.5-flash`)**: Serves as the primary intelligence engine. Generates structured JSON outputs for product understanding, architecture plans, Expo source code, plain-language explanations, and rebuild curricula.
* **Vercel AI SDK Core (`ai` & `@ai-sdk/google`)**: Utilized for NDJSON object streaming, typed schema validation via Zod, and single-pass automatic repair calls when model output malforms.
* **Client-Side Project Engine**: Stores state locally in browser storage via Zustand persist. Zero user data is persisted server-side. Export bundles are assembled in-memory using `JSZip`.
* **Sandboxed Code Preview**: Renders interactive components in an iPhone mockup frame and bridges directly into the official Expo Snack web runtime for interactive testing without native build tools.

---

## 2. Frameworks & UI Stack

* **Next.js 16+ (App Router)**: Full-stack web application with React 19 server route handlers.
* **TypeScript**: Strict type safety and schema inference.
* **Tailwind CSS v4**: Valor dark design tokens (Obsidian Navy canvas with Electric Indigo & Sky Cyan accents).
* **Monaco Editor (`@monaco-editor/react`)**: Syntax-highlighted code viewer with selection tracking.
* **Zustand 5**: Client state & persistence with repository interface.
* **Zod v3**: Schema-first validation across all 6 pipeline stages.

---

## 3. Safety & Responsible AI Commitments

* **Dependency Allow-List**: A hardcoded allow-list prevents generation of unapproved native dependencies or unauthorized network calls.
* **Harmful Prompt Rejection**: An automated keyword and heuristic filter intercepts surveillance, malware, or credential theft ideas before model execution.
* **Grounding Guarantee**: Explain and Chat responses are strictly grounded in the generated project source code and will not hallucinate non-existent files.
