import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

export function Dica({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-accent-foreground/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span>
    </p>
  );
}
