import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { getRoleDisplayLabel } from "@/shared/auth";

interface User {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (userIds: number[]) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Type @ to mention someone...",
  rows = 6,
  className = "",
  disabled = false,
  textareaRef: forwardedTextareaRef,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mentionStartRef = useRef<number>(-1);

  // Search users when query changes
  useEffect(() => {
    if (disabled) {
      setUsers([]);
      return;
    }

    if (!searchQuery || searchQuery.length < 1) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 150);
    return () => clearTimeout(debounce);
  }, [disabled, searchQuery]);

  // Extract mentioned user IDs from content
  useEffect(() => {
    if (!onMentionsChange) return;

    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
    const userIds: number[] = [];
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      userIds.push(parseInt(match[2]));
    }

    onMentionsChange(userIds);
  }, [value, onMentionsChange]);

  const calculateDropdownPosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split("\n");
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];

    // Approximate character width and line height
    const charWidth = 8;
    const lineHeight = 24;

    const left = Math.min(currentLine.length * charWidth, textarea.clientWidth - 200);
    const top = (currentLineIndex + 1) * lineHeight;

    setDropdownPosition({ top, left });
  }, [value, cursorPosition]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) {
      return;
    }

    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPos);

    // Check if we should show the mention dropdown
    const textBeforeCursor = newValue.substring(0, newCursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if the @ is at start or preceded by whitespace
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : " ";
      const isValidMentionStart = /\s/.test(charBeforeAt) || lastAtIndex === 0;
      
      // Check if there's no space in the text after @
      const hasNoSpace = !textAfterAt.includes(" ");
      
      if (isValidMentionStart && hasNoSpace && textAfterAt.length <= 30) {
        mentionStartRef.current = lastAtIndex;
        setSearchQuery(textAfterAt);
        setShowDropdown(true);
        calculateDropdownPosition();
        return;
      }
    }

    setShowDropdown(false);
    setSearchQuery("");
    mentionStartRef.current = -1;
  };

  const insertMention = (user: User) => {
    if (mentionStartRef.current === -1) return;

    const displayName = user.display_name || user.email.split("@")[0];
    const mentionText = `@[${displayName}](${user.id})`;
    
    const before = value.substring(0, mentionStartRef.current);
    const after = value.substring(cursorPosition);
    
    const newValue = before + mentionText + " " + after;
    onChange(newValue);
    
    // Move cursor after the mention
    const newCursorPos = mentionStartRef.current + mentionText.length + 1;
    
    setShowDropdown(false);
    setSearchQuery("");
    mentionStartRef.current = -1;
    
    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || users.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(users[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-500/20 text-yellow-400";
      case "admin":
        return "bg-accent/20 text-accent";
      case "moderator":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={(element) => {
          textareaRef.current = element;
          if (forwardedTextareaRef) {
            forwardedTextareaRef.current = element;
          }
        }}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none ${className}`}
      />
      
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-64 max-h-48 overflow-y-auto rounded-xl bg-card border border-border shadow-lg"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              {searchQuery ? "No users found" : "Type to search..."}
            </div>
          ) : (
            users.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-accent/10 transition-colors ${
                  index === selectedIndex ? "bg-accent/10" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
                  {(user.display_name || user.email)[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.display_name || user.email.split("@")[0]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayLabel(user.role, { compact: true })}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function extractMentionedUserIds(content: string): number[] {
  const mentionRegex = /@\[[^\]]+\]\((\d+)\)/g;
  const ids = new Set<number>();
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const id = Number.parseInt(match[1], 10);
    if (Number.isFinite(id)) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}

export function replaceMentionTokens(content: string): string {
  return content.replace(/@\[([^\]]+)\]\((\d+)\)/g, "@$1");
}

// Helper to render content with highlighted mentions
export function renderMentions(content: string): React.ReactNode {
  const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    // Add the highlighted mention
    const displayName = match[1];
    parts.push(
      <span key={match.index} className="text-accent font-medium">
        @{displayName}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}
