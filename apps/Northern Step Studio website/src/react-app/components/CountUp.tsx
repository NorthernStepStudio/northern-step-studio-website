import { useState, useEffect, useRef } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUp({
  value,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValue = useRef(value);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    // Detect value change for flash effect
    if (prevValue.current !== value && prevValue.current !== 0) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
    }
    prevValue.current = value;

    startValue.current = displayValue;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue.current + (value - startValue.current) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span 
      className={`${className} transition-opacity duration-300 ${
        isFlashing ? "opacity-100 animate-flash" : ""
      }`}
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
