# Character Registry 003 — Identity, Appearance, Relationship

**Status:** executable, experimental, **candidate-only** layer for [story-dna](https://github.com/the-static-collective/story-dna). Built as a stacked branch on Story DNA 002; the foundational PR is **not yet merged**. Not a replacement for the source project's story bible, image identity sheets, STORYSHIP voyages, or lemonPRESS admission.

## The need

A name, picture, costume, alternate interpretation, and appearance are **not the same thing as a character's identity**.

We need to explore recurring fictional characters without silently converting an analogy into a canonical crossover or treating a speculative depiction as their authentic visual design.

The v0 registry models four distinct sorts of records:

| Object | Identity | Example |
| --- | --- | --- |
| **Character** | Anchored to `owning namespace + stable local key`; profile revisions are content-addressed. | Neri Vale / Renji |
| **Variant** | Stable variant ID tied to a character + variant key; revision can change while identity stays. | Proposed color-relay art-style study for Renji |
| **Appearance** | Content-addressed particular bound to an exact character profile, work, scene and optional variant. | Neri in an unadmitted six-page proposal |
| **Relationship bond** | Content-addressed link between *two characters in the same owned fictional world*, with desire, conflict, choice, consequence and unresolved remainder. | Neri × Tallow; Renji × the waiting rat |

A relationship bond can emit a validated `story-dna/relationship-thread/v0` and enter **ECHO** recombination with one from a different world. **It does not introduce the original cast to the other universe.**

## Real implementation

```text
src/character-registry.mjs       stable identity, validated records, source matching, query, literal echoes
src/registry-report.mjs          HTML offline projection; outputs refuse all nonpublic sources
fixtures/characters.candidate.mjs four explicitly developmental profiles, two same-world bonds
cli/characters.mjs               list / search / show / echoes / threads / echo-bonds / report
test/character-registry.test.mjs adversarial continuity and authority tests
test/registry-report.test.mjs    HTML sanitization / no-network / privacy / CLI tests
```

No API key, remote search, database, or AI provider invocation. Works on Node.js 22+. This code **does not generate character drawings**; visual anchors are editorial notes only.

### Try it

```bash
npm test
npm run characters              # 4 candidate character IDs
node cli/characters.mjs show 'Neri Vale'
node cli/characters.mjs search 'passage'
npm run characters:echoes        # tagged lexical resonances, no invented source relationships
npm run characters:threads       # inspect the two distinct same-world relationship threads
npm run characters:demo          # ECHO between those threads, no character crossover
npm run characters:report > registry-proof.html
```

Open `registry-proof.html` in any browser, including on a phone. The generated page is static, responsive and searchable entirely offline. It never sends the registry to a service. You can also use `node cli/characters.mjs report /chosen/path/registry-proof.html`, which uses **exclusive create** instead of overwriting an existing report.

### First specimen

**Four candidate characters:** Neri Vale, Tallow, Renji, and **The Waiting Rat** (explicitly an editorial placeholder, *not* a newly verified named canon character).

They are based on two *fictional source proposals* and their provenance is recorded:
- [lemonPRESS PR #47, six-page unfinished-business story](https://github.com/the-static-collective/lemonPRESS/pull/47), bound to exact authored source commit `7465597674b0f1561ad4e354ef9817a1d0d187b4`.
- [GitBook Static Collective Docs](https://the-static-collective.gitbook.io/the-static-collective-docs/), a bounded Renji/rat workshop seed; its immutable page revision remains **unverified**.

All personalities, visual silhouettes and behavioral summaries in the fixture are **working interpretations**, not confirmed canonical facts. We do not claim to own external likenesses or rights we cannot verify.

### Two real relationship questions (interpretations, not admissions)

| Source world | Relationship question |
| --- | --- |
| Case Zero | Can a courier and clerk help travelers find release without deciding anyone's destination? |
| The Room Inside the Room | Can a maker offer a crossing without commanding an animal to take it? |

The registry's naive motif scanner sees literal overlaps such as *passage* and *choice*. Its output is only an `ECHO` suggestion, not a prediction of literary significance or automatic world crossing.

The structured **relationship passenger** can do more: the character bond has six fields (`desire → relationship → conflict → choice → consequence → remainder`). `threadFromBond` feeds these into the verified Story DNA 002 `validateThread` contract. `echoBonds` makes a new **held**, **independent** analogy proposal. There is no native Storyship event, human selection or lemonPRESS admission.

## Critical invariants

1. **Identity != display name.** `characterId` is minted from a declared stable owning namespace and local key. You may rename a character, but you must create a new content-addressed profile; the original profile ID remains traceable.
2. **Variant != new person.** A variant retains `characterId` and binds the exact originating `profileId`; changing its depiction creates a new `variantRevisionId` without destroying the variant's stable ID.
3. **Appearance != authority.** The appearance identifies the exact profile, work, scene, source and optional variant. A proposed page does not establish that its representation is canonical.
4. **Relationship != crossover.** v0 bonds require both endpoints to share the same owning fictional world. Cross-world possibilities travel via held ECHO/FORK candidates instead.
5. **Material != grant.** Public GitHub material and a source `rights` *declaration* do not prove licensed adaptation. All fixture rights remain `unverified`; direct encounters are gated elsewhere.
6. **Source visibility isn't silently widened.** Variant/appearance/bond visibility must match originating characters. The HTML exporter **refuses** a registry containing private or restricted source records, rather than showing them in public-looking output.
7. **Unadmitted forever unless locally reviewed.** All registry v0 records require `classification:CANDIDATE|HELD`; no `ADMITTED` status can be forged by a registry import.
8. **No invented memory of real people.** This phase only concerns fictional material. It does not translate user biographies, family material or confidential evidence into character sheets.
9. **Missing past profiles stay missing.** v0 deliberately rejects unprovided previous profile history instead of quietly stitching it. Future work requires an explicit history ledger/branch DAG.
10. **Every content ID is an integrity handle, never an authenticating signature.** A hash proves reconstruction of these bytes under this code's canonicalization rules; it does not verify identity, consent, chronology, or rights.

## Known limits

- One current profile per character; revision provenance is signposted but historical revision collection is not implemented. Duplicate identity anchors fail closed.
- Candidate-only source classification and a small static fixture. No real cross-repo asset ingest, character sheet artwork generation, signed user review, canonical admission or licensed crossover.
- Similarity discovery is deliberately **literal token overlap**, not an LLM or a semantic embedding. It can miss genuine connections and surface banal ones.
- Profiles are source-labelled proposals; their visual descriptions are not a substitute for a verified reference image or artist-authored visual identity.
- HTML is generated from the supplied snapshot, read-only. The separate Story DNA Bank 001 editor is not yet wired as its authoring frontend.

## Next pieces (future proposals)

- `story-dna/identity-history/v0`: exact signed author-approved profile revisions, time- and continuity-scoped variants and merges without overwrite.
- `story-dna/setting/v0`, `story-dna/plot-thread/v0`: stable settings and unresolved plot-thread identities, with explicit world rules.
- Image identity sheets: anchored reference frames and local pixel/crop evidence IDs; neither style transfer nor AI output can silently replace accepted source anchors.
- One explicit adapter that imports a human-approved character or story bible from LemonPRESS or GitBook without giving the registry editorial authority.
- A phone-first **Character Workbench**, where the existing offline bank can select *particular* profiles/variants and send a proposed page to Panel Loom.

**Next practical test:** modify only Renji's appearance treatment and show that the source identity, relationship and constraints remain stable, while new art and an alternate continuity produce distinct, inspectable descendant profiles.
