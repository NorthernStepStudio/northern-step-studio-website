import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/react-app/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary border border-border hover:bg-accent/10 hover:border-accent transition-all flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
      )}
    </button>
  );
}
