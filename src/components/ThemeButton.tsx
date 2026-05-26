"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

export default function ThemeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: { value: Theme; icon: React.ElementType }[] = [
    { value: "dark", icon: Moon },
    { value: "light", icon: Sun },
    { value: "system", icon: Monitor },
  ];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon || Monitor;

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-colors w-full"
      title={`Theme: ${theme} (click to change)`}
    >
      <CurrentIcon size={16} />
      <span className="text-xs capitalize">{resolvedTheme}</span>
    </button>
  );
}
