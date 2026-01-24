import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";

type VerificationCodeInputProps = Omit<InputProps, "onChange" | "value" | "type"> & {
  value?: string;
  onChange: (value: string) => void;
  length?: number;
};

function sanitizeCode(value: string, length: number) {
  return value.replace(/\D/g, "").slice(0, length);
}

const VerificationCodeInput = React.forwardRef<HTMLInputElement, VerificationCodeInputProps>(
  ({ value, onChange, length = 6, onPaste, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        enterKeyHint="done"
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = sanitizeCode(event.target.value, length);
          onChange(nextValue);
        }}
        onPaste={(event) => {
          if (!event.clipboardData) {
            onPaste?.(event);
            return;
          }
          const pastedValue = event.clipboardData.getData("text");
          const nextValue = sanitizeCode(pastedValue, length);
          event.preventDefault();
          onChange(nextValue);
          onPaste?.(event);
        }}
        {...props}
      />
    );
  },
);

VerificationCodeInput.displayName = "VerificationCodeInput";

export { VerificationCodeInput };
