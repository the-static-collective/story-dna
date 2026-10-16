# Story DNA Laboratory 005 — rescued, independent bench

Grok Build produced a React/TanStack laboratory prototype on **2026-10-16**. This `lab-005/` subproject is a **portable, dependency-free continuation**, not a claim that its UI is a byte-for-byte copy. Its engine is imported from the same repository's authoritative `src/` modules; it does not blindly duplicate the `vendor/story-dna/` code from Grok's workspace ZIP.

**Original ZIP:** retained separately from Git as `grok-workspace.zip`, SHA-256 `ee63baab4f2f640092aeb54411040ca9e2631fe9ebb8cd2f0ab4737a09c3c50e`. Not included on this branch; import of the full Grok React/TanStack UI remains a separate task.

## Run locally

Node.js **22+**. From the `story-dna` repository root:

```sh
node lab-005/server.mjs
# open http://127.0.0.1:8085 on the same computer
node --test lab-005/test.mjs
```

No `npm install`, xAI account, API keys, database or network connection are required. Binds to loopback by default. **Do not deploy this dev server publicly:** there is no authentication or production hardening.

## What the rescue already does

- Read all 42 original source-derived narrative elements, worlds and characters from the 004 development branch and render an interactive phone-sized catalog.
- ECHO / FORK / ENCOUNTER recombinations use the actual, source-bound Story DNA engine, including explicit refusals and content seals.
- Save/export readings and a 50-entry browser-local journal.
- Create local characters, worlds and six-field relationship threads with explicit provenance notes. Export/import as `story-dna/lab-005-local-bank/v1`. Nothing is automatically admitted or merged into canonical registry 003.
- Recombine two local relationship threads through `src/relationship-passenger.mjs` **only after explicit public-fiction and analogy permission declarations**. Cross-character ENCOUNTER is not automatically authorized. Bank imports reset clearance to false.

## Authority and boundaries

This experiment forks the **UI/adapter only**, not upstream canon or fixture history. Source-owned ID checks and rights gates remain in force. The browser's `localStorage` is the sole persistence for drafts and journal: export before clearing data. `static-story-dna-bank/v1` is a separate schema and requires a future reviewed adapter.

The original Grok generated app used a separate React/TanStack runtime. This continuation intentionally removes Grok-specific auth, hosting and preview scaffolding. It does **not** assert the production web build or mobile device has been field-tested. No private autobiographical data should be entered on a shared computer.

## Future handoff to Grok or another builder

Please inspect `lab-005/`, `src/laboratory.mjs` and `src/relationship-passenger.mjs` before proposing a port to a deployed frontend. Keep `HOLD`, selection ≠ evidence, and proposal ≠ admission. Preserve source identity, explain any rights-gate changes and commit work to an experiment branch, not main.
