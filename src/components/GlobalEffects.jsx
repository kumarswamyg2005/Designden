import { useEffect } from 'react';

/**
 * GlobalEffects — zero-render side-effect component.
 *
 * Handles:
 *   1. Scroll-driven CSS custom property `--scroll-y`
 */
const GlobalEffects = () => {
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', y);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
};

export default GlobalEffects;
