// Theme utilities for dynamic theme loading
export const themes = ['slate', 'green'] as const;
export type Theme = typeof themes[number];

export const themeColors: Record<Theme, { light: string; dark: string }> = {
  slate: {
    light: '#ffffff', // White background for light mode
    dark: '#313339' // Dark background from slate theme
  },
  green: {
    light: '#ffffff', // White background for light mode  
    dark: '#303030' // Dark background for green theme
  }
};

export const loadTheme = async (themeName: Theme) => {
  // Remove existing theme stylesheets
  const existingThemes = document.querySelectorAll('link[data-theme]');
  existingThemes.forEach(link => link.remove());
  
  // Load custom theme CSS file
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/themes/${themeName}.css`;
  link.setAttribute('data-theme', themeName);
  document.head.appendChild(link);
};

export const applyTheme = (theme: Theme, isDarkMode: boolean = false) => {
  const root = document.documentElement;
  
  // Remove all theme classes and dark class
  themes.forEach(t => root.classList.remove(t));
  root.classList.remove('dark');
  
  // Add current theme class
  root.classList.add(theme);
  
  // Add dark class if dark mode is enabled
  if (isDarkMode) {
    root.classList.add('dark');
  }
  
  // Update meta theme-color for mobile
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const colorValue = themeColors[theme][isDarkMode ? 'dark' : 'light'];
    metaThemeColor.setAttribute('content', colorValue);
  }
};

// Helper to get available themes (color schemes only, no dark/light variants)
export const getAvailableThemes = (): Theme[] => {
  return ['slate', 'green']; // Add more as you create theme files
};