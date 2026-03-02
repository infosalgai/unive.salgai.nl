"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { detectPii, PII_WARNING } from "@/lib/pii-guard";
import { cn } from "@/lib/utils";

export const PII_WARNING_TEXT = PII_WARNING;

export interface PiiTextareaProps extends Omit<React.ComponentProps<typeof Textarea>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** When true, parent can block Next (e.g. step invalid while PII present). */
  onPiiChange?: (hasPII: boolean) => void;
  /** Optional class for the wrapper. */
  className?: string;
}

export function PiiTextarea({
  value,
  onChange,
  onPiiChange,
  className,
  ...textareaProps
}: PiiTextareaProps) {
  const result = React.useMemo(() => detectPii(value), [value]);

  React.useEffect(() => {
    onPiiChange?.(result.hasPII);
  }, [result.hasPII, onPiiChange]);

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
        {PII_WARNING_TEXT}
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={result.hasPII ? "pii-inline-warning" : undefined}
        aria-invalid={result.hasPII}
        {...textareaProps}
      />
      {result.hasPII && (
        <p
          id="pii-inline-warning"
          role="alert"
          className="text-sm text-destructive font-medium"
        >
          Er lijkt persoons- of herleidbare informatie in te staan. Pas de tekst aan om door te gaan.
        </p>
      )}
    </div>
  );
}
