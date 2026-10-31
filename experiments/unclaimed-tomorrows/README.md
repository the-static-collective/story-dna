# Department of Unclaimed Tomorrows — candidate experiment 001

**Status:** an independent, fictional story-world candidate and offline interactive prototype. Not admitted canon, published fiction, or an integrated cross-project feature.

## One sentence

An exhausted mail carrier keeps delivering receipts from possible futures to the wrong century. She cannot promise the future will happen; she can only make sure the possibilities are not lost.

## Try it

Open [index.html](./index.html) in a browser. No installation, API key, account, network connection, AI model, or server is required.

- **Accept wrong delivery:** open one of six fictional envelopes.
- **Keep a receipt:** save a copy of the fictional possibility in the browser's local filing cabinet.
- **File a possibility:** add a new unreviewed idea, on the same device.
- **Export my cabinet:** download a machine-readable JSON copy of local receipts.
- **Print letter:** print the currently opened fictional letter.

Browser storage can be cleared; exported JSON is the only portable copy. There is no import yet, and no networking, community feed, notification, identity, or AI automation. No private contact information should be entered. The on-screen "receipt" is a playful artifact, not verification that any real-world action happened.

## Narrative anchors

**The carrier:** unnamed and overworked. Her competence is impeccable; her dates are not. She is not an oracle, nor a supernatural judge. Her problem is logistical: entirely too many almosts, too few addresses.

**Window 0:** the Department's office for items with no definite recipient, due date, or originating century.

**The envelope:** a proposal delivered as fiction, not a forecast.

**The receipt:** marks that a possibility was noticed or drafted, **not** that it was pledged, performed, witnessed, reviewed, or fulfilled.

**The central joke:** "Oh. Sorry. I'm early." The central tenderness: a person can be noticed before their future is resolved.

See [Episode 000](./episode-000.md) for a script, and [seed.json](./seed.json) for a candidate cross-medium seed.

## Data shape (prototype only)

`unclaimed.tomorrow.v0` records carry `id`, `kind`, `text`, `source`, `status`, and `created_at`.

- `kept-as-possibility`: a fictional dispatch was copied into the local cabinet.
- `unreviewed-possibility`: a visitor typed a local draft.
- Neither means endorsement, publication, permission to use someone else's story, or a real-world pledge.
- **No** outgoing network requests, collector endpoint, tracking script, or external dependency.

A future bridge to Story DNA, JAR;VIS, a Garden help slip, or lemonPRESS must use a separate explicit human-approved crossing contract and preserve the source/status distinctions. Do not send local entries anywhere silently. In particular a creative idea must not become a public request, task, or evidence receipt without its author's explicit action and contextual review.

## Next test

Ask someone who has no knowledge of the Collective to open one envelope and explain what they think the site does. If they expect the filing form to publish publicly, the privacy explanation has failed. If they want to make one small real thing from a fictional letter, the conceit may be useful.

## Ownership

This lives as a *candidate* in **story-dna**, whose remit is fictional particulars and relationships. **lemonPRESS** owns any future admission/publication. **STORYSHIP** owns its own witnessed voyages. Neither publication nor integration is implied by this experiment.
