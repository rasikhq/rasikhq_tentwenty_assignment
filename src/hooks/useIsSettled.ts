import { useEffect, useState } from 'react';

/**
 * Whether the value has stayed the same for the delay. Any change starts the wait again, including a
 * change back to the value it last settled on.
 */
export function useIsSettled<T>(value: T, delayMs: number): boolean {
  // Null while the value is still changing
  const [settled, setSettled] = useState<{ value: T } | null>({ value });

  useEffect(() => {
    const timer = setTimeout(() => setSettled({ value }), delayMs);
    return () => {
      clearTimeout(timer);
      setSettled(null);
    };
  }, [value, delayMs]);

  return settled !== null && Object.is(settled.value, value);
}
