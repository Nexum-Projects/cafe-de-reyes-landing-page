import { cn } from "@/lib/utils";

export function RichText({ html, className }: { html?: string | null; className?: string }) {
  if (!html) {
    return null;
  }

  return (
    <div
      className={cn(
        "[&_a]:font-semibold [&_a]:text-[var(--azul-grisaceo)] [&_a]:underline [&_a]:underline-offset-4",
        "[&_em]:italic [&_i]:italic [&_strong]:font-bold [&_b]:font-bold",
        "[&_ol]:ml-5 [&_ol]:list-decimal [&_p:not(:first-child)]:mt-3 [&_ul]:ml-5 [&_ul]:list-disc",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}

function sanitizeRichText(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi, "")
    .replace(/\s(on\w+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
}
