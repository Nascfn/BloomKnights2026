# WhoOwnsIt 🐉🔍

**Live at [whoownsit.app](https://whoownsit.app)**

Snap a photo of any product and find out who *really* owns it. Gemini identifies the product and traces the brand through its corporate ownership chain to the ultimate parent company. If the parent is publicly traded, the app validates the ticker against real market data and shows a live company profile, a 1-year price chart, recent news, revenue by business segment, and a calculator for what a few dollars a month invested last year would be worth today.

## Stack

| Layer | Tools |
|---|---|
| Frontend | React 19 + Vite 7, Recharts, plain CSS (no framework) |
| Backend | Node 22, Express, plain JavaScript ES modules |
| AI | Google Gemini (`gemini-3.5-flash`) via `@google/genai`: product vision + ownership reasoning with structured JSON output |
| Market data | Financial Modeling Prep: profiles, price history, news, revenue segments |
| Hosting | Render (static client + API service), auto-deploys from `main` |
| Guardrails | Ticker validation against market data, delisting staleness guard, per-user rate limiting, daily ticker cache |
