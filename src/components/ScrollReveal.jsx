import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const ScrollReveal = ({ children, delay = "", className = "" }) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? `fade-in-up ${delay}` : 'opacity-0'}`}
      style={{ transitionDuration: '0.8s' }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
