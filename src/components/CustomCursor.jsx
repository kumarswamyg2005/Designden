import { useEffect, useRef } from 'react';

/**
 * Custom Cursor — elegant dot + trailing ring.
 * Only activates on pointer devices (not touch screens).
 * Rings follows mouse with smooth lerp (linear interpolation).
 */
const CustomCursor = () => {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Don't activate on touch / no-hover devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Add class to body so CSS hides default cursor
    document.body.classList.add('custom-cursor');

    // Start offscreen so they don't flash at (0,0)
    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;
    let rafId;

    // Dot follows mouse immediately
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot: 6px wide, offset by 3px to center
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    };

    // Ring lerps toward dot each frame
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      // Ring: 36px wide, offset by 18px to center
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      rafId = requestAnimationFrame(animateRing);
    };

    // Expand ring + glow dot when over interactive elements
    const onMouseOver = (e) => {
      const isInteractive = e.target.closest(
        'a, button, .btn, .card, [role="button"], .hover-tilt, .nav-link, .dropdown-item, label, input[type="submit"], input[type="button"]'
      );
      if (isInteractive) {
        dot.classList.add('cursor-hover');
        ring.classList.add('cursor-hover');
      } else {
        dot.classList.remove('cursor-hover');
        ring.classList.remove('cursor-hover');
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    rafId = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafId);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
