import { useEffect, useState } from 'react';

/**
 * PageLoader — thin gradient progress bar at the top of the screen.
 * Animates from 0 → 100% on first mount, then fades out.
 * Purely cosmetic, does not gate any content.
 */
const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [fading,   setFading]   = useState(false);
  const [gone,     setGone]     = useState(false);

  useEffect(() => {
    // Staged progress to mimic a real async load feel
    const t1 = setTimeout(() => setProgress(38),  80);
    const t2 = setTimeout(() => setProgress(65),  380);
    const t3 = setTimeout(() => setProgress(88),  720);
    const t4 = setTimeout(() => setProgress(100), 1050);
    const t5 = setTimeout(() => setFading(true),  1150);
    const t6 = setTimeout(() => setGone(true),    1600);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  if (gone) return null;

  return (
    <div className={`page-loader${fading ? ' page-loader--done' : ''}`}>
      <div className="page-loader__bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default PageLoader;
