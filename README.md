# Groww SIP Lifeline — AI-native MVP

A browser-local SIP cash-flow prototype with a Groq-powered conversational assessment and simulated SIP continuity-assistance journey. This is an independent prototype, not an official Groww product, lender, credit offer, or investment service.

## Requirements
- Node.js 20 or newer
- A Groq API key from https://console.groq.com/keys
- Internet access for Groq API requests

No npm dependencies are required. The server uses Node.js built-in modules and calls Groq's OpenAI-compatible Chat Completions endpoint from the server, keeping the API key out of browser code.

## Setup on Windows PowerShell

1. Extract this folder and open it in VS Code.
2. Set your Groq API key in the VS Code PowerShell terminal:

```powershell
$env:GROQ_API_KEY = "your-groq-api-key"
```

3. In the same terminal, run:

```powershell
node -v
npm start
```

4. Open http://127.0.0.1:4173

The server uses port 4173. If you need a different port, change the `PORT` constant in `server.js`.

## Deploy to Vercel

1. Import this repository in Vercel and set Framework Preset to **Other**.
2. Leave Build Command and Output Directory empty. Vercel serves the site from the project root.
3. Add `GROQ_API_KEY` in the Vercel project's Environment Variables settings. Vercel discovers the `/api/assistant` and `/api/health` serverless functions in `api/` automatically.

The API key is read from the server environment and is not included in the source. Rotate any key that was previously hardcoded in this project.

## Features
- Dashboard with three seed SIPs and monthly active SIP total.
- Groq AI conversational cash-flow assessment using natural language and recent chat context.
- AI output includes detected problem category, severity, duration, summary, analysis, recommendation and follow-up question.
- SIP actions: reduce, increase, pause, resume or leave unchanged; confirmation and browser-local persistence.
- Loan concept: assistance amount input and slider, amount validation, full terms disclosure, explicit consent, reject path, simulated success and plan management.
- Stop future simulated assistance with confirmation.
- Versioned localStorage key: `groww-sip-lifeline-ai-state-v2`.

## API
- `GET /api/health` reports whether a Groq key is configured.
- `POST /api/assistant` proxies a bounded chat request to Groq and returns a normalized JSON assessment.
- The model is configured in `api/assistant.js`; set `GROQ_API_KEY` in the server environment. Local development uses port 4173 from `server.js`.

## Product and safety boundaries
- AI provides conversational categorization and options, not a credit decision, financial advice, eligibility check or loan approval.
- The loan is a product concept only. No money is lent, transferred, routed or invested.
- If a user cannot afford an installment, the assistant presents the continuity-assistance concept as an option without steering them away from it. The displayed illustrative terms are 0% for months 1–12 and 10% **per month** on outstanding principal thereafter. Principal repayment remains due. A real repayment schedule, fees and legal agreement are not defined; this is not a real loan offer.
- The demo does not connect to Groww, mutual fund platforms, bank accounts or payment rails.
- SIP changes and simulated plans are stored only in the current browser's localStorage. This is not multi-user or production storage.

## Troubleshooting
- `401`: verify the key in Groq Console and remove extra spaces/quotes.
- `429`: account rate limit or quota; wait or review Groq Console usage.
- `model_decommissioned` / model error: change the model constant in `api/assistant.js` to a currently available model in your Groq account.
- `EADDRINUSE`: change the `PORT` constant in `server.js`.
- Dashboard opens but AI does not respond: check `/api/health`, server terminal output and internet access.
