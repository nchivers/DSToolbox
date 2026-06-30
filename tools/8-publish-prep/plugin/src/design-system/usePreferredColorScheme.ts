import { useEffect, useMemo, useState } from 'react';

export type ColorScheme = 'light' | 'dark';

/**
 * Returns the user's OS-level preferred color scheme, automatically updating
 * when the system setting changes.
 */
export const usePreferredColorScheme = (): ColorScheme => {
  const mediaQuery = useMemo(
    () => window.matchMedia('(prefers-color-scheme: dark)'),
    [],
  );

  const [preferredColorScheme, setPreferredColorScheme] = useState<ColorScheme>(
    mediaQuery.matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) =>
      setPreferredColorScheme(e.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  return preferredColorScheme;
};
