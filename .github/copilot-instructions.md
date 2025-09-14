# Copilot Instructions for About-Me Portfolio

## Architecture Overview

This is a **multi-page React portfolio app** with data-driven content built on Vite + TypeScript + Tailwind CSS. The app features an interactive resume, API-driven content pages, and multiple theme support.

### Current Pages & Planned Structure

- **Landing**: `index.tsx` (main portfolio landing)
- **Resume**: `resume.tsx` (filterable skills-based resume)
- **Projects**: Planned - GitHub API integration for repo listing
- **Music**: Planned - artist showcase with embedded videos (H4rdw1r3d, Araila Muse)
- **Social**: Planned - LinkedIn API integration for posts

### Key Components & Data Flow

- **Shared Header**: `src/components/Header.tsx` with multi-theme toggle and full navigation
- **Content Sources**: `content/resume.json` + `content/skills.json` (runtime fetch)
- **API Integrations**: GitHub API (projects), LinkedIn API (social posts)
- **Skills System**: Complex skill-to-group mapping with filtering logic

### Critical Patterns

#### 1. Multi-Theme Management (Complete Independent System)
```tsx
// Independent theme selection (color scheme) and dark mode toggle
const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("theme") || "light");
const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
  JSON.parse(localStorage.getItem("darkMode") || "false")
);

// Theme application with separate dark mode handling
const applyTheme = (theme: Theme, isDarkMode: boolean = false) => {
  const root = document.documentElement;
  
  // Remove all theme classes and dark class
  themes.forEach(t => root.classList.remove(t));
  root.classList.remove('dark');
  
  // Add current theme class (skip for 'light' which is base)
  if (theme !== 'light') {
    root.classList.add(theme);
  }
  
  // Add dark class if dark mode is enabled
  if (isDarkMode) {
    root.classList.add('dark');
  }
};

useEffect(() => {
  applyTheme(theme, isDarkMode);
  loadTheme(theme);
  localStorage.setItem("theme", theme);
  localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
}, [theme, isDarkMode]);
```

#### 2. Theme File Structure
```
themes/
├── slate.css     /* shadcn generated theme with light/dark variants */
├── purple.css    /* future themes with light/dark variants */
├── blue.css      /* future themes with light/dark variants */
└── green.css     /* future themes with light/dark variants */

/* Example: themes/slate.css */
:root.slate {
  /* Light variant colors */
  --background: oklch(0.97 0 0);
  --foreground: oklch(0.218 0 0);
  --primary: oklch(0.353 0.047 258);
  /* ... complete theme from shadcn generator */
}

.slate.dark {
  /* Dark variant overrides */
  --background: oklch(0.248 0 0);
  --foreground: oklch(0.961 0 0);
  /* ... dark variant overrides */
}

/* Type System - Only themes with CSS files */
export const themes = ['slate'] as const;        // Only themes with CSS files
export type Theme = typeof themes[number];       // Currently just 'slate'
```

#### 3. Header UI Pattern (Dark Mode Toggle Only)
```tsx
// Header component with theme and dark mode props
interface HeaderProps {
  theme: Theme;
  isDarkMode: boolean;
  onThemeChange: (theme: Theme) => void;
  onDarkModeToggle: () => void;
  variant?: 'main' | 'resume';
}

// Theme dropdown only shown when multiple themes available
const Header = ({ theme, isDarkMode, onThemeChange, onDarkModeToggle, variant }) => {
  const availableThemes = getAvailableThemes();
  
  return (
    <div className="flex items-center gap-2">
      {availableThemes.length > 1 && (
        <ThemeDropdown theme={theme} onThemeChange={onThemeChange} />
      )}
      <DarkModeToggle isDark={isDarkMode} onToggle={onDarkModeToggle} />
    </div>
  );
};

// Dark mode toggle with sun/moon icons (always visible)
const DarkModeToggle = ({ isDark, onToggle }) => (
  <button onClick={onToggle} className="...">
    <SunIcon className={isDark ? "opacity-100" : "opacity-0"} />
    <MoonIcon className={!isDark ? "opacity-100" : "opacity-0"} />
  </button>
);
```

#### 3. Theme Integration with Tailwind
```css
/* index.css - Base theme (light/dark only) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... base light theme */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... base dark theme */
}

/* Custom themes loaded dynamically from /themes/ folder */
/* Vite will serve these as static assets automatically */
```

#### 4. Alternative: Import-based Theme Loading
```tsx
// For build-time optimization, you can also use dynamic imports
const themeModules = {
  purple: () => import('../themes/purple.css'),
  blue: () => import('../themes/blue.css'),
  green: () => import('../themes/green.css'),
};

const loadTheme = async (themeName: string) => {
  if (themeModules[themeName]) {
    await themeModules[themeName]();
  }
};
```

#### 2. Navigation Architecture (Full Site Navigation)
```tsx
// Enhanced Header with theme dropdown + dark mode toggle + complete navigation
const navLinks = [
  { name: "Interactive Resume", href: "/resume.html" },
  { name: "Projects", href: "/projects.html" },
  { name: "Music", href: "/music.html" },
  { name: "Social", href: "/social.html" }
];

// Header layout with theme controls
<div className="flex items-center gap-2">
  <ThemeDropdown theme={theme} onThemeChange={onThemeChange} />
  <DarkModeToggle isDark={isDarkMode} onToggle={handleDarkModeToggle} />
</div>
```

#### 3. API Integration Patterns
```tsx
// GitHub API for Projects Page
const fetchGitHubRepos = async () => {
  const response = await fetch('https://api.github.com/users/matthewkeefe/repos');
  return response.json();
};

// LinkedIn API for Social Posts (requires OAuth)
const fetchLinkedInPosts = async (accessToken: string) => {
  // LinkedIn API integration for posts
};
```

#### 4. Music Page Structure
```tsx
// Music page with anchor navigation sidebar
const artists = [
  { id: 'h4rdw1r3d', name: 'H4rdw1r3d', videoUrl: '...' },
  { id: 'araila-muse', name: 'Araila Muse', videoUrl: '...' }
];
// Sidebar with anchor links, sections with embedded videos
```

#### 5. Skills Data Architecture (`content/skills.json`)
- **Groups**: Categories like "Leadership & People", "Frontend & UX"
- **Skills**: Individual skills with `groups[]` array for many-to-many relationships
- **Resume Integration**: Experience bullets have `tags[]` that reference skill IDs

#### 6. Resume Filtering Logic (Key Business Logic)
```tsx
// Multi-select group filtering with smooth animations
const selectedSkillIds = new Set<string>();
for (const gid of selectedGroupIds) {
  for (const sid of groupIdToSkills[gid] || []) selectedSkillIds.add(sid);
}
// Filter experience bullets by intersection with tags
const bullets = job.experience.filter(e => 
  selectedSkillIds.size === 0 || e.tags?.some(t => selectedSkillIds.has(t))
);
```

#### 7. Animation Pattern for Filtering
Use `setIsFiltering(true)` → timeout → update state → timeout → `setIsFiltering(false)` for smooth fade transitions.

## Development Workflow

- **Dev**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (for production)
- **Content Updates**: Edit JSON files in `content/` - no rebuild needed
- **Styling**: Tailwind with dark mode via `class` strategy

## Project-Specific Conventions

1. **Multi-Page HTML Structure**: Each page (`index.html`, `resume.html`, `projects.html`, `music.html`, `social.html`) has identical `<head>` setup for theme management
2. **Header Variants**: Use `variant="main"` (full nav) vs `variant="resume"` (back button only) - planned to standardize to full nav
3. **Section Component**: Reusable `<Section title="...">` wrapper with consistent styling
4. **No Router**: Static file routing (`/resume.html` links) - maintain this simple approach

## Integration Points

- **Vite Config**: Exposes `GEMINI_API_KEY` as `process.env.GEMINI_API_KEY` (though not currently used in UI)
- **GitHub API**: For projects page - fetch user repos at runtime
- **LinkedIn API**: For social page - requires OAuth flow for post fetching
- **Static Assets**: `/assets/` for favicon/images referenced in components
- **Video Embedding**: Music page will embed intro videos for each artist
- **Responsive**: Mobile-first with `md:` breakpoints for desktop layout changes

## Anti-Patterns to Avoid

- Don't use CSS-in-JS - this project uses Tailwind exclusively
- Don't add routing libraries - keep the simple two-file structure
- Don't inline large data - keep using the JSON content pattern
- Don't break the theme synchronization between pages