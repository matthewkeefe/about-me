import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const LogoIcon = () => (
  <img
    src="/assets/mk-clouds-favicon.svg"
    alt="Matthew Keefe logo"
    role="img"
    className="h-7 w-auto"
  />
);

const Section = ({ title, children }: { title: string; children: any }) => (
  <section className="mt-8 p-6 rounded-lg bg-white/70 dark:bg-slate-800/60 ring-1 ring-slate-900/5 dark:ring-white/5">
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
      {title}
    </h3>
    <div className="mt-3 text-slate-700 dark:text-slate-300">{children}</div>
  </section>
);

function ResumeApp() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", theme === "dark" ? "#0f172a" : "#ffffff");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Data loaded from content files
  const [resume, setResume] = useState<any | null>(null);
  const [skillsData, setSkillsData] = useState<any | null>(null);

  // Which group IDs are selected (allow multi-select)
  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>({});
  
  // Animation state for experience bullets
  const [animatingBullets, setAnimatingBullets] = useState<Set<string>>(new Set());
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    // Fetch content JSON files
    const load = async () => {
      try {
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
        // ignore for now
        console.error("Failed to load resume or skills", e);
      }
    };
    load();
  }, []);

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
      <header className="w-full p-4 border-b border-slate-900/10 dark:border-slate-300/10">
        <nav className="flex items-center justify-between max-w-6xl mx-auto px-4">
          <a href="/" aria-label="Home page">
            <LogoIcon />
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-slate-700 dark:text-slate-300">
              Back
            </a>
            <button
              onClick={toggleTheme}
              className="rounded p-2 ring-1 ring-slate-900/10 dark:ring-slate-300/10 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-xl p-8 bg-gradient-to-b from-white/60 to-white/30 dark:from-slate-900/60 dark:to-slate-900/40 ring-1 ring-slate-900/5 dark:ring-white/5">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {resume?.name ?? "Resume"}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {resume?.title ?? ""}{" "}
                  {resume?.location ? `— ${resume.location}` : ""}
                </p>
              </div>
              <div className="mt-4 md:mt-0" />
            </div>

            {/* Group cloud */}
            {skillsData && (
              <div className="mt-6 flex flex-wrap gap-2">
                {skillsData.groups.map((g: any) => {
                  const active = !!activeGroups[g.id];
                  return (
                    <button
                      key={g.id}
                      onClick={() => handleGroupToggle(g.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ring-1 ${
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-slate-900"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-slate-200 dark:ring-slate-700"
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
                {/* Clear filters */}
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 rounded-full text-sm text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="mt-6 md:grid md:grid-cols-3 md:gap-8">
              {/* Left side panel */}
              <aside className="md:col-span-1">
                {resume && (
                  <div className="md:sticky md:top-6">
                    <Section title="Professional Summary">
                      <p className="whitespace-pre-line text-sm">
                        {resume.summary?.professional_summary}
                      </p>
                    </Section>
                    {resume && skillsData && (
                      <>
                        <Section title="Key Skills">
                          <ul className="mt-3 space-y-2">
                            {(resume.summary?.key_skills || []).map(
                              (id: string) => (
                                <li
                                  key={id}
                                  className="flex gap-x-3 items-start"
                                >
                                  <svg
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    className="h-5 w-5 flex-none text-indigo-400 mt-0.5"
                                  >
                                    <path
                                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                      clipRule="evenodd"
                                      fillRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {skillIdToName[id] ?? id}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </Section>

                        <Section title="Technical Proficiencies">
                          <div className="flex flex-wrap gap-2">
                            {(
                              resume.summary?.technical_proficiencies || []
                            ).map((id: string) => (
                              <span
                                key={id}
                                className="px-3 py-1 rounded-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                              >
                                {skillIdToName[id] ?? id}
                              </span>
                            ))}
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

                      const bullets = (job.experience || []).filter(
                        (e: any) => {
                          if (selectedSkillIds.size === 0) return true; // no filter active
                          return (e.tags || []).some((t: string) =>
                            selectedSkillIds.has(t)
                          );
                        }
                      );

                      if (bullets.length === 0) return null; // hide job if no matching bullets under filter

                      return (
                        <div
                          key={ji}
                          className="p-4 rounded-md bg-white/60 dark:bg-slate-800/60 ring-1 ring-slate-900/5 dark:ring-white/5"
                        >
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {job.title}{" "}
                              <span className="font-normal text-slate-600 dark:text-slate-300">
                                @ {job.company}
                              </span>
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {job.start_date}
                              {job.end_date ? ` — ${job.end_date}` : ""}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                            {job.summary}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {bullets.map((b: any, bi: number) => (
                              <li 
                                key={bi} 
                                className={`flex gap-x-3 items-start transition-all duration-300 ease-in-out ${
                                  isFiltering ? 'animate-fade-out' : 'animate-fade-in'
                                }`}
                              >
                                <svg
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  className="h-5 w-5 flex-none text-indigo-400 mt-0.5"
                                >
                                  <circle cx="10" cy="10" r="3" />
                                </svg>
                                <div className="flex-1">
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {b.text}
                                  </span>
                                  {/* Skill group pills */}
                                  {b.tags && b.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {(() => {
                                        // Collect all unique group IDs for this bullet's tags
                                        const uniqueGroupIds = new Set<string>();
                                        b.tags.forEach((tagId: string) => {
                                          const skill = skillsData?.skills?.find((s: any) => s.id === tagId);
                                          const groupIds = skill?.groups || [];
                                          groupIds.forEach((groupId: string) => uniqueGroupIds.add(groupId));
                                        });
                                        
                                        // Convert to array and limit to first 3 groups
                                        return Array.from(uniqueGroupIds).slice(0, 3).map((groupId: string) => {
                                          const group = skillsData?.groups?.find((g: any) => g.id === groupId);
                                          if (!group) return null;
                                          
                                          return (
                                            <span
                                              key={groupId}
                                              className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
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
                          className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-900/5 dark:ring-white/5"
                        >
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {e.title}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {e.start_date} — {e.end_date}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
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
                          className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 ring-1 ring-slate-900/5 dark:ring-white/5"
                        >
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {c.name}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {c.date}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
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
        </div>
      </main>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ResumeApp />);
}
