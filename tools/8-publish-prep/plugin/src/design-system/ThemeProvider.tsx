import * as React from 'react';
import { useState, useLayoutEffect, useContext } from 'react';
import { usePreferredColorScheme } from './usePreferredColorScheme';

type ColorMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: string;
  mode: ColorMode;
  setTheme: (theme: string) => void;
  setMode: (mode: ColorMode | 'auto') => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'affirm',
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
});

interface ThemeProviderProps {
  defaultTheme?: string;
  defaultMode?: ColorMode | 'auto';
  children: React.ReactNode;
}

export const ThemeProvider = ({
  defaultTheme = 'affirm',
  defaultMode = 'auto',
  children,
}: ThemeProviderProps) => {
  const preferred = usePreferredColorScheme();
  const [theme, setTheme] = useState(defaultTheme);
  const [mode, setModeRaw] = useState<ColorMode>(
    defaultMode === 'auto' ? preferred : defaultMode,
  );

  const setMode = React.useCallback(
    (m: ColorMode | 'auto') => {
      setModeRaw(m === 'auto' ? preferred : m);
    },
    [preferred],
  );

  React.useEffect(() => {
    if (defaultMode === 'auto') {
      setModeRaw(preferred);
    }
  }, [preferred, defaultMode]);

  useLayoutEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme;
    el.dataset.mode = mode;
  }, [theme, mode]);

  const value = React.useMemo(
    () => ({ theme, mode, setTheme, setMode }),
    [theme, mode, setTheme, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
