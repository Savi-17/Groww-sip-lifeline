# Groww SIP Lifeline MVP — Build Planner

## Product goal

Create a polished, scenario-driven prototype that helps new mutual fund investors respond to SIP cash-flow difficulties. The prototype demonstrates a conversational financial assistant and a SIP continuity loan journey using deterministic local logic only.

## Non-negotiable constraints

- No model, external AI service, API key, or AI backend.
- Scenario content, response templates, loan terms/configuration, SIP seed data, questions, and journey copy live in JSON files. React components render data and handle presentation; they do not contain per-scenario response copy.
- Scenario matching happens only during the initial problem assessment. After assessment, the journeys use deterministic application logic.
- Persist SIP edits and simulated loan plans in `localStorage`.
- The loan is a proposed concept and simulated only. Clearly disclose the proposed 10% **monthly** rate after the first 12 months, principal repayment obligation, market risk, and that no actual money is lent, transferred, or invested.
- Both Pause/Edit SIP and Explore Loan remain available for every assessment.

## Repository and source status

The project directory was empty when planning began. The supplied brief defines a React-style `src/` architecture but does not specify a framework, build tool, or package manager. Before implementation, identify installed runtimes/tooling and choose a minimal compatible setup if none exists.

The attached brief ends mid-field at `"simulation` in its `loan-config.json` example. Treat that as an incomplete example, not a complete schema. The requirements above it are the source of truth; define a complete config schema during implementation and document any assumptions.

## Proposed application structure

```text
src/
  data/
    sips.json
    scenarios.json
    chatbot-responses.json
    predefined-questions.json
    loan-terms.json
    loan-config.json
    edit-sip-options.json
    journey-config.json
  engine/
    scenarioMatcher.js
    responseResolver.js
    loanCalculator.js
    loanValidator.js
    journeyController.js
  components/
    Dashboard.jsx
    SIPCard.jsx
    SIPActionSheet.jsx
    Chatbot.jsx
    AssessmentResult.jsx
    LoanAmountSelector.jsx
    LoanTerms.jsx
    LoanSuccess.jsx
    EditSIP.jsx
    LoanManagement.jsx
  App.jsx
```

Add shared styles and app entry files appropriate to the selected build tool. Keep persistence and state transitions centralized enough that screens do not create conflicting copies of SIP or loan state.

## Core data and behavior decisions

### Seed SIPs

Initialize three active SIPs from JSON:

| Fund | Monthly amount | Next instalment |
| --- | ---: | --- |
| Parag Parikh Flexi Cap Fund | ₹2,000 | 5 November 2026 |
| HDFC Nifty 50 Index Fund | ₹5,000 | 10 November 2026 |
| Motilal Oswal Midcap Fund | ₹8,000 | 15 November 2026 |

Show their combined monthly SIP total. Use persisted user state when present, with a versioned storage key and a safe fallback to seed data if stored data is invalid.

### Scenario assessment

- Define all 15 scenario records (S01–S15) in JSON, with triggers, category/intent, duration, severity, summary, analysis, recommendation, follow-up, and default next step.
- Normalize text, match phrases and synonyms, score keyword hits, and apply explicit priority/tie-break rules. Preserve secondary matches as supporting context while selecting one primary scenario.
- Resolve varied, scenario-specific response templates from JSON. Include at least three response variations for major scenarios.
- Allow the user to correct the detected problem and rerun the assessment before the result is committed.
- Support selectable predefined questions, multiple selections, and additional free text in one submission. Include an unknown/unrelated fallback.
- Extract a mentioned SIP amount when feasible for contextual copy; otherwise use the selected SIP amount as the reference.

### Assessment result

Present “Your situation, understood,” issue summary, duration when known, effect on the selected SIP, and a personalized recommendation. Always render exactly two primary action cards: Explore SIP options and Explore Loan. A recommendation may visually emphasize one, but neither action is automatically chosen or hidden.

### Edit/pause journey

Show the selected fund, amount, and status. Support reduce, increase, pause, and return without changes. Validate custom amounts, show current/proposed values and monthly difference, and require confirmation. A confirmed pause or amount change updates persisted SIP state and dashboard totals.

### Continuity loan journey

1. Select an assistance amount with slider, numeric entry, and shortcuts. The allowed range is ₹100 through `min(₹5,000, selected SIP amount)`; validate every input and keep all displays in sync.
2. Show a dedicated terms view covering 0% for months 1–12 and 10% per month on outstanding principal thereafter, monthly assistance and intended SIP routing, investor control, principal repayment, undisclosed real-world schedule/charges caveat, and the risk disclosure. Label the lending proposal clearly.
3. Reject clears pending selection/consent and returns to dashboard without creating a plan. Accept creates only a simulated local plan and opens success.
4. Success shows the selected fund/SIP/assistance, terms, simulated active status, start and next-assistance dates, a 12-month interest-free timeline, and a dynamic monthly schedule. Include a clear simulation disclosure.
5. Dashboard plan management shows current plan details and months remaining. Stop Future Assistance requires confirmation, explains future assistance stops while existing principal and applicable interest remain, and changes status without deleting the record.

Use date helpers for plan dates and timeline generation. Keep rate units explicit in data and UI; do not imply annual interest. Do not calculate or imply a real repayment schedule when the terms do not define one.

## Delivery sequence

1. **Inspect/setup** — **Complete.** The repository had no app scaffold; Node is available. Created a no-dependency browser app to avoid installing packages.
2. **Data model** — **Complete.** Added seed SIPs, all 15 scenarios, response variations, questions, loan terms/config, edit options, and journey config as JSON.
3. **Deterministic engines** — **Complete.** Added scenario matching, contextual response resolution, amount validation and schedule/date helpers, and versioned `localStorage` persistence.
4. **Dashboard and SIP actions** — **Complete.** Added SIP dashboard, totals, card action sheet, independent Lifeline entry, and edit/reduce/increase/pause flows.
5. **Chat and assessment** — **Complete.** Added selectable questions plus free text, chat response, correction, assessment details, and the two always-visible options.
6. **Loan path** — **Complete.** Added dynamic amount selection, terms and consent, accept/reject, simulated success timeline/schedule, plan management, and stop confirmation.
7. **Polish and verify** — **In progress.** Responsive styling and keyboard submission are implemented. JavaScript syntax, JSON parsing, key matcher/loan-bound behavior, and local static serving have been checked. A visual browser click-through remains pending because no browser automation tool is available in this workspace.

### Progress log

- **Completed:** Read the product brief and recorded the project constraints and delivery plan.
- **Completed:** Confirmed the repository had no existing app scaffold and Node is installed.
- **Completed:** Created a zero-dependency app entry point and responsive Groww-inspired styling.
- **Completed:** Added JSON-driven scenario, response, SIP, loan, and journey configuration.
- **Completed:** Implemented deterministic engines and all primary journeys.
- **Completed:** All JavaScript modules pass `node --check`; all JSON data files parse.
- **Completed:** Checked delayed-salary matching, currency amount extraction, and the dynamic ₹5,000 SIP loan cap.
- **Completed:** Started the local server and confirmed it served the app and all 15 scenario records successfully.
- **Pending:** Open the app in a browser for a visual click-through of responsive layouts and the full dashboard → chat/edit/loan journeys.

## Completion criteria

- The initial dashboard shows the three configured SIPs and correct total, and each card opens the correct actions.
- The chatbot handles all supplied questions, combined and custom input, scenario-specific responses, correction, unknown input, and exactly two assessment actions.
- All 15 scenarios are represented in JSON and matched deterministically with documented priorities.
- SIP amount edits and pauses validate, confirm, persist, and update dashboard values.
- Loan bounds respond to the selected SIP; accept/reject, disclosure, schedule, persistence, and stop-assistance behavior match the requirements.
- Reloading preserves valid changes and plans; invalid or absent stored state recovers safely.
- No real AI, lending, money transfer, investment routing, or external API is invoked or represented as having occurred.

## Open implementation assumptions

- The prototype is single-user and browser-local; no authentication, backend, or multi-device synchronization is required.
- The three SIP records are demonstration seed data and can be reset by clearing local storage.
- Loan amount denotes monthly assistance and is capped at ₹5,000 even when the SIP exceeds that amount.
- “Interest thereafter” is displayed exactly as 10% monthly on outstanding principal, while repayment timing and charges remain unspecified pending any real agreement.
- Use the supplied fixed SIP dates for the dashboard. For a new loan plan, use the local current date as its start date and derive the next assistance date consistently in the prototype.
