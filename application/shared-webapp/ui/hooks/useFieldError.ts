import { useEffect, useRef, useState } from "react";

/**
 * Manages error suppression for field components.
 *
 * Text-like inputs (TextField, NumberField, etc.): call markChanged() on onChange,
 * then clearOnBlur() on onBlur — the error clears after the user changes and leaves.
 *
 * Instant-select controls (Select, DatePicker, Switch, Checkbox, etc.): call clearNow()
 * directly in their onChange/onCheckedChange — the error clears immediately on interaction.
 */
export function useFieldError(errorMessage: string | undefined) {
  const [suppressError, setSuppressError] = useState(false);
  const hasChangedRef = useRef(false);

  useEffect(() => {
    setSuppressError(false);
    hasChangedRef.current = false;
  }, [errorMessage]);

  return {
    displayError: suppressError ? undefined : errorMessage,
    markChanged: () => {
      hasChangedRef.current = true;
    },
    clearOnBlur: () => {
      if (hasChangedRef.current) {
        setSuppressError(true);
        hasChangedRef.current = false;
      }
    },
    clearNow: () => {
      setSuppressError(true);
      hasChangedRef.current = false;
    }
  };
}
