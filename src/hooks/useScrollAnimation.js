import { useEffect, useRef, useState } from 'react';

// Usage: const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
export const useScrollAnimation = (options = { threshold: 0.1, triggerOnce: true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Update our state when observer callback fires
      if (entry.isIntersecting) {
        setIsVisible(true);
        // If triggerOnce is true (default), unobserve after first intersection
        if (options.triggerOnce && domRef.current) {
          observer.unobserve(domRef.current);
        }
      } else if (!options.triggerOnce) {
        setIsVisible(false);
      }
    }, options);

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return [domRef, isVisible];
};

export default useScrollAnimation;
