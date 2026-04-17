import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LogoutConfirmModal from "./LogoutConfirmModal";
import EditProfileModal from "./EditProfileModal";

const Header = () => {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isCustomer,
    isDesigner,
    isManager,
    isAdmin,
    isDelivery,
    logout,
  } = useAuth();
  const { cartCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardPath = useMemo(() => {
    if (isCustomer) return "/customer/dashboard";
    if (isDesigner) return "/designer/dashboard";
    if (isManager) return "/manager/dashboard";
    if (isAdmin) return "/admin/dashboard";
    if (isDelivery) return "/delivery/dashboard";
    return "/";
  }, [isAdmin, isCustomer, isDelivery, isDesigner, isManager]);

  const avatarLetter = (user?.name || user?.username || "D")
    .charAt(0)
    .toUpperCase();

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg editorial-navbar">
      <div className="container editorial-navbar__inner">
        <Link className="navbar-brand editorial-brand" to="/">
          <span className="editorial-brand__mark">DD</span>
          <span className="editorial-brand__text">
            <span>DesignDen</span>
            <small>Custom clothing atelier</small>
          </span>
        </Link>

        <button
          className="navbar-toggler editorial-navbar__toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav editorial-nav">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/", true) ? "active" : ""}`} to="/">
                Home
              </Link>
            </li>

            {!isDesigner && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/marketplace") ? "active" : ""}`}
                  to="/marketplace"
                >
                  Designers
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/shop") ? "active" : ""}`}
                to="/shop"
              >
                Shop
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${
                          isActive("/customer/design-studio") ? "active" : ""
                        }`}
                        to="/customer/design-studio"
                      >
                        Design Studio
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${
                          isActive("/customer/dashboard") ? "active" : ""
                        }`}
                        to="/customer/dashboard"
                      >
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}

                {isDesigner && (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${
                          isActive("/designer/dashboard") ? "active" : ""
                        }`}
                        to="/designer/dashboard"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${
                          isActive("/designer/earnings") ? "active" : ""
                        }`}
                        to="/designer/earnings"
                      >
                        Earnings
                      </Link>
                    </li>
                  </>
                )}

                {isManager && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        isActive("/manager/dashboard") ? "active" : ""
                      }`}
                      to="/manager/dashboard"
                    >
                      Manager
                    </Link>
                  </li>
                )}

                {isDelivery && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        isActive("/delivery/dashboard") ? "active" : ""
                      }`}
                      to="/delivery/dashboard"
                    >
                      Deliveries
                    </Link>
                  </li>
                )}

                {isAdmin && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        isActive("/admin/dashboard") ? "active" : ""
                      }`}
                      to="/admin/dashboard"
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/customer/design-studio") ? "active" : ""
                  }`}
                  to="/customer/design-studio"
                >
                  Design Studio
                </Link>
              </li>
            )}
          </ul>

          <div className="editorial-nav__actions">
            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <Link className="btn btn-light btn-sm" to="/customer/cart">
                    Cart
                    {cartCount > 0 && (
                      <span id="cart-badge" className="meta-chip ms-2">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="editorial-user-menu" ref={dropdownRef}>
                  <button
                    type="button"
                    className="btn editorial-avatar-button"
                    aria-expanded={showUserMenu}
                    onClick={() => setShowUserMenu((prev) => !prev)}
                  >
                    <span className="editorial-avatar">{avatarLetter}</span>
                    <span className="editorial-avatar-meta d-none d-lg-flex">
                      <strong>{user?.name || user?.username}</strong>
                      <small>{user?.email}</small>
                    </span>
                    <i className="fas fa-chevron-down"></i>
                  </button>

                  {showUserMenu && (
                    <div className="editorial-menu">
                      <div className="editorial-menu__header">
                        <strong>{user?.name || user?.username}</strong>
                        <span>{user?.email}</span>
                        <small>Manage your orders, studio drafts, and account.</small>
                      </div>

                      <Link
                        to={dashboardPath}
                        className="editorial-menu__item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-compass"></i>
                        <span>Go to dashboard</span>
                      </Link>

                      <button
                        type="button"
                        className="editorial-menu__item"
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowEditProfile(true);
                        }}
                      >
                        <i className="fas fa-user-pen"></i>
                        <span>Edit profile</span>
                      </button>

                      <Link
                        to="/security"
                        className="editorial-menu__item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-shield-halved"></i>
                        <span>Security settings</span>
                      </Link>

                      <Link
                        to="/help"
                        className="editorial-menu__item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <i className="fas fa-circle-question"></i>
                        <span>Help and support</span>
                      </Link>

                      <div className="editorial-menu__divider"></div>

                      <button
                        type="button"
                        className="editorial-menu__item editorial-menu__item--danger"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="editorial-auth-actions">
                <Link className="btn btn-outline-primary btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/signup">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        userName={user?.name || user?.username || "User"}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={() => {}}
      />
    </nav>
  );
};

export default Header;
