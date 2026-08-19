// Minimal, dependency-free renderer for the subset of markdown Claude's
// responses use here: #/##/### headers, "- " bullet lists, and **bold**.
// Not a general markdown parser — just enough to make the prep report and
// classification summaries readable without pulling in a library.

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList(key: string) {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul key={key} className="list-disc space-y-1 pl-5">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <h3 key={idx} className="mt-4 text-base font-semibold">
          {renderInline(trimmed.slice(4), `h3-${idx}`)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <h2 key={idx} className="mt-5 text-lg font-semibold text-brand-700">
          {renderInline(trimmed.slice(3), `h2-${idx}`)}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <h1 key={idx} className="mt-5 text-xl font-bold text-brand-700">
          {renderInline(trimmed.slice(2), `h1-${idx}`)}
        </h1>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList(`list-${idx}`);
    } else {
      flushList(`list-${idx}`);
      blocks.push(
        <p key={idx} className="mt-2 text-sm leading-relaxed text-stone-700">
          {renderInline(trimmed, `p-${idx}`)}
        </p>
      );
    }
  });
  flushList("list-final");

  return <div>{blocks}</div>;
}
