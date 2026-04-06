import { useState, useEffect } from "react";

interface GlitchedTextProps {
  text: string;
  className?: string;
  speed?: number;
  duration?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";

export default function GlitchedText({ 
  text, 
  className = "", 
  speed = 50, 
  duration = 1200 
}: GlitchedTextProps) {
  // Initialize with the final text to avoid flash of invisible content
  const [display, setDisplay] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Only run animation once on mount
    if (hasAnimated) return;
    
    const startTime = Date.now();
    const totalChars = text.replace(/ /g, '').length;
    
    const reveal = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const charsToReveal = Math.floor(progress * totalChars);

      if (progress >= 1) {
        setDisplay(text);
        setHasAnimated(true);
        clearInterval(reveal);
        return;
      }

      let nonSpaceIndex = 0;
      const result = text.split('').map((char) => {
        if (char === ' ') return ' ';
        
        const shouldReveal = nonSpaceIndex < charsToReveal;
        nonSpaceIndex++;
        
        if (shouldReveal) {
          return char;
        } else {
          // Keep showing symbols for unrevealed characters
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }).join('');

      setDisplay(result);
    }, speed);

    return () => clearInterval(reveal);
  }, [text, duration, speed, hasAnimated]);

  return <span className={className}>{display}</span>;
}
