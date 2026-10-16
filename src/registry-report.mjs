import { buildRegistry, suggestEchoes } from './character-registry.mjs';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags = arr => arr.map(x => `<span class="tag">${escape(x)}</span>`).join('');
const dl = (label, content) => `<div class="row"><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`;
const link = ({locator}) => /^https:\/\/[^\s<>"']+$/.test(locator)
  ? `<a href="${escape(locator)}" rel="noopener noreferrer" target="_blank">Source reference ↗</a>`
  : `<span class="muted">Source locator: ${escape(locator)}</span>`;

export function renderRegistryHtml(raw) {
  const r=buildRegistry(raw);
  if (r.characters.some(c => c.source.visibility !== 'public') ||
      r.variants.some(v => v.source.visibility !== 'public') ||
      r.appearances.some(a => a.source.visibility !== 'public') ||
      r.bonds.some(b => b.source.visibility !== 'public')) {
    throw new Error('Report export refused: registry includes nonpublic sources. Export a separately cleared public subset.');
  }
  const suggestions=suggestEchoes(r);
  const nameById=new Map(r.characters.map(c=>[c.characterId,c.displayName]));
  const cards=r.characters.map(c=>{
    const variants=r.variants.filter(v=>v.characterId===c.characterId);
    const appearances=r.appearances.filter(a=>a.characterId===c.characterId);
    const bonds=r.bonds.filter(b=>b.fromCharacterId===c.characterId||b.toCharacterId===c.characterId);
    const searchable=escape([c.displayName,c.world,c.narrative.desire,c.narrative.unresolved,...c.aliases,...c.motifs].join(' ').toLowerCase());
    return `
    <article class="card character" data-search="${searchable}" id="${escape(c.characterId)}">
      <div class="top"><span class="kind">CHARACTER PARTICULAR</span><span class="badge">CANDIDATE · UNADMITTED</span></div>
      <h2>${escape(c.displayName)}</h2><div class="world">${escape(c.world)}</div>
      <div class="glyph">${escape(c.visual.silhouette)}</div>
      <div class="tags">${tags(c.motifs)}</div>
      <dl>
        ${dl('Desire',c.narrative.desire)}
        ${dl('Constraint',c.narrative.constraint)}
        ${dl('Refusal',c.narrative.refusal)}
        ${dl('Unfinished',c.narrative.unresolved)}
      </dl>
      <section class="integrity"><h3>Continuity anchors</h3>${c.invariants.map(x=>`<p>◆ ${escape(x)}</p>`).join('')}
        <h3>Visual hold points</h3><div class="tags">${tags(c.visual.anchors)}</div>
        <p class="muted">Avoid: ${escape(c.visual.avoid.join('; ')||'no additional constraints declared')}</p>
      </section>
      <section class="sideinfo"><div><b>${variants.length}</b> variants</div><div><b>${appearances.length}</b> appearances</div><div><b>${bonds.length}</b> relationships</div></section>
      ${variants.map(v=>`<p class="small">Variant <strong>${escape(v.variantKey)}</strong> · ${escape(v.description)} · ${escape(v.classification)}</p>`).join('')}
      ${appearances.map(a=>`<p class="small">Appearance <strong>${escape(a.workId)}</strong> · ${escape(a.sceneRef)}</p>`).join('')}
      <footer>${link(c.source)}<span class="mono">ID ${escape(c.characterId.slice(-12))} · profile ${escape(c.profileId.slice(-12))}</span></footer>
    </article>`;
  }).join('');
  const bondCards=r.bonds.map(b=>`
   <article class="thread"><div class="kind">RELATIONSHIP PASSENGER</div>
    <h3>${escape(nameById.get(b.fromCharacterId))} × ${escape(nameById.get(b.toCharacterId))}</h3>
    <p>${escape(b.arc.relationship)}</p>
    <p class="remnant"><span>UNRESOLVED</span> ${escape(b.arc.remainder)}</p>
    <div class="small">Held as ${escape(b.classification)} · ${escape(b.kind)}</div>
   </article>`).join('');
  const echoCards=suggestions.map(s=>`<article class="thread echo">
    <div class="kind">POSSIBLE ECHO — NOT A CROSSOVER</div>
    <h3>${escape(s.displayNames.join(' ↔ '))}</h3>
    <div class="tags">${tags(s.matchedLiteralTokens)}</div>
    <p>These motifs overlap as <em>literal source-declared terms</em>. Similar vocabulary does not prove a shared story, intention or relationship.</p>
  </article>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>STORY DNA · Character Registry 003</title>
<style>
:root{color-scheme:dark;--bg:#10100e;--panel:#1d1d19;--line:#4e5142;--text:#e7e4d8;--muted:#a6a99d;--acid:#b5d75e;--ember:#e1a878}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.48 system-ui,-apple-system,Segoe UI,sans-serif}
header{padding:3rem max(1rem,calc((100vw - 1150px)/2));background:radial-gradient(circle at 84% 35%,#3c4425,transparent 39%),linear-gradient(145deg,#23251d,#11110f);border-bottom:1px solid var(--line)}
h1{font:clamp(2.5rem,8vw,5.6rem)/.96 Georgia,serif;margin:.4rem 0 .8rem;letter-spacing:-.055em}
.lead{max-width:770px;font-size:1.08rem;color:#d1d2c1}.stamp,.kind{letter-spacing:.16em;font:700 .72rem/1.4 ui-monospace,SFMono-Regular,monospace;color:var(--acid)}
.banner{display:inline-block;background:#313b1b;color:#ddebba;border:1px solid #8d9b5f;padding:.4rem .7rem;font:700 .72rem monospace}
main{max-width:1180px;margin:auto;padding:1rem 1rem 4rem}.toolbar{position:sticky;top:0;z-index:2;display:flex;gap:.8rem;align-items:center;background:#10100eea;backdrop-filter:blur(10px);padding:1rem 0;border-bottom:1px solid var(--line);flex-wrap:wrap}
input{background:#24251e;border:1px solid #6e7358;color:var(--text);font:inherit;border-radius:0;padding:.75rem 1rem;flex:1;min-width:200px}input:focus-visible{outline:2px solid var(--acid)}
.count{font:.75rem ui-monospace,monospace;color:var(--acid)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:1rem;padding-top:1rem}.card{background:var(--panel);border:1px solid var(--line);padding:1.3rem;box-shadow:5px 5px 0 #090a08}
.top{display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap}.badge{color:var(--ember);font:700 .7rem ui-monospace,monospace}h2{font:2.15rem Georgia,serif;margin:.8rem 0 .15rem}
.world{color:#d2ad88;font:.74rem ui-monospace,monospace}.glyph{margin:1rem 0;padding:.75rem;border-left:3px solid var(--acid);background:#272d20;font-style:italic;color:#d9e1c4}
.tags{display:flex;flex-wrap:wrap;gap:.4rem;margin:.75rem 0}.tag{border:1px solid #555e3c;padding:.23rem .5rem;color:#c8d8a6;font:.71rem ui-monospace,monospace}
dl{margin:1rem 0}dt{font:bold .7rem ui-monospace,monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}dd{margin:.2rem 0 0}.row{padding:.6rem 0;border-top:1px solid #393b32}.integrity{padding:1rem;background:#24241f}
h3{margin:.7rem 0;font:1.35rem Georgia,serif}.integrity h3{font:.7rem ui-monospace,monospace;letter-spacing:.1em;color:var(--acid);text-transform:uppercase}.integrity p{margin:.3rem 0}.sideinfo{display:flex;gap:1rem;flex-wrap:wrap;margin:.8rem 0;color:var(--muted);font:.72rem ui-monospace,monospace}.sideinfo b{font-size:1.15rem;color:#e4ddba}
.small,.muted{font-size:.8rem;color:var(--muted)}footer{border-top:1px solid var(--line);margin-top:1.2rem;padding-top:.7rem;display:flex;gap:.8rem;justify-content:space-between;flex-wrap:wrap;font-size:.78rem}a{color:var(--acid)}.mono{font:.67rem ui-monospace,monospace;color:var(--muted)}
section.deck{padding-top:2rem}.deck h2{font-size:2rem}.threads{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:1rem}.thread{padding:1rem 1.2rem;border:1px solid var(--line);background:#25241e}.thread.echo{background:#22271c;border-color:#556343}
.remnant{color:#dfceb2}.remnant span{color:var(--ember);font:bold .65rem ui-monospace,monospace;margin-right:.5rem}.footnote{border-top:1px solid #555847;padding:1.4rem 0;margin-top:2rem;color:var(--muted);font-size:.85rem}
[hidden]{display:none!important}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media(max-width:600px){header{padding:2rem 1rem}.card{padding:1rem}.toolbar{align-items:stretch}input{width:100%}}
</style></head>
<body>
<header><div class="stamp">THE STATIC COLLECTIVE / STORY DNA 003</div><h1>The Character Registry<span style="color:#b5d75e">.</span></h1>
<p class="lead">A character keeps its identity. An appearance can change. A relationship can inspire a new story without dragging its characters across worlds.</p>
<span class="banner">SOURCE-ATTRIBUTED FICTIONAL CANDIDATES · NO CANON ADMISSION</span></header>
<main>
<div class="toolbar"><input id="search" type="search" placeholder="Search character, world, desire, question, motif" aria-label="Search characters"><span id="resultCount" class="count">${r.characters.length} characters</span></div>
<section class="grid" id="characterCards">${cards}</section>
<section class="deck"><h2>Relationships held open</h2><div class="threads">${bondCards}</div></section>
<section class="deck"><h2>Possible echoes between worlds</h2><p class="muted">Simple literal-token suggestions from source-labelled fictional development notes, not an AI claim of meaning or permission to cross.</p><div class="threads">${echoCards || '<p>No source-labelled motif overlaps detected.</p>'}</div></section>
<div class="footnote">This is a generated, read-only, offline proof from exact Story DNA 003 candidate data. Personal and unpublished material is not imported automatically. Source statements may be speculative or incomplete. The original scripts, hash-bound identities, and human editorial boundaries remain authoritative in their own repos.</div>
</main>
<script>
const search=document.getElementById('search'), cards=[...document.querySelectorAll('.character')], count=document.getElementById('resultCount');
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let n=0;for(const c of cards){const match=c.dataset.search.includes(q);c.hidden=!match;if(match)n++;}count.textContent=n+' of '+cards.length+' characters';});
</script></body></html>`;
}
