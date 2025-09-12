/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import { Header } from './src/components/Header';

// CloudAnimation removed — using static background instead

function App() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference, fallback to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // // Check system preference
    // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //   return 'dark';
    // }
    
    return 'dark'; // Default theme
  });

  useEffect(() => {
    // Apply theme to document and save to localStorage
    const applyTheme = (currentTheme: string) => {
      const root = document.documentElement;
      
      // Remove all theme classes first
      root.classList.remove('dark', 'light');
      
      // Add the current theme class
      root.classList.add(currentTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', currentTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#0f172a' : '#ffffff');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        // Only follow system preference if user hasn't manually set a theme
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header theme={theme} onThemeToggle={toggleTheme} variant="main" />

      <main className="background-container flex-grow flex items-center justify-center isolate relative">
        <div
          className="spotlight absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="text-left p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            Hi, I'm Matthew Keefe!
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-slate-700 dark:text-slate-400">
            I work as an Senior Software Engineering Manager in the Chicagoland area (USA). I have a passion for building beautiful, performant, and accessible web applications. This page is under construction.
          </p>
          <div className="mt-10 flex items-left gap-x-6">
            <a href="/resume.html" className="rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:active:bg-slate-300 dark:focus-visible:outline-white">
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