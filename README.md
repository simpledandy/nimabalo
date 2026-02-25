# 🌿 Nimabalo — Uzbek Q&A Platform

**Nimabalo** is an open, community-driven Q&A platform built for the Uzbek-speaking world.  
It’s where curiosity meets culture — a space for asking and answering meaningful questions about science, life, and art.

---

## 🌍 Vision

We’re creating a place for thoughtful Uzbek content — where ideas flow freely and respectfully.  
Nimabalo is open-source, educational, and collaborative:  
a real-world lab for learning full-stack development together.

---

## 🧭 Guiding Principles

- **Meaningful over viral.** We value clarity and thoughtfulness.
- **Code as craft.** Beautiful, understandable code is part of our culture.
- **Everyone learns.** No gatekeeping — contributors of all skill levels are welcome.
- **Respectful community.** Tone and trust matter as much as technology.

---

## 🏗️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS with custom design system
- **Language:** TypeScript
- **Deployment:** Vercel
- **Telegram Bot:** Simple and familiar auth for Uzbek users

---

## 🚀 Getting Started

Clone the repository:
```bash
git clone https://github.com/simpledandy/nimabalo.git
cd nimabalo
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Visit http://localhost:3000
 to see it running.

🧩 Project Structure
```bash
src/
├── app/          # Next.js routes and layouts
├── components/   # UI components
├── lib/          # Helpers, hooks, Supabase client
├── styles/       # Tailwind and design tokens
└── supabase/     # DB schema context and onboarding notes
```

## 🤝 Contributing

We welcome learners, dreamers, and curious minds.
You can help by fixing bugs, improving design, or simply joining discussions.

See our [CONTRIBUTING.md](./CONTRIBUTING.md)
 for details.

### 🔐 Environment Setup

Create your local environment file from the example template before running the app:

```bash
cp .env.example .env.local
```

Then fill in the required Supabase values in `.env.local`.

For database setup and schema context, see [`supabase/README.md`](./supabase/README.md).

## 🛣️ Roadmap (Work-in-Progress)

 - Clean and simplify documentation
 - Finalize visual identity and design system
 - Refine moderation & community model
 - Add badges and gamified achievements
 - Improve Supabase queries and security
 - Launch public beta at nimabalo.uz

## ⚖️ License

Licensed under the [Apache License 2.0](./LICENSE).
Copyright © 2025 Ruxsoraxon Kenjayeva
