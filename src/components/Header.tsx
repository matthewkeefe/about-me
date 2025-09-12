import React from 'react';

interface HeaderProps {
  theme: string;
  onThemeToggle: () => void;
  variant?: 'main' | 'resume';
}

const LogoIcon = () => (
  <img
    src="/assets/mk-clouds-favicon.svg"
    alt="Matthew Keefe logo"
    role="img"
    className="h-7 w-auto"
  />
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

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, variant = 'main' }) => {
  const navLinks = ["Interactive Resume", "Projects", "Music", "Social"];

  return (
    <header className="w-full p-4 border-b border-slate-900/10 dark:border-slate-300/10">
      <nav className={`flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 ${variant === 'main' ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <a href={variant === 'resume' ? '/' : '#'} aria-label={variant === 'resume' ? 'Home page' : 'Home page'}>
          <LogoIcon />
        </a>
        
        <div className="flex items-center gap-4">
          {variant === 'main' && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <a 
                  key={link} 
                  href={link === 'Interactive Resume' ? '/resume.html' : '#'} 
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white light:text-slate-900 light:hover:text-slate-700"
                >
                  {link}
                </a>
              ))}
            </div>
          )}
          
          {variant === 'resume' && (
            <a href="/" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Back
            </a>
          )}
          
          <button 
            type="button" 
            onClick={onThemeToggle}
            className="group relative rounded-lg p-2 ring-1 ring-slate-900/10 dark:ring-slate-300/10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-in-out"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div className="relative h-5 w-5">
              <div 
                className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
                  theme === 'dark' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : 'rotate-90 scale-0 opacity-0'
                }`}
              >
                <SunIcon />
              </div>
              <div 
                className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
                  theme === 'light' 
                    ? 'rotate-0 scale-100 opacity-100' 
                    : '-rotate-90 scale-0 opacity-0'
                }`}
              >
                <MoonIcon />
              </div>
            </div>
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </nav>
    </header>
  );
};