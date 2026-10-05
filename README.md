# Valor AppStudio: Architecture, Setup & Technologies

Valor AppStudio is an AI-powered App Development platform engineered for creating cross-platform mobile apps (Expo / React Native) with complete architectural transparency.

---

## 1. Quick Start

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Dilli2006/Valor.git
cd Valor

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Environment Configuration

To enable live AI generation, copy the sample environment file:
```bash
cp .env.example .env.local
```

Populate your Google Gemini API key:
```env
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"
```

> **Note on Zero-Key Demo Mode**: If no API key is provided, Valor AppStudio operates seamlessly in sample mode with pre-built benchmark projects (**CampusPulse** and **Streakly**) showcasing all 6 pipeline stages end-to-end.

---

## 3. The 6-Stage Pipeline

1. **Understand**: Converts user ideas into structured briefs with assumptions, risks, and clarifying questions.
2. **Plan**: Establishes MoSCoW feature sets, screen flows, data entities, and stack rationale.
3. **Build**: Generates runnable Expo React Native projects in 3 phases (Skeleton → Screens → Polish).
4. **Explain**: Provides file summaries, plan decision justifications, and line-level explanations on selection.
5. **Learn**: Creates an app-specific curriculum with step-by-step rebuild lessons, hands-on challenges, and a 5-question scored quiz.
6. **Preview**: Renders an interactive iPhone mockup frame with live screen switching and Expo Snack embed.

---

## 4. Documentation & Compliance
See the **[AI Tools & Technologies Disclosure](DISCLOSURE.md)** file (or the in-app `/disclosure` page when running locally) for full details on model architectures, schemas, and responsible AI guardrails.
