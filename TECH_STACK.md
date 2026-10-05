# Technical Stack & AI Technology Audit

This document records all software dependencies, libraries, and AI services utilized in Valor AppStudio as required by PRD Section 20.

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Core Full-Stack** | Next.js (App Router) | 16.3.8 | React 19 framework with server route handlers |
| **Language** | TypeScript | ^5.0.0 | Strict type safety and schema inference |
| **Styling & Design** | Tailwind CSS + @tailwindcss/postcss | ^4.0.0 | Valor Obsidian Navy & Electric Indigo design tokens |
| **Icons** | Lucide React | ^1.0.0 | Consistent modern iconography |
| **State Management** | Zustand + persist | 5.0.15 | Client-side localStorage persistence with repository interface |
| **AI Orchestration** | Vercel AI SDK (`ai`) | 5.0.271 | Structured object streaming, schema validation, repair retry |
| **Primary LLM** | Google Gemini API (`@ai-sdk/google`) | 2.0.101 | Primary generative model (`gemini-2.5-flash`) |
| **Fallback LLM** | OpenAI Compatible (`@ai-sdk/openai`) | 2.0.133 | Configurable secondary model |
| **Schema Validation** | Zod | 3.25.76 | Type-safe JSON schema enforcement on all stages |
| **Code Viewer** | Monaco Editor (`@monaco-editor/react`) | ^4.6.0 | Syntax highlighting and range selection tracking |
| **Export Engine** | JSZip | ^3.10.1 | Client-side ZIP bundle packaging |
| **Target Runtime** | Expo / React Native | SDK 52 | Mobile cross-platform output architecture |
