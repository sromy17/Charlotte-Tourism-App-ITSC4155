"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface SpecialTextProps {
  children: string;
  speed?: number;
  delay?: number;
  className?: string;
  inView?: boolean;
  once?: boolean;
}

const RANDOM_CHARS = "_!X$0-+*#";

function getRandomChar(prevChar?: string): string {
  let char: string;
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  } while (char === prevChar);
  return char;
}

export function SpecialText({
  children,
  speed = 20,
  delay = 0,
  className = "",
  inView = false,
  once = true,
}: SpecialTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once, margin: "-100px" });
  const shouldAnimate = inView ? isInView : true;
  const [hasStarted, setHasStarted] = useState(() => !inView && delay <= 0);
  const text = children;
  const [displayText, setDisplayText] = useState<string>(" ".repeat(text.length));
  const [currentPhase, setCurrentPhase] = useState<"phase1" | "phase2">("phase1");
  const [animationStep, setAnimationStep] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);

  function clearStartTimeout() {
    if (startTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = null;
  }

  const startAnimation = useCallback(() => {
    setHasStarted(true);
    setDisplayText(" ".repeat(text.length));
    setCurrentPhase("phase1");
    setAnimationStep(0);
  }, [text.length]);

  const runPhase1 = useCallback(() => {
    const maxSteps = text.length * 2;
    const currentLength = Math.min(animationStep + 1, text.length);

    const chars: string[] = [];
    for (let index = 0; index < currentLength; index += 1) {
      const prevChar = index > 0 ? chars[index - 1] : undefined;
      chars.push(getRandomChar(prevChar));
    }

    for (let index = currentLength; index < text.length; index += 1) {
      chars.push("\u00A0");
    }

    setDisplayText(chars.join(""));

    if (animationStep < maxSteps - 1) {
      setAnimationStep((prev) => prev + 1);
      return;
    }

    setCurrentPhase("phase2");
    setAnimationStep(0);
  }, [animationStep, text.length]);

  const runPhase2 = useCallback(() => {
    const revealedCount = Math.floor(animationStep / 2);
    const chars: string[] = [];

    for (let index = 0; index < revealedCount && index < text.length; index += 1) {
      chars.push(text[index]);
    }

    if (revealedCount < text.length) {
      chars.push(animationStep % 2 === 0 ? "_" : getRandomChar());
    }

    for (let index = chars.length; index < text.length; index += 1) {
      chars.push(getRandomChar());
    }

    setDisplayText(chars.join(""));

    if (animationStep < text.length * 2 - 1) {
      setAnimationStep((prev) => prev + 1);
      return;
    }

    setDisplayText(text);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [animationStep, text]);

  useEffect(() => {
    if (shouldAnimate && !hasStarted) {
      clearStartTimeout();

      if (delay <= 0) {
        startAnimation();
        return () => clearStartTimeout();
      }

      startTimeoutRef.current = window.setTimeout(() => {
        startTimeoutRef.current = null;
        startAnimation();
      }, delay * 1000);
    }

    return () => clearStartTimeout();
  }, [shouldAnimate, hasStarted, delay, text.length, startAnimation]);

  useEffect(() => {
    if (!hasStarted) {
      return () => undefined;
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (currentPhase === "phase1") {
        runPhase1();
      } else {
        runPhase2();
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentPhase, animationStep, text, speed, hasStarted, runPhase1, runPhase2]);

  useEffect(() => {
    if (hasStarted) {
      setDisplayText(" ".repeat(text.length));
      setCurrentPhase("phase1");
      setAnimationStep(0);
    }

    return () => {
      clearStartTimeout();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, hasStarted]);

  return (
    <span
      ref={containerRef}
      aria-label={text}
      className={`inline-flex min-h-[1em] items-center whitespace-pre font-mono font-medium ${className}`}
    >
      {displayText}
    </span>
  );
}