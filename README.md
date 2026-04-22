# AI Blog Writer with SEO

An AI-powered blog writing platform that generates SEO-optimized blog posts with proper meta tags, keywords, headings structure, and schema markup suggestions.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Express + Bun + Vercel AI SDK + Google Gemini |
| Database | SQLite (via `bun:sqlite`) |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) v1.0+
- Google Generative AI API key — get one at [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

### 1. Install dependencies

```bash
cd ai-blog-writer
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Running the App

```bash
npm run dev
```

Go to [http://localhost:3000](http://localhost:3000)

## Features

- **SEO Optimization**: Auto-generates meta title, description, and keywords
- **Content Structure**: Proper H1, H2, H3 heading hierarchy
- **Schema Markup**: JSON-LD schema suggestions for rich snippets
- **Keyword Density**: Natural keyword integration
- **FAQ Section**: Generated FAQ for featured snippets
- **Readability Score**: Flesch reading ease analysis
- **Internal/External Links**: Link suggestions
- **Preview Mode**: See how your blog will look
- **Export**: Copy as HTML or plain text
