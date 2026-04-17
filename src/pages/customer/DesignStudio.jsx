import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { customerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useFlash } from "../../context/FlashContext";
import { useCartAnimation } from "../../hooks/useCartAnimation";
import ModelViewer from "../../components/ModelViewer";
import useExitConfirmation from "../../hooks/useExitConfirmation";
import ScrollReveal from "../../components/ScrollReveal";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const curatedSwatches = [
  { name: "Ivory", value: "#F5EFE6" },
  { name: "Sand", value: "#D7C4A5" },
  { name: "Slate", value: "#7E8A99" },
  { name: "Indigo", value: "#314B6B" },
  { name: "Olive", value: "#70735C" },
  { name: "Rust", value: "#A0553C" },
  { name: "Ink", value: "#1F1A17" },
  { name: "Chalk", value: "#FFFFFF" },
];

const fabricDescriptions = {
  Cotton: "Breathable, familiar, and easy to wear every day.",
  Linen: "Airy texture with a lighter, more artisanal drape.",
  Silk: "Sharper sheen and a more elevated finish.",
  Polyester: "More durable and lower cost for practical runs.",
  Wool: "Warmer hand-feel with stronger structure.",
  Denim: "Heavier, workwear-adjacent character with more weight.",
  Fleece: "Soft interior warmth for colder-weather pieces.",
  Jersey: "Stretch-friendly knit for relaxed comfort.",
};

const studioPanelTabs = [
  { id: "brief", label: "Brief", icon: "fa-pen-ruler" },
  { id: "material", label: "Material", icon: "fa-droplet" },
  { id: "graphic", label: "Graphic", icon: "fa-image" },
  { id: "text", label: "Text", icon: "fa-font" },
];

const DesignStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showFlash } = useFlash();
  const modelViewerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "T-Shirt",
    gender: "Men",
    fabric: "Cotton",
    color: "#ffffff",
    pattern: "Solid",
    size: "M",
    customText: "",
    customImage: "",
    graphic: "None",
    designerId: null,
  });

  const [submitting, setSubmitting] = useState(false);

  const { animateToCart } = useCartAnimation(() => {
    const cartBadge = document.getElementById("cart-badge");
    if (cartBadge) {
      cartBadge.classList.add("cart-badge-animate");
      setTimeout(() => cartBadge.classList.remove("cart-badge-animate"), 400);
    }
  });
  const [sustainabilityScore, setSustainabilityScore] = useState(50);
  const [estimatedPrice, setEstimatedPrice] = useState(1200);
  const [shakeError, setShakeError] = useState(false);
  const [graphics, setGraphics] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeStudioPanel, setActiveStudioPanel] = useState("brief");

  // Show exit confirmation only when user has made design changes
  useExitConfirmation(
    hasUnsavedChanges,
    "You have unsaved design changes. Are you sure you want to leave?",
  );

  // Fabric sustainability scores (matching EJS)
  const fabricScores = {
    Cotton: 75,
    Linen: 85,
    Silk: 65,
    Polyester: 40,
    Wool: 70,
    Denim: 60,
  };

  // Fabric price multipliers
  const fabricMultipliers = {
    Cotton: 1.0,
    Linen: 1.3,
    Silk: 2.0,
    Polyester: 0.8,
    Wool: 1.5,
    Denim: 1.2,
  };

  // Calculate sustainability score and price when fabric changes
  useEffect(() => {
    const score = fabricScores[formData.fabric] || 50;
    setSustainabilityScore(score);

    const basePrice = 1200;
    const multiplier = fabricMultipliers[formData.fabric] || 1.0;
    setEstimatedPrice(basePrice * multiplier);
  }, [formData.fabric]);

  useEffect(() => {
    if (!user) {
      showFlash("Please login to access Design Studio", "error");
      navigate("/login");
    }
  }, [user]);

  // Fetch graphics with stock status
  useEffect(() => {
    const fetchGraphics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/graphics/all`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setGraphics(response.data.graphics);
        }
      } catch (error) {
        console.error("Error fetching graphics:", error);
      }
    };
    fetchGraphics();
  }, []);

  // Set designer ID from URL if present
  useEffect(() => {
    const designerId = searchParams.get("designerId");
    if (designerId) {
      setFormData((prev) => ({ ...prev, designerId }));
    }
  }, [searchParams]);

  // Load design from URL if designId is present
  useEffect(() => {
    const loadDesign = async () => {
      const designId = searchParams.get("designId");
      if (designId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/customer/designs/${designId}`,
            { withCredentials: true },
          );
          if (response.data.success && response.data.design) {
            const design = response.data.design;
            setFormData((prev) => ({
              name: design.name || "",
              category: design.category || "T-Shirt",
              gender: design.gender || "Men",
              fabric: design.fabric || "Cotton",
              color: design.color || "#ffffff",
              pattern: design.pattern || "Solid",
              size: design.size || "M",
              customText: design.customText || "",
              customImage: design.customImage || "",
              graphic: design.graphic || "None",
              designerId: design.designerId || prev.designerId || null,
            }));
            showFlash("Design loaded successfully", "success");
          }
        } catch (error) {
          console.error("Error loading design:", error);
          showFlash("Failed to load design", "error");
        }
      }
    };
    loadDesign();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const handleReset = () => {
    // Reset to default values
    setFormData((prev) => ({
      ...prev,
      color: "#ffffff",
      graphic: "None",
    }));
    setHasUnsavedChanges(false); // Reset unsaved changes flag
  };

  const applyColorSwatch = (value) => {
    setFormData((prev) => ({ ...prev, color: value }));
    setHasUnsavedChanges(true);
  };

  const validateDesign = () => {
    // Validate design name first (before showing shake animation)
    if (!formData.name || formData.name.trim().length < 3) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      showFlash("Please enter a design name (minimum 3 characters)", "error");
      return false;
    }

    // Graphics are optional - user can proceed without selecting one
    // If name is provided, validation passes

    // Validate category
    if (!formData.category || formData.category === "") {
      showFlash("Please select a category", "error");
      return false;
    }

    // Validate fabric
    if (!formData.fabric || formData.fabric === "") {
      showFlash("Please select a fabric", "error");
      return false;
    }

    // Validate size
    if (!formData.size || formData.size === "") {
      showFlash("Please select a size", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();

    // Run validation
    if (!validateDesign()) {
      return;
    }

    try {
      setSubmitting(true);

      // Capture the 3D preview image
      let previewImage = null;
      if (modelViewerRef.current && modelViewerRef.current.capturePreview) {
        previewImage = modelViewerRef.current.capturePreview();
      }

      // Add sustainability score and price to form data
      const designData = {
        ...formData,
        estimatedPrice: estimatedPrice, // The calculated price based on fabric
        basePrice: 1200, // Base price before fabric multiplier
        sustainabilityScore: sustainabilityScore,
        formAction: action,
        previewImage: previewImage, // Include the 3D preview image
      };

      if (action === "save") {
        // Save design and place order
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          // Add to cart and navigate to checkout
          await customerAPI.addToCart({
            designId: saveResponse.data.design._id,
            quantity: 1,
            size: formData.size,
            color: formData.color,
          });
          setHasUnsavedChanges(false); // Clear unsaved changes
          showFlash("Design saved and added to cart!", "success");
          navigate("/customer/cart");
        } else {
          setHasUnsavedChanges(false); // Clear unsaved changes
          showFlash("Design saved successfully!", "success");
          navigate("/customer/dashboard");
        }
      } else if (action === "addToCart") {
        // First save the design, then add to cart
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          await customerAPI.addToCart({
            designId: saveResponse.data.design._id,
            quantity: 1,
            size: formData.size,
            color: formData.color,
          });

          // Trigger animation
          if (modelViewerRef.current) {
            const canvas = modelViewerRef.current.querySelector("canvas");
            if (canvas) {
              animateToCart(canvas);
            }
          }

          setHasUnsavedChanges(false); // Clear unsaved changes
          showFlash("Design added to cart!", "success");
        }
      } else if (action === "wishlist") {
        // First save the design, then add to wishlist
        const saveResponse = await customerAPI.saveDesign(designData);
        if (saveResponse.data.success && saveResponse.data.design) {
          await customerAPI.addToWishlist({
            designId: saveResponse.data.design._id,
          });
          setHasUnsavedChanges(false); // Clear unsaved changes
          showFlash("Design added to wishlist!", "success");
          navigate("/customer/dashboard");
        }
      }
    } catch (error) {
      showFlash(
        error.response?.data?.message || "Failed to save design",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="studio-shell">
      <ScrollReveal className="studio-intro">
        <section className="studio-intro-card">
          <p className="editorial-kicker">Design studio</p>
          <h1>Build your garment in a simple, guided studio.</h1>
          <p>
            Set the garment basics first, then fine-tune color, artwork, and
            text while the 3D preview stays in view.
          </p>

          <div className="studio-note-grid">
            <article className="studio-note">
              <strong>Start with essentials</strong>
              <span>Category, size, and fabric should stay easy to compare.</span>
            </article>
            <article className="studio-note">
              <strong>Preview clearly</strong>
              <span>Check the garment shape without bulky visual distraction.</span>
            </article>
            <article className="studio-note">
              <strong>Save when ready</strong>
              <span>Move the current setup to order, cart, or wishlist anytime.</span>
            </article>
          </div>
        </section>
      </ScrollReveal>

      <div className="row g-4 studio-workspace">
        <div className="col-xl-7">
          <ScrollReveal delay="delay-1">
            <div className={`card studio-form-card ${shakeError ? "shake-animation" : ""}`}>
              <div className="card-body">
                <form className="studio-form" onSubmit={(e) => handleSubmit(e, "save")}>
                  <div className="studio-panel-switcher" role="tablist" aria-label="Design controls">
                    {studioPanelTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`studio-panel-tab ${
                          activeStudioPanel === tab.id ? "is-active" : ""
                        }`}
                        role="tab"
                        aria-selected={activeStudioPanel === tab.id}
                        onClick={() => setActiveStudioPanel(tab.id)}
                      >
                        <i className={`fas ${tab.icon}`}></i>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {activeStudioPanel === "brief" && (
                    <section className="studio-fieldset" aria-labelledby="studio-brief-title">
                      <div className="studio-fieldset__header">
                        <h2 id="studio-brief-title">Design brief</h2>
                        <p>Name the piece and set the garment foundation first.</p>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Design name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Example: Indigo studio hoodie"
                          required
                        />
                      </div>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <label htmlFor="category" className="form-label">
                            Category
                          </label>
                          <select
                            className="form-select"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                          >
                            <option value="T-Shirt">T-Shirt</option>
                            <option value="Hoodie">Hoodie</option>
                            <option value="Kurthi">Kurthi</option>
                            <option value="Dress">Dress</option>
                            <option value="Jeans">Jeans</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="gender" className="form-label">
                            Gender
                          </label>
                          <select
                            className="form-select"
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                          >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Unisex">Unisex</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="size" className="form-label">
                            Size
                          </label>
                          <select
                            className="form-select"
                            id="size"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            required
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>
                      </div>
                    </section>
                  )}

                  {activeStudioPanel === "material" && (
                    <section className="studio-fieldset" aria-labelledby="studio-material-title">
                      <div className="studio-fieldset__header">
                        <h2 id="studio-material-title">Material and finish</h2>
                        <p>Choose fabric, color, and pattern with the final hand-feel in mind.</p>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <label htmlFor="fabric" className="form-label">
                            Fabric
                          </label>
                          <select
                            className="form-select"
                            id="fabric"
                            name="fabric"
                            value={formData.fabric}
                            onChange={handleChange}
                            required
                          >
                            <option value="Cotton">Cotton</option>
                            <option value="Linen">Linen</option>
                            <option value="Silk">Silk</option>
                            <option value="Polyester">Polyester</option>
                            <option value="Wool">Wool</option>
                            <option value="Denim">Denim</option>
                            <option value="Fleece">Fleece</option>
                            <option value="Jersey">Jersey</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="pattern" className="form-label">
                            Pattern
                          </label>
                          <select
                            className="form-select"
                            id="pattern"
                            name="pattern"
                            value={formData.pattern}
                            onChange={handleChange}
                          >
                            <option value="Solid">Solid</option>
                            <option value="Striped">Striped</option>
                            <option value="Checkered">Checkered</option>
                            <option value="Floral">Floral</option>
                            <option value="Abstract">Abstract</option>
                            <option value="Polka Dot">Polka Dot</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="color" className="form-label">
                            Base color
                          </label>
                          <div className="studio-color-row">
                            <input
                              type="color"
                              className="form-control form-control-color studio-color-input"
                              id="color"
                              name="color"
                              value={formData.color}
                              onChange={handleChange}
                            />
                            <span className="meta-chip">{formData.color}</span>
                          </div>
                        </div>
                      </div>

                      <div className="studio-swatch-grid">
                        {curatedSwatches.map((swatch) => (
                          <div key={swatch.value} className="studio-swatch-option">
                            <button
                              type="button"
                              className={`studio-swatch ${
                                formData.color.toLowerCase() === swatch.value.toLowerCase()
                                  ? "is-selected"
                                  : ""
                              }`}
                              onClick={() => applyColorSwatch(swatch.value)}
                              style={{ "--swatch-color": swatch.value }}
                              title={swatch.name}
                              aria-label={`Select ${swatch.name}`}
                              aria-pressed={formData.color.toLowerCase() === swatch.value.toLowerCase()}
                            ></button>
                            <span>{swatch.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="studio-material-note">
                        <strong>{formData.fabric}</strong>
                        <p className="mb-0">
                          {fabricDescriptions[formData.fabric] ||
                            "Material details will update here."}
                        </p>
                      </div>
                    </section>
                  )}

                  {activeStudioPanel === "graphic" && (
                    <section className="studio-fieldset" aria-labelledby="studio-graphic-title">
                      <div className="studio-fieldset__header">
                        <h2 id="studio-graphic-title">Graphic placement</h2>
                        <p>Select artwork only if it adds to the garment. None is a valid choice.</p>
                      </div>

                      <div className="studio-graphic-grid">
                        <div className="form-check p-0 m-0">
                          <input
                            className="form-check-input d-none"
                            type="radio"
                            name="graphic"
                            id="graphicNone"
                            value="None"
                            checked={formData.graphic === "None"}
                            onChange={handleChange}
                          />
                          <label
                            className={`studio-graphic-tile ${
                              formData.graphic === "None" ? "is-selected" : ""
                            }`}
                            htmlFor="graphicNone"
                          >
                            <div className="d-flex align-items-center justify-content-center h-100 py-4">
                              <span className="studio-graphic-name">No artwork</span>
                            </div>
                          </label>
                        </div>

                        {graphics.map((graphic) => {
                          const isOutOfStock = graphic.inStock === false;
                          return (
                            <div key={graphic._id} className="form-check p-0 m-0">
                              <input
                                className="form-check-input d-none"
                                type="radio"
                                name="graphic"
                                id={`graphic${graphic._id}`}
                                value={graphic.filename}
                                checked={formData.graphic === graphic.filename}
                                onChange={handleChange}
                                disabled={isOutOfStock}
                              />
                              <label
                                className={`studio-graphic-tile ${
                                  formData.graphic === graphic.filename
                                    ? "is-selected"
                                    : ""
                                } ${isOutOfStock ? "is-disabled" : ""}`}
                                htmlFor={`graphic${graphic._id}`}
                              >
                                <img
                                  src={`${API_BASE_URL}${graphic.graphic}`}
                                  alt={graphic.name}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <span className="studio-graphic-name">
                                  {graphic.name || graphic.filename}
                                </span>
                                {isOutOfStock && (
                                  <span className="studio-graphic-badge">
                                    Out of stock
                                  </span>
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {activeStudioPanel === "text" && (
                    <section className="studio-fieldset" aria-labelledby="studio-text-title">
                      <div className="studio-fieldset__header">
                        <h2 id="studio-text-title">Custom text</h2>
                        <p>Use a short line for names, teamwear, or a simple front statement.</p>
                      </div>

                      <label htmlFor="customText" className="form-label">
                        Text note
                      </label>
                      <textarea
                        className="form-control"
                        id="customText"
                        name="customText"
                        value={formData.customText}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Add custom text to your design..."
                      />
                    </section>
                  )}

                  <div className="studio-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => handleSubmit(e, "save")}
                      disabled={submitting}
                    >
                      <i className="fas fa-save me-2"></i>
                      {submitting ? "Saving..." : "Save and place order"}
                    </button>
                    <button
                      type="button"
                      id="tour-add-to-cart"
                      className="btn btn-success"
                      onClick={(e) => handleSubmit(e, "addToCart")}
                      disabled={submitting}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      Add to cart
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={(e) => handleSubmit(e, "wishlist")}
                      disabled={submitting}
                    >
                      <i className="fas fa-heart me-2"></i>
                      Save to wishlist
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="col-xl-5 studio-preview-column">
          <ScrollReveal delay="delay-2">
            <div className="card studio-preview-card" id="tour-3d-preview">
              <div className="card-body">
                <p className="editorial-kicker mb-1">Live preview</p>
                <h2>3D preview</h2>
                <p className="mb-3">
                  Rotate and review the garment before sending it to cart or order.
                </p>

                <ModelViewer
                  ref={modelViewerRef}
                  category={formData.category}
                  gender={formData.gender}
                  color={formData.color}
                  graphic={formData.graphic}
                  sceneBackground="#0f172a"
                  stageColor="#182338"
                  stageRingColor="#38bdf8"
                  onReset={handleReset}
                />

                {formData.customText && (
                  <div className="studio-preview-caption">
                    <strong>Text note</strong>
                    <p className="mb-0">{formData.customText}</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay="delay-3">
            <div className="card studio-meta-card mt-4">
              <div className="card-body">
                <div className="studio-metric-panel studio-metric-panel--price">
                  <span className="studio-metric-panel__icon">
                    <i className="fas fa-indian-rupee-sign"></i>
                  </span>
                  <div>
                    <p className="editorial-kicker mb-1">Estimated price</p>
                    <h3>₹{estimatedPrice.toFixed(2)}</h3>
                    <small>Fabric selection is the biggest price driver.</small>
                  </div>
                </div>

                <div className="studio-metric-panel studio-metric-panel--sustainability">
                  <span className="studio-metric-panel__icon">
                    <i className="fas fa-leaf"></i>
                  </span>
                  <div>
                    <p className="editorial-kicker mb-1">Sustainability score</p>
                    <strong>{sustainabilityScore}/100</strong>
                    <div className="studio-progress" aria-hidden="true">
                      <div
                        className="studio-progress__bar"
                        style={{
                          width: `${sustainabilityScore}%`,
                          backgroundColor:
                            sustainabilityScore >= 70
                              ? "#5F745B"
                              : sustainabilityScore >= 50
                                ? "#B07D2E"
                                : "#A34734",
                        }}
                      ></div>
                    </div>
                    <small>
                      {sustainabilityScore >= 70
                        ? "Excellent eco-friendly choice."
                        : sustainabilityScore >= 50
                          ? "Good sustainable option."
                          : "Consider a more sustainable fabric."}
                    </small>
                  </div>
                </div>

                <dl className="studio-summary-list">
                  <div className="studio-summary-row">
                    <dt>Category</dt>
                    <dd>{formData.category}</dd>
                  </div>
                  <div className="studio-summary-row">
                    <dt>Fabric</dt>
                    <dd>{formData.fabric}</dd>
                  </div>
                  <div className="studio-summary-row">
                    <dt>Color</dt>
                    <dd className="studio-summary-color">
                      <span
                        className="studio-summary-color__swatch"
                        style={{ backgroundColor: formData.color }}
                        aria-hidden="true"
                      ></span>
                      {formData.color}
                    </dd>
                  </div>
                  <div className="studio-summary-row">
                    <dt>Pattern</dt>
                    <dd>{formData.pattern}</dd>
                  </div>
                  <div className="studio-summary-row">
                    <dt>Size</dt>
                    <dd>{formData.size}</dd>
                  </div>
                  <div className="studio-summary-row">
                    <dt>Graphic</dt>
                    <dd>{formData.graphic}</dd>
                  </div>
                  {formData.designerId && (
                    <div className="studio-summary-row">
                      <dt>Designer</dt>
                      <dd>Preselected from marketplace</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
