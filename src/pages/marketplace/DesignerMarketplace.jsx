import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import ScrollReveal from "../../components/ScrollReveal";
import "../../styles/DesignerMarketplace.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const specializations = [
  "T-Shirts",
  "Formal Wear",
  "Casual Wear",
  "Ethnic Wear",
  "Streetwear",
  "Sustainable Fashion",
  "Kids Wear",
  "Hoodies",
];

const availabilityMeta = {
  available: {
    label: "Available now",
    className: "designer-card__status designer-card__status--available",
    icon: "fa-check-circle",
  },
  busy: {
    label: "Busy",
    className: "designer-card__status designer-card__status--busy",
    icon: "fa-clock",
  },
  not_accepting: {
    label: "Shop closed",
    className: "designer-card__status designer-card__status--closed",
    icon: "fa-store-slash",
  },
};

const DesignerMarketplace = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: "",
    minRating: "",
    maxPrice: "",
    available: false,
    sortBy: "rating",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDesigners: 0,
  });

  const fetchDesigners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...filters,
      });

      const response = await axios.get(
        `${API_URL}/api/marketplace/designers?${params}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setDesigners(response.data.designers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching designers:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    fetchDesigners();
  }, [fetchDesigners]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: "",
      minRating: "",
      maxPrice: "",
      available: false,
      sortBy: "rating",
      search: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="designer-marketplace marketplace-shell">
      <section className="marketplace-hero">
        <div className="container">
          <div className="row g-4 align-items-end">
            <div className="col-lg-7">
              <ScrollReveal className="marketplace-heading">
                <p className="directory-note">Designer directory</p>
                <h1>Find fashion designers by style, pace, and craft fit.</h1>
                <p>
                  Browse a more curated directory of specialists across
                  streetwear, formalwear, embroidery, sustainable fashion, and
                  custom clothing work.
                </p>
              </ScrollReveal>
            </div>

            <div className="col-lg-5">
              <ScrollReveal delay="delay-1">
                <div className="marketplace-search-panel">
                  <label className="marketplace-search-label" htmlFor="directorySearch">
                    Search designer directory
                  </label>
                  <div className="marketplace-search">
                    <i className="fas fa-search"></i>
                    <input
                      id="directorySearch"
                      type="text"
                      className="form-control"
                      placeholder="Search by name, skill, or specialization"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                  <p className="mt-3 mb-0">
                    Use filters for specialization, rating, availability, and
                    price range to narrow the directory.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3">
            <ScrollReveal delay="delay-1">
              <aside className="filters-panel">
                <div className="filters-panel__header">
                  <div>
                    <p className="directory-note mb-1">Filter</p>
                    <h2 className="h5 mb-0">Refine the list</h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link btn-sm"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="specialization">
                    Specialization
                  </label>
                  <select
                    id="specialization"
                    className="form-select"
                    value={filters.specialization}
                    onChange={(e) =>
                      handleFilterChange("specialization", e.target.value)
                    }
                  >
                    <option value="">All specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="rating">
                    Minimum rating
                  </label>
                  <select
                    id="rating"
                    className="form-select"
                    value={filters.minRating}
                    onChange={(e) =>
                      handleFilterChange("minRating", e.target.value)
                    }
                  >
                    <option value="">Any rating</option>
                    <option value="4.5">4.5 and above</option>
                    <option value="4.0">4.0 and above</option>
                    <option value="3.5">3.5 and above</option>
                    <option value="3.0">3.0 and above</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="price">
                    Max price
                  </label>
                  <select
                    id="price"
                    className="form-select"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  >
                    <option value="">Any price</option>
                    <option value="1000">Under ₹1,000</option>
                    <option value="2000">Under ₹2,000</option>
                    <option value="3000">Under ₹3,000</option>
                    <option value="5000">Under ₹5,000</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="sortBy">
                    Sort by
                  </label>
                  <select
                    id="sortBy"
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                  >
                    <option value="rating">Highest rated</option>
                    <option value="experience">Most experienced</option>
                    <option value="orders">Most orders</option>
                    <option value="price_low">Price: low to high</option>
                    <option value="price_high">Price: high to low</option>
                  </select>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="availableOnly"
                    checked={filters.available}
                    onChange={(e) =>
                      handleFilterChange("available", e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor="availableOnly">
                    Show only designers currently accepting briefs
                  </label>
                </div>
              </aside>
            </ScrollReveal>
          </div>

          <div className="col-lg-9">
            <div className="results-bar">
              <div>
                <h2>
                  {pagination.totalDesigners} designer
                  {pagination.totalDesigners !== 1 ? "s" : ""} found
                </h2>
                <p>
                  Browse by fit, turnaround, and garment specialization instead
                  of generic cards.
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner local message="Loading designer directory..." />
            ) : designers.length === 0 ? (
              <div className="marketplace-empty">
                <i className="fas fa-search fa-2x mb-3"></i>
                <h3>No designers match these filters</h3>
                <p>Clear or widen the filters to explore more profiles.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {designers.map((designer, index) => {
                    const availability =
                      availabilityMeta[
                        designer.availabilityStatus || "available"
                      ] || availabilityMeta.available;
                    const rating = designer.designerProfile?.rating || 0;
                    const reviewCount =
                      designer.designerProfile?.totalRatings || 0;
                    const avatar = (designer.name || designer.username || "D")
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <div key={designer._id} className="col-md-6 col-xl-4">
                        <ScrollReveal delay={`delay-${(index % 3) + 1}`}>
                          <article
                            className={`designer-card ${
                              designer.availabilityStatus === "not_accepting"
                                ? "designer-card--closed"
                                : ""
                            }`}
                          >
                            <div className={availability.className}>
                              <i className={`fas ${availability.icon}`}></i>
                              <span>{availability.label}</span>
                            </div>

                            <div className="designer-card__top">
                              <span className="designer-card__avatar">{avatar}</span>
                              <div className="designer-card__identity">
                                <h3>{designer.name}</h3>
                                <p>@{designer.username}</p>
                                <div className="designer-card__rating">
                                  <span className="designer-card__stars">
                                    {"★".repeat(Math.floor(rating))}
                                    {"☆".repeat(5 - Math.floor(rating))}
                                  </span>
                                  <strong>{rating.toFixed(1)}</strong>
                                  <small>({reviewCount})</small>
                                </div>
                              </div>
                            </div>

                            <p className="designer-card__bio">
                              {designer.bio?.substring(0, 120) ||
                                "Custom fashion designer with platform experience across made-to-order work."}
                              {designer.bio?.length > 120 ? "..." : ""}
                            </p>

                            <div className="designer-card__stats">
                              <div className="designer-card__stat">
                                <strong>{designer.completedOrders || 0}</strong>
                                <span>orders</span>
                              </div>
                              <div className="designer-card__stat">
                                <strong>{designer.turnaroundDays || 7}d</strong>
                                <span>turnaround</span>
                              </div>
                              <div className="designer-card__stat">
                                <strong>{designer.experience || 0}y</strong>
                                <span>experience</span>
                              </div>
                            </div>

                            <div className="designer-card__price">
                              <span>Typical price range</span>
                              <strong>
                                ₹{designer.priceRange?.min || 500} - ₹
                                {designer.priceRange?.max || 5000}
                              </strong>
                            </div>

                            {designer.specializations?.length > 0 && (
                              <div className="designer-card__tags">
                                {designer.specializations
                                  .slice(0, 3)
                                  .map((specialization) => (
                                    <span className="meta-chip" key={specialization}>
                                      {specialization}
                                    </span>
                                  ))}
                              </div>
                            )}

                            <Link
                              to={`/marketplace/designer/${designer._id}`}
                              className="btn btn-primary designer-card__action"
                            >
                              View profile
                            </Link>
                          </article>
                        </ScrollReveal>
                      </div>
                    );
                  })}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <nav aria-label="Designer directory pages">
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            pagination.currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage - 1,
                              }))
                            }
                            disabled={pagination.currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>

                        {[...Array(pagination.totalPages)].map((_, idx) => {
                          const pageNum = idx + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.totalPages ||
                            Math.abs(pageNum - pagination.currentPage) <= 1
                          ) {
                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${
                                  pagination.currentPage === pageNum
                                    ? "active"
                                    : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      currentPage: pageNum,
                                    }))
                                  }
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }

                          if (
                            pageNum === pagination.currentPage - 2 ||
                            pageNum === pagination.currentPage + 2
                          ) {
                            return (
                              <li key={pageNum} className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            );
                          }

                          return null;
                        })}

                        <li
                          className={`page-item ${
                            pagination.currentPage === pagination.totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage + 1,
                              }))
                            }
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerMarketplace;
