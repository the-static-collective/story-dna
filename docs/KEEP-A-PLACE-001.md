# KEEP-A-PLACE-001 — first song-to-panel crossing

**Status:** held editorial draft; source bytes verified locally at intake, not stored in GitHub.  
**Owner-selected particular:** *Keep a Place for Me*, an MP3 explicitly attached to this conversation on 2026-10-16.  
**Full lyrics or audio:** intentionally **not committed**.  
**Platform identity:** no independently checked Suno ID; SIA must not guess ancestry or album placement.

## Actual source observation

- MP3 embedded title: `Keep a Place for Me`.
- Artist tag: `thestaticcollective`.
- Duration: **213.12 seconds (3:33.12)**.
- Byte length: **4,586,389**.
- Exact source SHA-256: `7f16ead290a86a5997e714e1280befe282b4047c1d40de07e36849521cd304d1`.
- These facts were extracted from the owner-uploaded local file and checked independently of its filename.
- Listening observation, not a source-identity claim: warm plucked-string figure, close intimate vocal, subsequently fuller bass/drums, quieter threshold passage toward the end and soft rhythmic return.

This is a **specific media object**, not proof of authorship rights, platform generation parentage, title uniqueness, fictional continuity or an autobiographical event. No private original transcript, audio byte or full lyric is published.

## The story's strongest invariant

Small repairs and household gestures become a form of *room-making*. Care is offered without demanding an explanation; the relationship's truth is in making space, not controlling whether someone returns.

**Fictional fork proposed:** *The Fourth Beat / A Place Kept Open.*

The house itself becomes a subtle nonliteral narrative device. An old clock misses one beat, the broken hinge holds the edge of the frame, a cup retains its worn history and a chair remains available. None of these images is evidence that the described place/person exists.

## Five editable Panel Loom beats

1. **Window / ordinary world:** rain, kettle, metal window, steam; broad blue-to-gold establishment.
2. **Fourth beat / memory:** hinge, clock, cup; a deliberately missing visual cut, matching the motif rather than claiming measured meter.
3. **Chosen attention:** bread and repairs pause while a chair opens; two *unidentified fictional silhouettes*, never portraits of a real pair.
4. **Quiet return:** hall lamp, spare key and threshold in a tall vertical panel; no interrogation or imposed reunion.
5. **The house makes room:** cup cools and rain softens; a near-wordless page that does not magically solve the relationship.

The five panels are **not** a full transcribed music video timeline. Their approximate cue windows are editorial suggestions, not beat-synchronized annotations or claims that every passage is represented. All captions, dialogue and SFX remain blank for human selection.

## Cross-project boundaries

- **SIA / Fossil Jukebox:** exact MP3 digest and metadata pointer only; Suno generation ID, version ancestry and album placement remain unknown.
- **Story DNA:** may propose this new fictional fork with separate characters, place and questions. The song does not thereby become fictional canon.
- **lemonPRESS / Orchard Cinema:** receives `panel-loom/v1` editing material only. No editor-selected pages, issues or publication produced.
- **VidMage:** receives a five-shot *idea* with approximate audio windows, not rendered video, soundtrack license or generated frames.
- **Abundent:** may show an **UNISSUED** entry concept in its reactor, but there is no live public song URL or distributed MP3.

## Test on the original owner-held file

```bash
npm test
node cli/keep-a-place.mjs "/your/local/path/Keep a Place for Me.mp3" ./keep-a-place.held-proposal.json
```

The CLI reads local bytes, checks *exact* file length and SHA-256, and writes an output file using `wx` (no overwrites) and owner-only mode `0600`. The output includes metadata and wholly new proposed scenes, **not the audio bytes or a full lyric transcript**. A corrupted, re-encoded or different MP3 refuses instead of silently claiming exact identity.

## Admission needed for a real pilot

1. Human may accept/revise/refuse the five-panel narrative (separate from selecting the source song).
2. Identify whether a public track locator exists and whether the owner intends public music/lyric use.
3. Run actual lemonPRESS editorial import and later image or video render only with independent human choice.
4. Any real published exhibit should have a separate audio rights and personal-likeness review.

**Song selected ≠ music licensed · Source digest ≠ Suno song ID · Panel draft ≠ finished artwork · Invitation ≠ guaranteed return.**
