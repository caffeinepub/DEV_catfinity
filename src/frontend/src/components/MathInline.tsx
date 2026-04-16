import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";

interface MathInlineProps {
  latex: string;
}

export function MathInline({ latex }: MathInlineProps) {
  return (
    <InlineMath
      math={latex}
      errorColor="oklch(var(--destructive))"
      renderError={(error) => (
        <span className="text-destructive text-sm font-mono">
          [{error.message}]
        </span>
      )}
    />
  );
}
