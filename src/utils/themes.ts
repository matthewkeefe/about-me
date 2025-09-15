// Theme utilities for dynamic theme loading

// Auto-detect available themes by checking which CSS files exist
// This function dynamically discovers themes from the themes/ folder
export const getAvailableThemes = async (): Promise<string[]> => {
  const knownThemes = ['slate', 'green', 'indigo']; // Add new themes here
  const availableThemes: string[] = [];
  
  // Test which theme CSS files actually exist
  for (const theme of knownThemes) {
    try {
      const response = await fetch(`/themes/${theme}.css`, { method: 'HEAD' });
      if (response.ok) {
        availableThemes.push(theme);
      }
    } catch {
      // Theme file doesn't exist, skip it
    }
  }
  
  return availableThemes.length > 0 ? availableThemes : ['default'];
};

// Generate display names automatically: 'indigo' -> 'Indigo', 'default' -> 'Default'
export const getThemeDisplayName = (themeName: string): string => {
  return themeName.charAt(0).toUpperCase() + themeName.slice(1);
};

// For backwards compatibility, export a synchronous version for immediate use
export const getAvailableThemesSync = (): string[] => {
  return ['slate', 'green', 'indigo']; // Keep in sync with knownThemes above
};

export type Theme = string; // Make this more flexible to support any theme name

export const themeColors: Record<string, { light: string; dark: string }> = {
  slate: {
    light: '#efefef',
    dark: '#313339'
  },
  green: {
    light: '#efefef',
    dark: '#303030'
  },
  indigo: {
    light: '#efefef',
    dark: '#303030'
  },
  default: {
    light: '#ffffff',
    dark: '#000000'
  }
};

export const loadTheme = async (themeName: string) => {
  // Remove existing theme stylesheets
  const existingThemes = document.querySelectorAll('link[data-theme]');
  existingThemes.forEach(link => link.remove());
  
  // Skip loading for default theme (uses base CSS)
  if (themeName === 'default') return;
  
  // Load custom theme CSS file
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/themes/${themeName}.css`;
  link.setAttribute('data-theme', themeName);
  document.head.appendChild(link);
};

export const applyTheme = (theme: string, isDarkMode: boolean = false) => {
  const root = document.documentElement;
  const knownThemes = ['slate', 'green', 'indigo']; // Keep in sync with above
  
  // Remove all theme classes and dark class
  knownThemes.forEach(t => root.classList.remove(t));
  root.classList.remove('dark');
  
  // Add current theme class (skip for default)
  if (theme !== 'default') {
    root.classList.add(theme);
  }
  
  // Add dark class if dark mode is enabled
  if (isDarkMode) {
    root.classList.add('dark');
  }
  
  // Update meta theme-color for mobile
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor && themeColors[theme]) {
    const colorValue = themeColors[theme][isDarkMode ? 'dark' : 'light'];
    metaThemeColor.setAttribute('content', colorValue);
  }
};