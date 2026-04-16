import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

interface MathBlockProps {
  latex: string;
}

export function MathBlock({ latex }: MathBlockProps) {
  return (
    <div className="my-4 overflow-x-auto py-2 math-content">
      <BlockMath
        math={latex}
        errorColor="oklch(var(--destructive))"
        renderError={(error) => (
          <span className="text-destructive text-sm font-mono">
            Error: {error.message}
          </span>
        )}
      />
    </div>
  );
}
