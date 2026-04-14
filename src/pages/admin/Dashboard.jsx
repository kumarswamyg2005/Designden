import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { adminAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import "../../styles/DashboardCommon.css";

const Dashboard = () => {
  const { showFlash } = useFlash();
  const [stats, setStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("all");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashResult, userStatsResult, productsResult] =
        await Promise.allSettled([
          adminAPI.getDashboard(),
          api.get("/admin/api/user-stats"),
          api.get("/admin/api/products"),
        ]);
      if (dashResult.status === "fulfilled")
        setStats(dashResult.value.data.stats || {});
      if (userStatsResult.status === "fulfilled")
        setUserStats(userStatsResult.value.data.stats || {});
      if (productsResult.status === "fulfilled")
        setProducts(productsResult.value.data.products || []);
      if (dashResult.status === "rejected")
        showFlash("Failed to load dashboard stats", "error");
    } catch (error) {
      showFlash("Failed to load dashboard", "error");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [showFlash]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/admin/api/users", {
        params: { role: selectedRole },
      });
      setUsers(response.data.users || []);
    } catch {
      showFlash("Failed to load users", "error");
    }
  }, [selectedRole, showFlash]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/admin/api/products");
      setProducts(response.data.products || []);
    } catch {
      showFlash("Failed to load products", "error");
    }
  }, [showFlash]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab, fetchUsers, fetchProducts]);

  if (loading) {
    return (
      <div className="container my-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-dashboard">
      <div className="container-fluid my-4 animate-fade-in">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-header d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-2">
                  <i className="fas fa-chart-line text-primary me-2"></i>
                  Admin Analytics Dashboard
                </h2>
                <p className="text-muted mb-0">
                  Overview of business performance, users, and inventory
                </p>
              </div>
              <div className="dashboard-role-badge">
                <i className="fas fa-shield-alt"></i>
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="fas fa-chart-pie me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users me-2"></i>
            Users ({userStats.total || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <i className="fas fa-box me-2"></i>
            Products & Stock
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics Row */}
          <div className="row mb-4 animate-slide-up delay-100">
            {/* Total Revenue */}
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-success h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Total Revenue</p>
                    <h3 className="dash-stat-value">
                      {formatPrice(stats.totalRevenue || 0)}
                    </h3>
                    <small className="text-success">
                      <i className="fas fa-arrow-up"></i> All time
                    </small>
                  </div>
                  <div className="dash-stat-icon dash-icon-success">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-primary h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Total Orders</p>
                    <h3 className="dash-stat-value">{stats.totalOrders || 0}</h3>
                    <small className="text-primary">
                      <i className="fas fa-shopping-bag"></i> All time
                    </small>
                  </div>
                  <div className="dash-stat-icon dash-icon-primary">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-success h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Completed</p>
                    <h3 className="dash-stat-value">{stats.completedOrders || 0}</h3>
                    <small className="text-success">
                      <i className="fas fa-check-circle"></i>{" "}
                      {formatPrice(stats.completedRevenue || 0)}
                    </small>
                  </div>
                  <div className="dash-stat-icon dash-icon-success">
                    <i className="fas fa-check-double"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-warning h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Pending</p>
                    <h3 className="dash-stat-value">{stats.pendingOrders || 0}</h3>
                    <small className="text-warning">
                      <i className="fas fa-clock"></i> Awaiting
                    </small>
                  </div>
                  <div className="dash-stat-icon dash-icon-warning">
                    <i className="fas fa-hourglass-half"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="row mb-4 animate-slide-up delay-200">
            <div className="col-12">
              <div className="dash-item-card px-4 py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-users text-primary me-2"></i>User Statistics
                  </h5>
                </div>
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-light border-0">
                      <i className="fas fa-user fa-2x text-primary mb-2"></i>
                      <h4 className="fw-bold">{userStats.customers || 0}</h4>
                      <p className="text-muted mb-0 small text-uppercase fw-semibold">Customers</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-light border-0">
                      <i className="fas fa-user-tie fa-2x text-success mb-2"></i>
                      <h4 className="fw-bold">{userStats.managers || 0}</h4>
                      <p className="text-muted mb-0 small text-uppercase fw-semibold">Managers</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-light border-0">
                      <i className="fas fa-paint-brush fa-2x text-warning mb-2"></i>
                      <h4 className="fw-bold">{userStats.designers || 0}</h4>
                      <p className="text-muted mb-0 small text-uppercase fw-semibold">Designers</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-light border-0">
                      <i className="fas fa-truck fa-2x text-info mb-2"></i>
                      <h4 className="fw-bold">{userStats.delivery || 0}</h4>
                      <p className="text-muted mb-0 small text-uppercase fw-semibold">Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product & Stock Statistics */}
          <div className="row mb-4 animate-slide-up delay-300">
            <div className="col-12">
              <div className="dash-item-card px-4 py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-box text-secondary me-2"></i>Product & Stock Overview
                  </h5>
                </div>
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-light border-0">
                      <i className="fas fa-boxes fa-2x text-secondary mb-2"></i>
                      <h4 className="fw-bold">{products.length}</h4>
                      <p className="text-muted mb-0 small text-uppercase fw-semibold">Total Products</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-success bg-opacity-10 border-0">
                      <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                      <h4 className="text-success fw-bold">
                        {
                          products.filter(
                            (p) => p.inStock && p.stockQuantity > 10,
                          ).length
                        }
                      </h4>
                      <p className="text-success mb-0 small text-uppercase fw-semibold">In Stock</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-warning bg-opacity-10 border-0">
                      <i className="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                      <h4 className="text-warning fw-bold">
                        {
                          products.filter(
                            (p) =>
                              p.stockQuantity < 10 && p.stockQuantity > 0,
                          ).length
                        }
                      </h4>
                      <p className="text-warning mb-0 small text-uppercase fw-semibold">Low Stock</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="p-3 border rounded bg-danger bg-opacity-10 border-0">
                      <i className="fas fa-times-circle fa-2x text-danger mb-2"></i>
                      <h4 className="text-danger fw-bold">
                        {
                          products.filter(
                            (p) => !p.inStock || p.stockQuantity === 0,
                          ).length
                        }
                      </h4>
                      <p className="text-danger mb-0 small text-uppercase fw-semibold">Out of Stock</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h6 className="text-primary fw-bold bg-primary bg-opacity-10 d-inline-block px-4 py-2 rounded-pill">
                    <i className="fas fa-layer-group me-2"></i>Total Stock:{" "}
                    {products.reduce(
                      (sum, p) => sum + (p.stockQuantity || 0),
                      0,
                    )}{" "}
                    items
                  </h6>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row animate-slide-up delay-400">
            <div className="col-12">
              <div className="dash-item-card px-4 py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-tasks text-info me-2"></i>Quick Actions
                  </h5>
                </div>
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <Link
                      to="/admin/orders"
                      className="dash-btn dash-btn-outline w-100 py-3 d-flex flex-column align-items-center justify-content-center h-100"
                    >
                      <i className="fas fa-shopping-cart fa-2x text-primary mb-2"></i>
                      <span className="fw-semibold">View Orders</span>
                    </Link>
                  </div>
                  <div className="col-md-3 mb-3">
                    <button
                      className="dash-btn dash-btn-outline w-100 py-3 d-flex flex-column align-items-center justify-content-center h-100"
                      onClick={() => setActiveTab("users")}
                    >
                      <i className="fas fa-users fa-2x text-success mb-2"></i>
                      <span className="fw-semibold">Manage Users</span>
                    </button>
                  </div>
                  <div className="col-md-3 mb-3">
                    <Link
                      to="/admin/feedbacks"
                      className="dash-btn dash-btn-outline w-100 py-3 d-flex flex-column align-items-center justify-content-center h-100"
                    >
                      <i className="fas fa-comments fa-2x text-info mb-2"></i>
                      <span className="fw-semibold">View Feedbacks</span>
                    </Link>
                  </div>
                  <div className="col-md-3 mb-3">
                    <Link
                      to="/admin/designers"
                      className="dash-btn dash-btn-outline w-100 py-3 d-flex flex-column align-items-center justify-content-center h-100"
                    >
                      <i className="fas fa-palette fa-2x text-warning mb-2"></i>
                      <span className="fw-semibold">Manage Designers</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          <div className="row mb-4 animate-slide-up delay-100">
            <div className="col-12">
              <div className="d-flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Users", count: userStats.total },
                  { id: "customer", label: "Customers", count: userStats.customers },
                  { id: "manager", label: "Managers", count: userStats.managers },
                  { id: "designer", label: "Designers", count: userStats.designers },
                  { id: "delivery", label: "Delivery", count: userStats.delivery }
                ].map((role) => (
                  <button
                    key={role.id}
                    className={`dash-btn ${
                      selectedRole === role.id
                        ? "dash-btn-primary"
                        : "dash-btn-outline"
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    {role.label}
                    <span className="badge bg-light text-dark ms-2">
                      {role.count || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <i className="fas fa-users fa-3x text-muted mb-2"></i>
                          <p className="text-muted">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <strong>{user.name || "N/A"}</strong>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`dash-badge ${
                                user.role === "customer"
                                  ? "bg-primary text-white"
                                  : user.role === "manager"
                                    ? "bg-success text-white"
                                    : user.role === "designer"
                                      ? "bg-warning text-dark"
                                      : user.role === "delivery"
                                        ? "bg-info text-dark"
                                        : "bg-secondary text-white"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>{user.contactNumber || "N/A"}</td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <div className="row mb-4 animate-slide-up delay-100">
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-info h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Total Products</p>
                    <h3 className="dash-stat-value">{products.length}</h3>
                  </div>
                  <div className="dash-stat-icon dash-icon-info">
                    <i className="fas fa-boxes"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-success h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">In Stock</p>
                    <h3 className="dash-stat-value">
                      {
                        products.filter((p) => p.inStock && p.stockQuantity > 10)
                          .length
                      }
                    </h3>
                  </div>
                  <div className="dash-stat-icon dash-icon-success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-warning h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Low Stock</p>
                    <h3 className="dash-stat-value">
                      {
                        products.filter(
                          (p) => p.stockQuantity < 10 && p.stockQuantity > 0,
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="dash-stat-icon dash-icon-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="dash-stat-card dash-card-danger h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="dash-stat-content">
                    <p className="dash-stat-label">Out of Stock</p>
                    <h3 className="dash-stat-value">
                      {
                        products.filter(
                          (p) => !p.inStock || p.stockQuantity === 0,
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="dash-stat-icon dash-icon-danger">
                    <i className="fas fa-times-circle"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-item-card animate-slide-up delay-200">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Gender</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="fas fa-box-open fa-3x text-muted mb-2"></i>
                        <p className="text-muted">No products found</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product._id}
                        className={
                          !product.inStock || product.stockQuantity === 0
                            ? "table-danger"
                            : product.stockQuantity < 10
                              ? "table-warning"
                              : ""
                        }
                      >
                        <td>
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                        </td>
                        <td>
                          <span className="dash-badge bg-secondary text-white">
                            {product.category}
                          </span>
                        </td>
                        <td>{product.gender || "N/A"}</td>
                        <td>
                          <strong>{formatPrice(product.price)}</strong>
                        </td>
                        <td>
                          <strong>{product.stockQuantity || 0}</strong>
                        </td>
                        <td>
                          {product.inStock && product.stockQuantity > 0 ? (
                            <span className="dash-badge dash-badge-success">
                              <i className="fas fa-check me-1"></i>
                              Available
                            </span>
                          ) : (
                            <span className="dash-badge dash-badge-danger">
                              <i className="fas fa-times me-1"></i>
                              Unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
