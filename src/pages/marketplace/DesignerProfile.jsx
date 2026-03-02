import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/DesignerMarketplace.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const DesignerProfile = () => {
  const { designerId } = useParams();
  const [designer, setDesigner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  console.log("=== DESIGNER PROFILE ===");
  console.log("Designer ID from URL params:", designerId);
  console.log("Type:", typeof designerId);
  console.log("========================");

  const fetchDesignerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/api/marketplace/designers/${designerId}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        const designerData = response.data.designer;
        setDesigner(designerData);
        // Reviews are included in the designer object
        setReviews(designerData.reviews || []);
        setStats(response.data.stats || null);
      } else {
        setError("Failed to load designer profile");
      }
    } catch (err) {
      console.error("Error fetching designer profile:", err);
      setError(err.message || "Failed to load designer profile");
    } finally {
      setLoading(false);
    }
  }, [designerId]);

  useEffect(() => {
    fetchDesignerProfile();
  }, [fetchDesignerProfile]);

  if (loading) {
    return (
      <LoadingSpinner local={true} message="Loading designer profile..." />
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/marketplace" className="btn btn-primary mt-3">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="container text-center py-5">
        <h3>Designer not found</h3>
        <Link to="/marketplace" className="btn btn-primary mt-3">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  // Use flattened designer object directly (API returns flattened data)
  const profile = designer;

  return (
    <div className="designer-profile">
      {/* Hero Section */}
      <div className="designer-profile-hero">
        <div className="container text-center">
          <div className="profile-avatar">
            <i className="fas fa-user"></i>
          </div>
          <h1 className="display-5 fw-bold mb-2">{designer.name}</h1>
          <p className="lead mb-3">@{designer.username}</p>

          {/* Rating */}
          <div className="rating mb-3">
            <span className="text-warning fs-4">
              {"★".repeat(Math.floor(profile.rating || 0))}
              {"☆".repeat(5 - Math.floor(profile.rating || 0))}
            </span>
            <span className="ms-2 fs-5 fw-bold">
              {profile.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="ms-1">({profile.totalRatings || 0} reviews)</span>
          </div>

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="badges mb-3">
              {profile.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="badge bg-light text-dark me-2 px-3 py-2"
                >
                  <i className="fas fa-award me-1"></i>
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Availability */}
          <div className="mb-4">
            {profile.availabilityStatus === "available" && (
              <span className="badge bg-success fs-6 px-4 py-2">
                <i className="fas fa-check-circle me-2"></i>
                Available for Designs
              </span>
            )}
            {profile.availabilityStatus === "busy" && (
              <span className="badge bg-warning text-dark fs-6 px-4 py-2">
                <i className="fas fa-clock me-2"></i>
                Currently Busy
              </span>
            )}
            {profile.availabilityStatus === "not_accepting" && (
              <span className="badge bg-secondary fs-6 px-4 py-2">
                <i className="fas fa-ban me-2"></i>
                Shop Closed
              </span>
            )}
            {!profile.availabilityStatus &&
              (profile.isAvailable ? (
                <span className="badge bg-success fs-6 px-4 py-2">
                  <i className="fas fa-check-circle me-2"></i>
                  Available for Designs
                </span>
              ) : (
                <span className="badge bg-secondary fs-6 px-4 py-2">
                  <i className="fas fa-clock me-2"></i>
                  Currently Busy
                </span>
              ))}
          </div>

          <Link
            to={`/customer/design-studio?designerId=${designerId}`}
            className={`btn btn-light btn-lg px-5 ${
              profile.availabilityStatus === "not_accepting" ? "disabled" : ""
            }`}
            onClick={(e) => {
              if (profile.availabilityStatus === "not_accepting") {
                e.preventDefault();
              }
            }}
            title={
              profile.availabilityStatus === "not_accepting"
                ? "This designer's shop is currently closed"
                : "Start a new design with this designer"
            }
          >
            <i className="fas fa-paper-plane me-2"></i>
            Start a Design
            {profile.availabilityStatus === "not_accepting" && (
              <i className="fas fa-lock ms-2"></i>
            )}
          </Link>
          {profile.availabilityStatus === "not_accepting" && (
            <p className="text-muted mt-3 mb-0">
              <i className="fas fa-info-circle me-2"></i>
              This designer is not accepting new designs at the moment
            </p>
          )}
        </div>
      </div>

      <div className="container my-5">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* About */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h3 className="card-title mb-3">
                  <i className="fas fa-user-circle text-primary me-2"></i>
                  About
                </h3>
                <p className="card-text">
                  {profile.bio || "No bio available."}
                </p>
              </div>
            </div>

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h3 className="card-title mb-4">
                    <i className="fas fa-images text-primary me-2"></i>
                    Portfolio
                  </h3>
                  <div className="row g-3">
                    {profile.portfolio.map((item, idx) => (
                      <div key={idx} className="col-md-6 col-lg-4">
                        <div
                          className="portfolio-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedPortfolioItem(item);
                            setShowPortfolioModal(true);
                          }}
                        >
                          <img
                            src={`${API_URL}${
                              item.image ||
                              item.imageUrl ||
                              "/images/casual-tshirt.jpeg"
                            }`}
                            alt={item.title}
                            className="img-fluid"
                            onError={(e) => {
                              if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = "true";
                                e.target.src = `${API_URL}/images/casual-tshirt.jpeg`;
                              }
                            }}
                          />
                          <div className="p-3">
                            <h6 className="mb-1">{item.title}</h6>
                            {item.description && (
                              <p className="text-muted small mb-0">
                                {item.description}
                              </p>
                            )}
                            {item.category && (
                              <span className="badge bg-light text-dark mt-2">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="card-title mb-4">
                  <i className="fas fa-star text-primary me-2"></i>
                  Reviews ({reviews.length})
                </h3>

                {stats && stats.totalReviews > 0 && (
                  <div className="row mb-4">
                    <div className="col-md-3 col-6 text-center mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="mb-1">{stats.avgQuality?.toFixed(1)}</h4>
                        <p className="text-muted small mb-0">Quality</p>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 text-center mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="mb-1">
                          {stats.avgCommunication?.toFixed(1)}
                        </h4>
                        <p className="text-muted small mb-0">Communication</p>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 text-center mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="mb-1">
                          {stats.avgTimeliness?.toFixed(1)}
                        </h4>
                        <p className="text-muted small mb-0">Timeliness</p>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 text-center mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="mb-1">
                          {stats.recommendationRate?.toFixed(0)}%
                        </h4>
                        <p className="text-muted small mb-0">Recommend</p>
                      </div>
                    </div>
                  </div>
                )}

                {reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div key={idx} className="review-card">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">
                            {review.customerId?.name || "Customer"}
                          </h6>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="review-rating">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="mb-2">{review.comment}</p>
                      {review.wouldRecommend && (
                        <span className="badge bg-success">
                          <i className="fas fa-thumbs-up me-1"></i>
                          Would Recommend
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-4">
                    No reviews yet. Be the first to work with this designer!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Stats */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Quick Stats</h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between">
                    <span>
                      <i className="fas fa-briefcase text-primary me-2"></i>
                      Completed Orders
                    </span>
                    <strong>{profile.completedOrders || 0}</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <span>
                      <i className="fas fa-medal text-primary me-2"></i>
                      Experience
                    </span>
                    <strong>{profile.experience || 0} years</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <span>
                      <i className="fas fa-clock text-primary me-2"></i>
                      Turnaround
                    </span>
                    <strong>{profile.turnaroundDays || 7} days</strong>
                  </div>
                  <div className="list-group-item d-flex justify-content-between">
                    <span>
                      <i className="fas fa-rupee-sign text-primary me-2"></i>
                      Price Range
                    </span>
                    <strong>
                      ₹{profile.priceRange?.min || 500} - ₹
                      {profile.priceRange?.max || 5000}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {profile.specializations?.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Specializations</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {profile.specializations.map((spec, idx) => (
                      <span key={idx} className="badge bg-primary">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Get in Touch</h5>
                <p className="small text-muted mb-3">
                  {profile.availabilityStatus === "not_accepting"
                    ? "This designer is not accepting new designs at the moment."
                    : "Ready to start your design? Create a design and we'll connect you!"}
                </p>
                <Link
                  to="/customer/design-studio"
                  className={`btn btn-primary w-100 mb-2 ${
                    profile.availabilityStatus === "not_accepting"
                      ? "disabled"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (profile.availabilityStatus === "not_accepting") {
                      e.preventDefault();
                    }
                  }}
                  title={
                    profile.availabilityStatus === "not_accepting"
                      ? "This designer's shop is currently closed"
                      : "Start a new design"
                  }
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Start a Design
                  {profile.availabilityStatus === "not_accepting" && (
                    <i className="fas fa-lock ms-2"></i>
                  )}
                </Link>
                <Link
                  to="/marketplace"
                  className="btn btn-outline-secondary w-100"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Image Viewer Modal */}
      {showPortfolioModal && selectedPortfolioItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999 }}
          onClick={() => setShowPortfolioModal(false)}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div
              className="modal-content bg-dark text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header border-secondary">
                <h5 className="modal-title">
                  <i className="fas fa-image me-2"></i>
                  {selectedPortfolioItem.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPortfolioModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={`${API_URL}${
                    selectedPortfolioItem.image ||
                    selectedPortfolioItem.imageUrl ||
                    "/images/casual-tshirt.jpeg"
                  }`}
                  alt={selectedPortfolioItem.title}
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = "true";
                      e.target.src = `${API_URL}/images/casual-tshirt.jpeg`;
                    }
                  }}
                />
                <div className="text-start">
                  {selectedPortfolioItem.category && (
                    <div className="mb-3">
                      <span className="badge bg-primary fs-6">
                        {selectedPortfolioItem.category}
                      </span>
                    </div>
                  )}
                  {selectedPortfolioItem.description && (
                    <div>
                      <h6 className="text-muted">Description:</h6>
                      <p className="fs-6">
                        {selectedPortfolioItem.description}
                      </p>
                    </div>
                  )}
                  {selectedPortfolioItem.createdAt && (
                    <div className="text-muted small">
                      <i className="fas fa-calendar me-1"></i>
                      Added on{" "}
                      {new Date(
                        selectedPortfolioItem.createdAt,
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPortfolioModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerProfile;
