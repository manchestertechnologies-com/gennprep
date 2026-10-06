import katex from "katex";
import "katex/dist/katex.min.css";

// Shows text with maths. Put maths between $...$ (same line) or $$...$$ (own line).
// Example: "Kinetic energy is $\frac{1}{2}mv^2$"
export default function MathText({ text, as: Tag = "span", className = "" }) {
  if (text === null || text === undefined || text === "") return null;
  const str = String(text);
  if (!str.includes("$")) return <Tag className={className}>{str}</Tag>;

  const parts = str.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        const block = part.length > 4 && part.startsWith("$$") && part.endsWith("$$");
        const inline = !block && part.length > 2 && part.startsWith("$") && part.endsWith("$");
        if (!block && !inline) return <span key={i}>{part}</span>;
        const tex = block ? part.slice(2, -2) : part.slice(1, -1);
        const html = katex.renderToString(tex, { throwOnError: false, displayMode: block });
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </Tag>
  );
}