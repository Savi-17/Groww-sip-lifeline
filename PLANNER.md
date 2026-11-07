# Groww SIP Lifeline AI — implementation notes

## Product goal
Help investors understand options when cash-flow pressure threatens SIP continuity. The conversational assessment is powered by Groq. SIP updates and the proposed continuity-assistance journey remain deterministic and browser-local.

## Architecture
- `server.js`: static server, `/api/health`, secure server-side Groq proxy at `/api/assistant`, environment loading and request bounds.
- `src/main.js`: dashboard, conversational UI, AI assessment rendering, SIP actions, simulated loan journey and local persistence.
- `src/styles.css`: responsive interface.
- `.env.example`: Groq configuration template.

## AI responsibilities
Groq interprets natural-language user descriptions, identifies a likely cash-flow category, summarizes severity/duration where supported, suggests next steps and asks a follow-up when information is missing. When a user cannot afford an installment, the assistant presents the hypothetical continuity-assistance concept as an option without pressuring the user or steering them away from it. AI output is parsed and normalized by the server. It does not approve credit, execute SIP changes, calculate repayment obligations or perform financial transactions.

## Deterministic responsibilities
SIP edits, pause/resume, amount validation, loan amount bounds, consent, simulation creation, stop-assistance confirmation and local persistence are application logic, not model decisions.

## Demo data
- Parag Parikh Flexi Cap Fund — ₹2,000 monthly — 5 Nov 2026
- HDFC Nifty 50 Index Fund — ₹5,000 monthly — 10 Nov 2026
- Motilal Oswal Midcap Fund — ₹8,000 monthly — 15 Nov 2026

## Critical loan disclosure
This is a hypothetical product concept. No money is lent, transferred, routed or invested. Terms displayed: 0% for months 1–12, then 10% per month on outstanding principal. Principal remains repayable. A real repayment schedule, fees, eligibility criteria and legal agreement are not defined. Disclose the terms accurately without characterizing the rate as affordable or presenting the concept as a real offer.
