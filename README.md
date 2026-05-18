# Realtor Email Generator

A web app for **Compass Line Ventures** that helps real estate agents
generate 5 professional cold-outreach emails in seconds, powered by the
Anthropic Claude API.

Agents fill out a short form (name, city/state, target audience, unique
selling point, call to action), click **Generate**, and get five
ready-to-send emails — each with a one-click **Copy** button.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) — navy + white design system
- [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript)
  on a server route, so your API key never reaches the browser
- Optimized for one-click deploy to [Vercel](https://vercel.com/)

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **New Project** and import the repository.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` with your
   Anthropic API key.
4. Deploy. Vercel auto-detects the Next.js framework; no extra config
   is needed.

## Project structure

```
app/
  api/generate/route.ts   # Server route that calls Claude
  EmailGenerator.tsx      # Form + results UI (client component)
  layout.tsx              # Root layout + metadata
  page.tsx                # Landing page shell
  globals.css             # Tailwind layers + design tokens
tailwind.config.ts        # Navy color palette
```
