import React, { useState, useRef, useEffect } from 'react';
import { getAvailableThemes } from '../utils/themes';
import { ParticleAnimation } from './ParticleAnimation';

interface HeaderProps {
  theme: string;
  isDarkMode: boolean;
  onThemeChange: (theme: string) => void;
  onDarkModeToggle: () => void;
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
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 stroke-foreground stroke-2">
    <path d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path>
    <path strokeLinecap="round" d="M10 5.5v-1M10 15.5v-1M14.5 10h1M4.5 10h1M12.75 7.25l.5-.5M6.75 13.25l.5-.5M12.75 12.75l.5.5M6.75 6.75l.5.5"></path>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 stroke-foreground stroke-2">
    <path d="M15.224 11.724a5.5 5.5 0 0 1-6.949-6.949 5.5 5.5 0 1 0 6.949 6.949Z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const ThemeDropdown = ({ theme, onThemeChange }: { theme: string; onThemeChange: (theme: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get available themes from utility
  const availableThemes = getAvailableThemes();
  
  // Show only alternative themes (not the current one)
  const alternativeThemes = availableThemes.filter(t => t !== theme);
  
  // Display names for themes
  const themeDisplayNames: Record<string, string> = {
    slate: 'Slate',
    green: 'Green'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {themeDisplayNames[theme] || theme}
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-md border border-border bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {alternativeThemes.map((themeName) => (
              <button
                key={themeName}
                onClick={() => {
                  onThemeChange(themeName);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground text-popover-foreground"
              >
                {themeDisplayNames[themeName] || themeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DarkModeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
  <button 
    type="button" 
    onClick={onToggle}
    className="group relative rounded-lg p-2 ring-1 ring-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out"
    aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
  >
    <div className="relative h-5 w-5">
      <div 
        className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
          isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0'
        }`}
      >
        <SunIcon />
      </div>
      <div 
        className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
          !isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        }`}
      >
        <MoonIcon />
      </div>
    </div>
    <span className="sr-only">Toggle dark mode</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({ theme, isDarkMode, onThemeChange, onDarkModeToggle }) => {
  const navLinks = [
    { name: "Home", href: "/", key: "home" },
    { name: "Interactive Resume", href: "/resume.html", key: "resume" },
    { name: "Projects", href: "#", key: "projects" },
    { name: "Music", href: "#", key: "music" },
    { name: "Social", href: "#", key: "social" }
  ];
  const availableThemes = getAvailableThemes();

  // Detect current page for highlighting
  const getCurrentPage = (): string => {
    const path = window.location.pathname;
    if (path.includes('resume.html')) return 'resume';
    if (path.includes('projects.html')) return 'projects';
    if (path.includes('music.html')) return 'music';
    if (path.includes('social.html')) return 'social';
    return 'home'; // Default for index page
  };

  const currentPage = getCurrentPage();

  return (
    <header className="w-full p-4 border-b border-border overflow-visible">
      <nav className="flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl overflow-visible">
        <a href="/" aria-label="Home page">
          <LogoIcon />
        </a>
        
        <div className="flex items-center gap-4 overflow-visible">
          <div className="hidden md:flex items-center space-x-8 overflow-visible">
            {navLinks.map(link => {
              const isActive = (link.key === 'home' && currentPage === 'home') ||
                              (link.key === 'resume' && currentPage === 'resume') || 
                              (link.key === currentPage);
              
              return (
                <div key={link.key} className="relative overflow-visible">
                  <a 
                    href={link.href} 
                    className={`text-sm font-medium transition-colors relative z-10 ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {link.name}
                  </a>
                  {isActive && (
                    <div className="absolute left-0 right-0 top-0 overflow-visible" style={{ height: '150%', bottom: '-50%' }}>
                      <ParticleAnimation isActive={true} className="h-full w-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            {availableThemes.length > 1 && (
              <ThemeDropdown theme={theme} onThemeChange={onThemeChange} />
            )}
            <DarkModeToggle isDark={isDarkMode} onToggle={onDarkModeToggle} />
          </div>
        </div>
      </nav>
    </header>
  );
};