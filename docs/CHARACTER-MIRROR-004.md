# CHARACTER MIRROR 004 — Visual Continuity without False Likeness

**Status:** experimental, **stacked** on Character Registry 003 and Story DNA 002. No source canon, media license, native STORYSHIP event, lemonPRESS publication or model authority is added.

> STYLE != IDENTITY. APPEARANCE != PERSON. SHA-256 != PROVENANCE. COMPARISON != ADMISSION.

## Why build this?

A character may be rendered in mono ink, luminous color, animation, or three other visual idioms. Their **owning story identity** survives those changes, but it is equally possible for a renderer to drop an essential silhouette, prop, behavioral invariant or relationship. This experiment records exact visual particulars and the **human review of a proposed variation**, rather than pretending an AI or deterministic string checker can decide who the pixels depict.

The identity lives in [Character Registry 003](CHARACTER-REGISTRY-003.md); existing visual anchors and invariants are inherited from its immutable source-bound profile. The presentation style belongs to the separate, unadmitted [lemonPRESS Manga Style Profile 001 proposal](https://github.com/the-static-collective/lemonPRESS/pull/45). Both references survive in the new candidate receipt.

## Usable tools

### 1. The offline Character Mirror

```sh
npm test
node cli/visual.mjs workbench Renji > character-mirror.html
# open character-mirror.html on desktop or mobile
```

The resulting **self-contained HTML page** has no dependencies, account, network requests or remote image models. The browser:
- Shows the source-registered character and its **provisional** visual and narrative anchors.
- Lets the operator choose a local source/reference image (optional) and a local proposed artwork image (required for comparison).
- Computes each file's **actual SHA-256 digest** in-browser using Web Crypto; refuses when hashing is unavailable. It does **not** send or store the image contents.
- Shows a side-by-side viewer and an onion-skin overlay with variable opacity.
- Lets a human review every visual anchor and source invariant: looks consistent, different, or not observable, with a mandatory observation note.
- Makes a **downloaded unsigned JSON draft**, including hashes, provenance labels, reviewer claims and the exact pinned style stack, but **no image bytes**.

A selected image is not authenticated as the source character. A browser-computed hash proves only the bytes that were selected in that browser session; it is not a signature, a license, an authenticated identity claim, or a verification of similarity.

### 2. Produce a validated held review from the local draft

```sh
node cli/visual.mjs review-draft path/to/your-local-visual-review-draft.json > review-packet.json
```

The CLI binds the submitted draft to a currently known candidate profile and the **exact unmodified sheet template**, reconstructs any operator-declared reference image, checks the source-style revision, and builds separately hashed `story-dna/visual-identity-sheet/v0`, `story-dna/visual-attempt/v0` and `story-dna/visual-review/v0` records.

It **does not possess or rehash the image bytes**: the user must preserve those locally. The returned record is explicitly `posture:HOLD`, `permissionVerified:false`, `published:false`. Human reviewer names are declarations and are **not authenticated**.

Without an operator-selected reference image, even a reviewer who marks all elements visually consistent receives `HOLD-INSUFFICIENT-EVIDENCE`. With a reference image, a human may report consistency, but such a report is still neither verified artistic equivalence nor acceptance by the story's owner. A visible discrepancy yields `REVISE-CANDIDATE`.

### 3. Machine-readable render brief (no rendering)

```sh
node cli/visual.mjs sheet Renji
node cli/visual.mjs handoff Renji RENJI_JP_RELAY_COLOR_001
node cli/visual.mjs handoff Renji RENJI_MONO_SOURCE_STACK_001
```

These generate a text-only source-bound visual sheet and a candidate style packet. Both style stacks point to the exact source revision `eba5b6f0b056330b63e82b95020b2656befc264a` in lemonPRESS PR #45. They do **not** import the unadmitted style resolver, execute it, render images, use model credits, or accept the profile as an image reference. The alternate stacks are two independent creative directions, not two identities or a demonstrated likeness.

## What exists / what does not

| Exists now | Not claimed |
| --- | --- |
| Stable character ID + exact source profile and sheet ID | An authenticated, visually established Renji face |
| Human-supplied *optional* local reference image digest | Approval that the selected image is the actual authorized design |
| Candidate image hash, style-revision ID and declared creator mode | Image generation, image recognition or automated identity verification |
| Visual side-by-side/onion-skin and explicit human questions | A meaningful numeric identity confidence score |
| Appendable new candidate/review particulars | Automatic canonical promotion, identity change, publication or runtime STORYSHIP event |
| A JSON file that can be reviewed and reloaded | An authenticated signed reviewer credential |

The first character's existing `visual.silhouette`, `visual.anchors`, `visual.avoid`, etc. were speculative development fields in earlier unadmitted proposals. **They are not automatically authenticated visual truth.** This is why the workbench advertises `VISUAL IDENTITY UNVERIFIED` until a separate source-owner-approved reference process exists. No original art files are bundled.

## Verification and safe scope

The new tests check: immutable source bindings; stable character identity across style changes; absent or duplicate references; different byte digests; missing source image refusal; source head SHA; human-assessment requirements; cross-character reuse refusal; HTML script syntax; local-only script surface; no overwrite; and browser-draft validation against pinned known character profile.

The existing `.github/workflows/verify.yml` builds downloadable demo outputs:
- `story-dna-character-mirror-004.html`
- `story-dna-renji-visual-sheet-004.json`
- `story-dna-renji-style-handoff-004.json`

Workflow artifact name: **story-dna-character-mirror-004**.

## Next legitimate step

Obtain an operator-cleared **real reference character design** from a character owner/source; store its hash and evidence locator in a **local or restricted** reference register, record exactly who reviewed what, and evaluate whether the same character survives a mono and a color rendering. Preserve both images and their distinct hashes without assigning the source author the generated output.

An approved reference could later be used by compatible image renderers, but this proposal intentionally has **no render connector** and no page publishing pipeline. lemonPRESS retains any later manga-style and editorial decisions.

**The character remains. The style can change. Evidence stays attached to the particular.**
