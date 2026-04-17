import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Joyride, { STATUS } from "react-joyride";
import { useAuth } from "../context/AuthContext";
import "./OnboardingTour.css";

const CustomTooltip = ({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div className="modern-tour-card" {...tooltipProps}>
      {step.title && <h3 className="tour-title">{step.title}</h3>}
      <div className="tour-content">{step.content}</div>

      <div className="tour-footer">
        <div className="tour-progress">
          Step {index + 1} of {size}
        </div>
        <div className="tour-controls">
          {index > 0 && (
            <button className="tour-btn tour-btn-back" {...backProps}>
              Back
            </button>
          )}
          {continuous && (
            <button className="tour-btn tour-btn-next" {...primaryProps}>
              {index === size - 1 ? "Finish 🚀" : "Next ⚡"}
            </button>
          )}
          {!continuous && (
            <button className="tour-btn tour-btn-next" {...closeProps}>
              Got it!
            </button>
          )}
        </div>
      </div>
      
      {!continuous && (
        <button className="tour-close-x" {...closeProps}>
          &times;
        </button>
      )}
      {continuous && index === 0 && (
         <button className="tour-close-x" {...skipProps}>
          &times;
        </button>
      )}
    </div>
  );
};

const OnboardingTour = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const isNewSignup = localStorage.getItem("isNewSignup");
    // Ensure the tour ONLY runs if the user is authenticated, is a customer, and is a new signup
    if (isNewSignup === "true" && user && user.role === "customer") {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.removeItem("isNewSignup");
      setStepIndex(0);
    } else if (type === "step:after" || type === "error") {
      const nextStepIndex = index + (action === "prev" ? -1 : 1);

      // Mid-tour navigation logic
      if (index === 3 && action === "next") {
        navigate("/customer/design-studio");
        setTimeout(() => setStepIndex(nextStepIndex), 600); // Wait for page render
      } else if (index === 4 && action === "prev") {
        navigate("/");
        setTimeout(() => setStepIndex(nextStepIndex), 600);
      } else {
        setStepIndex(nextStepIndex);
      }
    }
  };

  const steps = [
    {
      target: "body",
      content: (
        <div className="text-center">
          <div className="mb-3 text-4xl">👋</div>
          <h4 className="mb-2" style={{ color: "#314b6b", fontWeight: 800 }}>Welcome to DesignDen!</h4>
          <p>Let's take a quick tour to show you how to navigate our premium custom clothing marketplace.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: 'a[href="/marketplace"]',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Browse Talented Designers</h5>
          <p>Explore our curated list of expert freelance fashion designers. You can view their portfolios and hire them directly to craft unique pieces for you.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: 'a[href="/shop"]',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>The Marketplace Shop</h5>
          <p>Discover ready-to-wear pieces designed by top-tier creators on the platform. Or create your own...</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: 'a[href="/customer/design-studio"], a[href="/design-studio"]',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Interactive Design Studio</h5>
          <p>Click Next to visit our interactive 3D studio, where you can customize your own clothing effortlessly.</p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: 'select[name="category"]',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Select Your Style</h5>
          <p>Start your design process here. Choose your preferred fabric, style, and size from our extensive collection.</p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: '#tour-3d-preview',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Real-Time 3D Preview</h5>
          <p>Rotate and zoom the 3D model to see exactly how your custom design will look before you make a purchase.</p>
        </div>
      ),
      placement: "left",
      disableBeacon: true,
    },
    {
      target: '#tour-add-to-cart',
      content: (
        <div>
          <h5 style={{ fontWeight: 800, fontSize: "1.1rem" }}>Add to Cart</h5>
          <p>Once you are fully satisfied with your design, simply add it to your cart. You are now ready to place your first order!</p>
        </div>
      ),
      placement: "top",
      disableBeacon: true,
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      showProgress={false}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: "rgba(31, 26, 23, 0.22)",
        },
      }}
    />
  );
};

export default OnboardingTour;
