import "./index.css";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Header } from "./src/components/Header";
import {
  loadTheme,
  applyTheme,
  getAvailableThemesSync,
} from "./src/utils/themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const Section = ({ title, children }: { title: string; children: any }) => (
  <section className="mt-8 p-6 rounded-lg bg-card dark:bg-card mb-8">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <div className="mt-3 text-foreground/80">{children}</div>
  </section>
);

const PageTitle = ({
  name,
  title,
  children,
}: {
  name: string;
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="relative isolate overflow-hidden bg-card pt-8 sm:pt-16 ">
    <div className="mx-auto max-w-4xl px-6 lg:px-8 relative">
      {/* top-right slot for optional children (e.g. View Markdown link) */}
      {children && (
        <div className="absolute top-3 right-4 sm:top-4 sm:right-6 z-20">
          {children}
        </div>
      )}

      <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
        {name}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{title}</p>
    </div>
  </div>
);

// Professional Summary section with blurry background
const ProfessionalSummaryHero = ({
  summary,
  name,
  title,
}: {
  summary: string;
  name: string;
  title: string;
}) => (
  <div className="relative isolate overflow-hidden bg-card pt-8 sm:pt-8 lg:pt-8">
    <div className="max-w-4xl mx-auto px-4">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 pt-8 pb-8 rounded-lg ring-1 ring-border mb-8 bg-card/80 backdrop-blur-sm shadow-lg/30 overflow-hidden">
        
        {/* Beautiful blurred circles using chart colors */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Large central blur */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[32rem] h-[32rem] opacity-10 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle at center, var(--chart-2), var(--background))'
            }}
          ></div>
          
          {/* Top-right accent */}
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 opacity-25 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle at center, var(--chart-4), var(--background))'
            }}
          ></div>
          
          {/* Bottom-left accent */}
          <div 
            className="absolute -bottom-32 -left-32 w-64 h-64 opacity-20 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle at center, var(--chart-1), var(--background))'
            }}
          ></div>
          
          {/* Bottom-right small accent */}
          <div 
            className="absolute -bottom-24 -right-24 w-48 h-48 opacity-15 rounded-full blur-lg"
            style={{
              background: 'radial-gradient(circle at center, var(--chart-3), var(--background))'
            }}
          ></div>
        </div>
        
        {/* Content positioned above the background */}
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Professional Summary
          </h2>
          <p className="text-base leading-relaxed text-foreground whitespace-pre-line mx-auto">
            {summary}
          </p>
        </div>
      </div>
    </div>
  </div>
);

function ResumeApp() {
  // Separate state for theme name and dark mode
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem("theme");
    const availableThemes = getAvailableThemesSync();
    return savedTheme && availableThemes.includes(savedTheme)
      ? savedTheme
      : availableThemes[0] || "slate";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    const handleThemeUpdate = async () => {
      applyTheme(theme, isDarkMode);
      await loadTheme(theme);
      localStorage.setItem("theme", theme);
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    };

    handleThemeUpdate();
  }, [theme, isDarkMode]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Data loaded from content files
  const [resume, setResume] = useState<any | null>(null);
  const [skillsData, setSkillsData] = useState<any | null>(null);

  // Markdown mode support
  const [markdown, setMarkdown] = useState<string | null>(null);
  const isMarkdownMode = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("md") === "1";
  })();

  // Which group IDs are selected (allow multi-select)
  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>({});

  // Animation state for experience bullets
  const [animatingBullets, setAnimatingBullets] = useState<Set<string>>(
    new Set()
  );
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    // Fetch content JSON files or Markdown based on mode
    const load = async () => {
      try {
        if (isMarkdownMode) {
          const resMd = await fetch("/content/generated/resume.md");
          if (!resMd.ok) return;
          let mdText = await resMd.text();
          // Clean up mammoth's empty anchor id tags like: <a id="..."></a>
          // Use RegExp constructor to avoid TSX/esbuild parsing issues with </a> in regex literals
          mdText = mdText.replace(new RegExp(String.raw`<a id="[^"]*"><\/a>`, "g"), "");
          setMarkdown(mdText);
          return; // skip JSON loads
        }
        const [resSkills, resResume] = await Promise.all([
          fetch("/content/skills.json"),
          fetch("/content/resume.json"),
        ]);
        if (!resSkills.ok || !resResume.ok) return;
        const skillsJson = await resSkills.json();
        const resumeJson = await resResume.json();
        setSkillsData(skillsJson);
        setResume(resumeJson);
      } catch (e) {
        console.error("Failed to load resume, skills, or markdown", e);
      }
    };
    load();
  }, [isMarkdownMode]);

  // Derived maps for quick lookup
  const skillIdToName = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (skillsData && Array.isArray(skillsData.skills)) {
      for (const s of skillsData.skills) map[s.id] = s.name;
    }
    return map;
  }, [skillsData]);

  const groupIdToSkills = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    if (!skillsData) return map;
    for (const g of skillsData.groups || []) map[g.id] = [];
    for (const s of skillsData.skills || []) {
      for (const gid of s.groups || []) {
        (map[gid] ||= []).push(s.id);
      }
    }
    return map;
  }, [skillsData]);

  // Handle animated group toggle
  const handleGroupToggle = (groupId: string) => {
    setIsFiltering(true);

    // Brief delay to allow fade out before changing state
    setTimeout(() => {
      setActiveGroups((prev) => ({
        ...prev,
        [groupId]: !prev[groupId],
      }));

      // Reset filtering state after a brief moment to trigger fade in
      setTimeout(() => {
        setIsFiltering(false);
      }, 50);
    }, 150); // Half of the transition duration
  };

  // Handle clear all filters with animation
  const handleClearFilters = () => {
    setIsFiltering(true);

    setTimeout(() => {
      setActiveGroups({});
      setTimeout(() => {
        setIsFiltering(false);
      }, 50);
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        theme={theme}
        isDarkMode={isDarkMode}
        onThemeChange={handleThemeChange}
        onDarkModeToggle={handleDarkModeToggle}
      />

      {/* Markdown mode simple renderer */}
      {isMarkdownMode && (
        <main className="flex-grow py-4">
          <div className="max-w-3xl mx-auto px-4">
            <div className="mb-4 text-left">
              <a
                href="/resume.html"
                aria-label="View interactive version"
                title="View interactive version"
                className="text-muted-foreground underline transition-all duration-200 ease-in-out text-sm font-medium bg-background"
              >
                Switch to Interactive Resume
              </a>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {markdown || ""}
              </ReactMarkdown>
            </div>
          </div>
        </main>
      )}

      {/* Existing interactive mode */}
      {!isMarkdownMode && (
        <>
          {/* Page Title Section */}
          {resume && (
            <PageTitle
              name={resume?.name ?? "Matthew Keefe"}
              title={resume?.title ?? "Resume"}
            >
            </PageTitle>
          )}

          {/* Professional Summary Hero Section */}
          {resume && (
            <ProfessionalSummaryHero
              summary={resume.summary?.professional_summary || ""}
              name={resume?.name ?? "Resume"}
              title={resume?.title ?? ""}
            />
          )}

          <main className="flex-grow py-4">
            <div className="max-w-4xl mx-auto px-4">
              {/* Skills Filter Section */}
              {skillsData && (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-b from-card/60 to-card/30 dark:from-card/60 dark:to-card/40 ring-1 ring-border">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Filter by Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skillsData.groups.map((g: any) => {
                      const active = !!activeGroups[g.id];
                      return (
                        <button
                          key={g.id}
                          onClick={() => handleGroupToggle(g.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ring-1 ${
                            active
                              ? "bg-primary text-primary-foreground ring-primary"
                              : "bg-secondary text-secondary-foreground ring-border hover:bg-secondary/80"
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                    {/* Clear filters */}
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-1 rounded-full text-sm text-muted-foreground ring-1 ring-border hover:bg-secondary/50"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div className="md:grid md:grid-cols-3 md:gap-8">
                {/* Left side panel */}
                <aside className="md:col-span-1">
                  {resume && (
                    <div className="space-y-8">
                      {resume && skillsData && (
                        <>
                          <Section title="Key Skills">
                            <ul className="mt-3 space-y-2">
                              {(resume.summary?.key_skills || []).map(
                                (id: string) => (
                                  <li key={id} className="flex gap-x-3 items-start">
                                    <svg
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      aria-hidden="true"
                                      className="h-5 w-5 flex-none text-primary mt-0.5"
                                    >
                                      <path
                                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-sm text-muted-foreground">
                                      {skillIdToName[id] ?? id}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </Section>

                          <Section title="Technical Proficiencies">
                            <div className="flex flex-wrap gap-2">
                              {(resume.summary?.technical_proficiencies || []).map(
                                (id: string) => (
                                  <span
                                    key={id}
                                    className="px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                                  >
                                    {skillIdToName[id] ?? id}
                                  </span>
                                )
                              )}
                            </div>
                          </Section>
                        </>
                      )}
                    </div>
                  )}
                </aside>

                {/* Right main column */}
                <div className="md:col-span-2">
                  <Section title="Work Experience">
                    <div className="space-y-6">
                      {(resume?.employment || []).map((job: any, ji: number) => {
                        // For each job, filter experience bullets by activeGroup if set
                        // Build selected skill id set from chosen groups (multi-select)
                        const selectedGroupIds = Object.keys(activeGroups).filter(
                          (k) => activeGroups[k]
                        );
                        const selectedSkillIds = new Set<string>();
                        for (const gid of selectedGroupIds) {
                          for (const sid of groupIdToSkills[gid] || [])
                            selectedSkillIds.add(sid);
                        }

                        const bullets = (job.experience || []).filter((e: any) => {
                          if (selectedSkillIds.size === 0) return true; // no filter active
                          return (e.tags || []).some((t: string) =>
                            selectedSkillIds.has(t)
                          );
                        });

                        if (bullets.length === 0) return null; // hide job if no matching bullets under filter

                        return (
                          <div
                            key={ji}
                            className="p-4 rounded-md bg-card/60 ring-1 ring-border"
                          >
                            <div className="flex items-baseline justify-between">
                              <h4 className="text-sm font-semibold text-foreground">
                                {job.title}{" "}
                                <p className="font-normal text-muted-foreground">
                                  {job.company ? `@ ${job.company}` : ""}
                                </p>
                              </h4>
                              <span className="text-xs text-muted-foreground/70">
                                {job.start_date}
                                {job.end_date ? ` to ${job.end_date}` : ""}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {job.summary}
                            </p>
                            <ul className="mt-3 space-y-2">
                              {bullets.map((b: any, bi: number) => (
                                <li
                                  key={bi}
                                  className={`flex gap-x-3 items-start transition-all duration-300 ease-in-out ${
                                    isFiltering
                                      ? "animate-fade-out"
                                      : "animate-fade-in"
                                  }`}
                                >
                                  <svg
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    className="h-5 w-5 flex-none text-primary mt-0.5"
                                  >
                                    <circle cx="10" cy="10" r="3" />
                                  </svg>
                                  <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">
                                      {b.text}
                                    </span>
                                    {/* Skill group pills */}
                                    {b.tags && b.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(() => {
                                          // Collect all unique group IDs for this bullet's tags
                                          const uniqueGroupIds = new Set<string>();
                                          b.tags.forEach((tagId: string) => {
                                            const skill = skillsData?.skills?.find(
                                              (s: any) => s.id === tagId
                                            );
                                            const groupIds = skill?.groups || [];
                                            groupIds.forEach((groupId: string) =>
                                              uniqueGroupIds.add(groupId)
                                            );
                                          });

                                          // Convert to array and limit to first 3 groups
                                          return Array.from(uniqueGroupIds)
                                            .slice(0, 3)
                                            .map((groupId: string) => {
                                              const group =
                                                skillsData?.groups?.find(
                                                  (g: any) => g.id === groupId
                                                );
                                              if (!group) return null;

                                              return (
                                                <span
                                                  key={groupId}
                                                  className="px-2 py-0.5 rounded-full text-xs bg-secondary/60 text-secondary-foreground border border-border"
                                                >
                                                  {group.name}
                                                </span>
                                              );
                                            });
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  {/* Education */}
                  {resume && (resume.education || []).length > 0 && (
                    <Section title="Education">
                      <div className="space-y-4">
                        {resume.education.map((e: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-md bg-card/60 ring-1 ring-border"
                          >
                            <div className="flex items-baseline justify-between">
                              <h4 className="text-sm font-semibold text-foreground">
                                {e.title}
                              </h4>
                              <span className="text-xs text-muted-foreground/70">
                                {e.start_date ? `${e.start_date}` : ""}{e.end_date ? ` — ${e.end_date}` : ""}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {e.school}
                              {e.gpa ? ` • GPA: ${e.gpa}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Certifications */}
                  {resume && (resume.certifications || []).length > 0 && (
                    <Section title="Certifications">
                      <div className="space-y-3">
                        {resume.certifications.map((c: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-md bg-card/60 ring-1 ring-border"
                          >
                            <div className="flex items-baseline justify-between">
                              <h4 className="text-sm font-semibold text-foreground">
                                {c.name}
                              </h4>
                              <span className="text-xs text-muted-foreground/70">
                                {c.date}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {c.issuer} — {c.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ResumeApp />);
}
