/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';

const LogoIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 38 30" fill="none" className="h-7 w-auto text-slate-900 dark:text-white">
    <path d="M19 0L0 15L19 30L38 15L19 0Z" fill="currentColor" fillOpacity="0.5"></path>
    <path d="M19 11.25L3.8 22.5L19 30L34.2 22.5L19 11.25Z" fill="currentColor"></path>
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 stroke-slate-900 dark:stroke-slate-100">
      <path d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path>
      <path strokeLinecap="round" d="M10 5.5v-1M10 15.5v-1M14.5 10h1M4.5 10h1M12.75 7.25l.5-.5M6.75 13.25l.5-.5M12.75 12.75l.5.5M6.75 6.75l.5.5"></path>
  </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 stroke-slate-900 dark:stroke-slate-100">
        <path d="M15.224 11.724a5.5 5.5 0 0 1-6.949-6.949 5.5 5.5 0 1 0 6.949 6.949Z"></path>
    </svg>
);

// CloudAnimation removed — using static background instead

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Set theme on mount
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const navLinks = ["Showcase", "Docs", "Blog", "Analytics", "Commerce", "Templates"];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="w-full p-4 border-b border-slate-900/10 dark:border-slate-300/10">
        <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="#" aria-label="Home page">
            <LogoIcon />
          </a>
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <a key={link} href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white light:text-slate-900 light:hover:text-slate-700">
                {link}
              </a>
            ))}
          </div>
          <button 
            type="button" 
            onClick={toggleTheme}
            className="rounded-md p-2 ring-1 ring-slate-900/10 dark:ring-slate-300/10 hover:bg-slate-50 dark:hover:bg-slate-900"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </header>

      <main className="background-container flex-grow flex items-center justify-center isolate relative">
        <div
          className="spotlight absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2"
          aria-hidden="true"
        />
        <div className="text-center p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            Hi, I'm Matthew Keefe!
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-slate-700 dark:text-slate-400">
            I work as an Senior Software Engineering Manager in the Chicagoland area (USA). I have a passion for building beautiful, performant, and accessible web applications. This page is under construction.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:active:bg-slate-300 dark:focus-visible:outline-white">
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);