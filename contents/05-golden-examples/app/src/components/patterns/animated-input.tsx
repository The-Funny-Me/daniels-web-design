"use client";

import { useState, type ChangeEvent, type FocusEvent, type Ref } from "react";
import { useCycler, type CyclerMode } from "@/hooks/use-cycler";
import { cn } from "@/lib/cn";
import { Input, type InputProps } from "@/components/ui/input";
import { useMotionOk } from "./design-provider";

interface AnimatedInputProps extends Omit<InputProps, "placeholder" | "ref"> {
  /** Cycled as a typing animation while the field is empty and unfocused. */
  examples: readonly string[];
  mode?: CyclerMode;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Text input whose empty state types through realistic examples. The overlay is aria-hidden and sits
 * on the input's own inline-start padding, so it follows the page direction. Focus or any value stops it.
 */
export function AnimatedInput({ examples, mode = "text", className, value, defaultValue, onChange, onFocus, onBlur, ...props }: AnimatedInputProps) {
  const motionOk = useMotionOk();
  const [focused, setFocused] = useState(false);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const current = value === undefined ? inner : String(value);
  const view = useCycler({ examples, mode, active: !focused && current === "", motionOk });

  return (
    <div className="relative">
      <Input
        {...props}
        type={props.type ?? (mode === "password" ? "password" : "text")}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        className={cn(className)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setInner(e.target.value);
          onChange?.(e);
        }}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      <span
        aria-hidden
        data-animated-placeholder
        className="pointer-events-none absolute inset-y-0 start-6 end-6 flex items-center overflow-hidden text-base text-ink-3"
      >
        <span className="truncate">
          {view.text}
        </span>
        {view.caret && <span data-anim className="ms-px block h-4 w-px shrink-0 bg-brand-ui" style={{ animation: "blink 1s steps(1) infinite" }} />}
      </span>
    </div>
  );
}
