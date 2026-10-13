import katex from "katex";
import "katex/dist/katex.min.css";

// Shows question text with maths, pictures and match-the-following tables.
// Maths: $...$ (same line) or $$...$$ (own line), e.g. "Kinetic energy is $\frac{1}{2}mv^2$"
// Pictures: {{IMG::https://...}}
// Match the following: a "Column I" / "List-I" heading with items, then a "Column II" / "List-II" heading with items
const IMG = /\{\{IMG::([^}]+?)\}\}/g;
const HEADING = /^\s*\**\s*((?:column|list)[\s\-–]*(i{1,2}|1|2|a|b)\b(?:\s*\([^)]*\))?)\s*\**\s*:?\s*\**\s*$/i;
const ITEM = /^\s*\(?([a-hA-H]|[ivxIVX]{1,4}|[pqrstPQRST]|\d{1,2})[).:]\s+(.+)$/;
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

function renderMath(str, keyPrefix) {
  // **bold** text
  const withBold = (s, k) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.length > 4 && p.startsWith("**") && p.endsWith("**") ? <strong key={k + "b" + j}>{p.slice(2, -2)}</strong> : p
    );
  if (!str.includes("$")) return [<span key={keyPrefix}>{withBold(str, keyPrefix)}</span>];
  const parts = str.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((part, i) => {
    const block = part.length > 4 && part.startsWith("$$") && part.endsWith("$$");
    const inline = !block && part.length > 2 && part.startsWith("$") && part.endsWith("$");
    if (!block && !inline) return <span key={keyPrefix + "-" + i}>{withBold(part, keyPrefix + "-" + i)}</span>;
    const tex = block ? part.slice(2, -2) : part.slice(1, -1);
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: block });
    return <span key={keyPrefix + "-" + i} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

// Text and pictures
function renderRich(str, keyPrefix) {
  const pieces = str.split(IMG);
  return pieces.map((piece, i) => {
    if (i % 2 === 0) return piece ? renderMath(piece, keyPrefix + "t" + i) : null;
    const url = piece.split("|")[0].trim();
    if (!/^https:\/\//.test(url)) return null;
    return (
      <img
        key={keyPrefix + "i" + i}
        src={url}
        alt="Diagram"
        loading="lazy"
        className="my-2 block max-h-80 max-w-full rounded-md border border-slate-200 bg-white object-contain"
      />
    );
  });
}

// Finds a match-the-following block. Returns null when the text has none.
export function parseMatch(str) {
  const lines = str.split(/\r?\n/);
  const h1 = lines.findIndex((l) => HEADING.test(l) && /(^|[\s\-–])(i|1|a)\b/i.test(l.match(HEADING)[2]) && !/ii/i.test(l.match(HEADING)[2]));
  if (h1 < 0) return null;
  let h2 = -1;
  for (let k = h1 + 1; k < lines.length; k++) {
    const mm = lines[k].match(HEADING);
    if (mm && /^(ii|2|b)$/i.test(mm[2])) { h2 = k; break; }
  }
  if (h2 < 0) return null;
  const listA = lines.slice(h1 + 1, h2).map((l) => l.trim()).filter(Boolean);
  let k = h2 + 1;
  while (k < lines.length && !lines[k].trim()) k++;
  const listB = [];
  while (k < lines.length && lines[k].trim()) listB.push(lines[k].trim()), k++;
  if (listA.length < 2 || listB.length < 2) return null;
  const clean = (h) => h.replace(/\*/g, "").replace(/\s*:\s*$/, "").trim();
  const split = (items, auto) =>
    items.map((t, i) => {
      const m = t.match(ITEM);
      return m ? { label: m[1], text: m[2] } : { label: auto(i), text: t };
    });
  return {
    before: lines.slice(0, h1).join("\n").trim(),
    titleA: clean(lines[h1].match(HEADING)[1]),
    titleB: clean(lines[h2].match(HEADING)[1]),
    a: split(listA, (i) => String.fromCharCode(97 + i)),
    b: split(listB, (i) => ROMAN[i] || String(i + 1)),
    after: lines.slice(k).join("\n").trim(),
  };
}

function MatchColumn({ title, items, keyPrefix }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-amber-600">{title}</div>
      <ul>
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 border-b border-slate-100 px-4 py-2.5 last:border-b-0">
            <span className="shrink-0 font-semibold text-slate-400">({it.label})</span>
            <span className="min-w-0 text-slate-800">{renderRich(it.text, keyPrefix + i)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MathText({ text, as: Tag = "span", className = "" }) {
  if (text === null || text === undefined || text === "") return null;
  const str = String(text);

  const match = /column|list/i.test(str) ? parseMatch(str) : null;
  if (match) {
    // A table can't go inside a <p> or <span>, so this always uses a <div>
    return (
      <div className={className}>
        {match.before && <div>{renderRich(match.before, "b")}</div>}
        <div className="my-3 grid gap-3 sm:grid-cols-2">
          <MatchColumn title={match.titleA} items={match.a} keyPrefix="a" />
          <MatchColumn title={match.titleB} items={match.b} keyPrefix="c" />
        </div>
        {match.after && <div>{renderRich(match.after, "f")}</div>}
      </div>
    );
  }

  if (!str.includes("$") && !str.includes("{{IMG::") && !str.includes("**")) return <Tag className={className}>{str}</Tag>;
  return <Tag className={className}>{renderRich(str, "r")}</Tag>;
}