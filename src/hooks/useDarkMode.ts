import { useState, useEffect } from 'react';

type DarkModeState = [boolean, () => void];

const useDarkMode = (initialState = false): DarkModeState => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('dark-mode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    
    // If no saved preference, check system preference
    if (window.matchMedia) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDarkMode;
    }
    
    // Fallback to initial state
    return initialState;
  });

  useEffect(() => {
    // Update localStorage when darkMode changes
    localStorage.setItem('dark-mode', darkMode.toString());
    
    // Update document body class
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if the user hasn't manually changed the preference
      const savedMode = localStorage.getItem('dark-mode');
      if (savedMode === null) {
        setDarkMode(e.matches);
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Fallback for older browsers
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return [darkMode, toggleDarkMode];
};

export default useDarkMode; 