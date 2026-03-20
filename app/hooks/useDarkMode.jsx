import { useState, useEffect } from "react";
import { applyTheme } from "../styles/theme";

/**
 * useDarkMode
 * Manages dark/light toggle.
 * Calls applyTheme() to set data-theme on <html> so CSS variables
 * in tokens.css switch instantly — no JS re-render needed for colors.
 *
 * Also reads prefers-reduced-motion for accessibility.
 */
export function useDarkMode() {
  const [dark, setDarkState]              = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* Wrap setter so it also updates the DOM attribute */
  function setDark(value) {
    setDarkState(value);
    applyTheme(value);
  }

  /* Sync reduced-motion preference */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Apply initial theme on mount */
  useEffect(() => {
    applyTheme(dark);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { dark, setDark, reducedMotion };
}