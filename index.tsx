/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import './index.css';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import { Header } from './src/components/Header';
import { loadTheme, applyTheme, getAvailableThemesSync } from './src/utils/themes';

// CloudAnimation removed — using static background instead

function App() {
  // Separate state for theme name and dark mode
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('theme');
    const availableThemes = getAvailableThemesSync();
    return savedTheme && availableThemes.includes(savedTheme) ? savedTheme : availableThemes[0] || 'slate';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    const handleThemeUpdate = async () => {
      // Apply theme with dark mode
      applyTheme(theme, isDarkMode);
      await loadTheme(theme);
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    };

    handleThemeUpdate();
  }, [theme, isDarkMode]);
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Header 
        theme={theme} 
        isDarkMode={isDarkMode}
        onThemeChange={handleThemeChange} 
        onDarkModeToggle={handleDarkModeToggle}
      />

      <main className="background-container flex-grow flex items-center justify-center isolate relative">
        <div
          className="spotlight absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="text-left p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Hi, I'm Matthew Keefe!
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
            I work as an Senior Software Engineering Manager in the Chicagoland area (USA). I have a passion for building beautiful, performant, and accessible web applications. This page is under construction.
          </p>
          <div className="mt-10 flex items-left gap-x-6">
            <a href="/resume.html" className="rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-primary">
              My Skills and Experience
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);