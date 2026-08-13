type AdSlotProps = {
  width: number;
  height: number;
  label?: string;
  className?: string;
};

/** Placeholder for an AdSense unit. Replace the inner markup with your ad code. */
export function AdSlot({ width, height, label, className }: AdSlotProps) {
  return (
    <div
      className={`mx-auto flex w-full max-w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface/60 text-[11px] uppercase tracking-widest text-muted-foreground ${className ?? ""}`}
      style={{ maxWidth: width, height }}
      aria-label="Advertisement placeholder"
    >
      {label ?? `Ad ${width}×${height}`}
    </div>
  );
}
