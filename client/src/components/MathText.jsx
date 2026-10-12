import katex from "katex";
import "katex/dist/katex.min.css";

// Shows text with maths and pictures.
// Maths: put it between $...$ (same line) or $$...$$ (own line), e.g. "Kinetic energy is $\frac{1}{2}mv^2$"
// Pictures: {{IMG::https://...}} (the format used by the question website)
const IMG = /\{\{IMG::([^}]+?)\}\}/g;

function renderMath(str, keyPrefix) {
  if (!str.includes("$")) return [<span key={keyPrefix}>{str}</span>];
  const parts = str.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((part, i) => {
    const block = part.length > 4 && part.startsWith("$$") && part.endsWith("$$");
    const inline = !block && part.length > 2 && part.startsWith("$") && part.endsWith("$");
    if (!block && !inline) return <span key={keyPrefix + "-" + i}>{part}</span>;
    const tex = block ? part.slice(2, -2) : part.slice(1, -1);
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: block });
    return <span key={keyPrefix + "-" + i} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function MathText({ text, as: Tag = "span", className = "" }) {
  if (text === null || text === undefined || text === "") return null;
  const str = String(text);
  if (!str.includes("$") && !str.includes("{{IMG::")) return <Tag className={className}>{str}</Tag>;

  // Odd positions are picture links, even positions are text (with maths)
  const pieces = str.split(IMG);
  return (
    <Tag className={className}>
      {pieces.map((piece, i) => {
        if (i % 2 === 0) return piece ? renderMath(piece, "t" + i) : null;
        const url = piece.split("|")[0].trim();
        if (!/^https:\/\//.test(url)) return null;
        return (
          <img
            key={"i" + i}
            src={url}
            alt="Diagram"
            loading="lazy"
            className="my-2 block max-h-80 max-w-full rounded-md border border-slate-200 bg-white object-contain"
          />
        );
      })}
    </Tag>
  );
}