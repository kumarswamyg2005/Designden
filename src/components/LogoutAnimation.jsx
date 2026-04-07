import { useEffect, useState, useRef } from "react";
import "./LogoutAnimation.css";

const LogoutAnimation = ({ isVisible, onComplete, userName: _userName = "User" }) => {
  const [phase, setPhase] = useState(0);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      wasVisibleRef.current = true; // eslint-disable-next-line
      setPhase(0);

      // Clean, simple, ultra-modern sequence
      const t1 = setTimeout(() => setPhase(1), 50);    // Fade in blur
      const t2 = setTimeout(() => setPhase(2), 300);   // Show box + spinner
      const t3 = setTimeout(() => setPhase(3), 1500);  // Show checkmark
      const t4 = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else if (!isVisible && wasVisibleRef.current) {
      wasVisibleRef.current = false;
      const resetTimer = setTimeout(() => setPhase(0), 100);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`clean-logout-overlay ${phase >= 1 ? "active" : ""}`}>
      <div className={`clean-logout-box ${phase >= 2 ? "show" : ""}`}>
        
        <div className="clean-icon-area">
          {phase < 3 ? (
            <div className="clean-spinner">
              <svg viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
              </svg>
            </div>
          ) : (
            <div className="clean-check-wrapper show">
              <svg className="clean-check" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="clean-text-area">
          <h3>{phase < 3 ? "Signing Out" : "Done"}</h3>
          <p>{phase < 3 ? "See you next time..." : "Securely logged out."}</p>
        </div>

      </div>
    </div>
  );
};

export default LogoutAnimation;
