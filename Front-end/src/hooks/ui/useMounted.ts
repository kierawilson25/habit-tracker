'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if component is mounted on the client
 *
 * Returns false during SSR and true after component mounts on client.
 * Useful for preventing hydration mismatches when using browser-only APIs.
 *
 * @returns {boolean} True if component is mounted on client, false during SSR
 *
 * @example
 * function MyComponent() {
 *   const mounted = useMounted();
 *
 *   if (!mounted) {
 *     return <Loading />;
 *   }
 *
 *   // Safe to use browser APIs here
 *   return <div>{window.innerWidth}</div>;
 * }
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
