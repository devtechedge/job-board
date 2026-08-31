import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  document.documentElement.style.colorScheme = next;
  try {
    localStorage.setItem("jobrow-theme", next);
  } catch {
    /* private mode */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const next: Theme = dark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      className="relative size-9 shrink-0 text-ink hover:text-pine"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className="absolute inset-0 grid place-items-center transition duration-300 ease-out"
        style={{
          opacity: dark ? 1 : 0,
          transform: dark ? "scale(1)" : "scale(0.25)",
          filter: dark ? "blur(0)" : "blur(4px)",
        }}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
        </svg>
      </span>
      <span
        className="absolute inset-0 grid place-items-center transition duration-300 ease-out"
        style={{
          opacity: dark ? 0 : 1,
          transform: dark ? "scale(0.25)" : "scale(1)",
          filter: dark ? "blur(4px)" : "blur(0)",
        }}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z" />
        </svg>
      </span>
    </button>
  );
}
