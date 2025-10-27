import { useState, useEffect } from 'react';

/**
 * Debounces a value. This is useful for delaying an expensive calculation
 * or API call until the user has stopped interacting for a certain amount of time.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set a timer to update the debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // The cleanup function clears the timer if the value or delay changes
      // before the timer has fired. This is what creates the debounce effect.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Re-run the effect only if value or delay changes
  );

  return debouncedValue;
}
