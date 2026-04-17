/**
 * Enhanced Designer Dashboard with Chat Integration
 * Real-world workflow with customer communication
 * Features:
 * - Accept/reject orders
 * - Progress updates with milestones
 * - Real-time chat with customers
 * - File/image sharing for design proofs
 * - Production timeline
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDesignerOrders,
  acceptOrder,
  startProduction,
  updateProgress,
  completeProduction,
  fetchOrderMessages,
  sendOrderMessage,
  selectOrders,
  selectOrdersLoading,
  selectMessages,
} from "../../store/slices/ordersSlice";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/currency";
import LoadingSpinner from "../../components/LoadingSpinner";
import { designerAPI } from "../../services/api";
import {
  shouldUseDesignWorkflow,
  isDesignPhase,
  wasDesignRejected,
  DESIGN_MILESTONES,
} from "../../utils/designWorkflow";
import "../../styles/DashboardCommon.css";

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const chatMessages = useSelector(selectMessages);

  // State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("orders");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // NEW: Design workflow state
  const [designProgress, setDesignProgress] = useState(0);
  const [designNote, setDesignNote] = useState("");
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showSubmitDesignModal, setShowSubmitDesignModal] = useState(false);
  const [designSubmissionNotes, setDesignSubmissionNotes] = useState("");
  const [designFiles, setDesignFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Availability status state
  const [availabilityStatus, setAvailabilityStatus] = useState(
    user?.designerProfile?.availabilityStatus || "available",
  );
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Fetch orders
  useEffect(() => {
    dispatch(fetchDesignerOrders());
  }, [dispatch]);

  // Fetch availability status from server on mount
  useEffect(() => {
    const fetchAvailabilityStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/designer/profile`,
          {
            credentials: "include",
          },
        );
        if (response.ok) {
          const data = await response.json();
          // API returns { success: true, designer: { designerProfile: { availabilityStatus: ... } } }
          if (
            data.success &&
            data.designer?.designerProfile?.availabilityStatus
          ) {
            setAvailabilityStatus(
              data.designer.designerProfile.availabilityStatus,
            );
          }
        }
      } catch (error) {
        console.error("Error fetching availability status:", error);
      }
    };
    fetchAvailabilityStatus();
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchDesignerOrders()).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }, [dispatch]);

  // Availability status handler - opens confirmation modal
  const handleAvailabilityChange = (newStatus) => {
    if (newStatus === availabilityStatus) return;
    setPendingStatus(newStatus);
    setShowStatusModal(true);
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setUpdatingAvailability(true);
    setShowStatusModal(false);
    try {
      const isAvailable = pendingStatus === "available";
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/designer/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: pendingStatus, isAvailable }),
        },
      );

      if (response.ok) {
        setAvailabilityStatus(pendingStatus);
      } else {
        console.error("Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    } finally {
      setUpdatingAvailability(false);
      setPendingStatus(null);
    }
  };

  // Get status label for display
  const getStatusLabel = (status) => {
    switch (status) {
      case "available":
        return {
          label: "Open (Available)",
          icon: "check-circle",
          color: "success",
        };
      case "busy":
        return { label: "Busy", icon: "clock", color: "warning" };
      case "not_accepting":
        return {
          label: "Closed (Not Accepting Orders)",
          icon: "ban",
          color: "danger",
        };
      default:
        return { label: status, icon: "question", color: "secondary" };
    }
  };

  // Production milestones
  const productionMilestones = [
    { id: 1, name: "Design Review", percentage: 10, icon: "eye" },
    { id: 2, name: "Material Selection", percentage: 25, icon: "boxes" },
    { id: 3, name: "Pattern Making", percentage: 40, icon: "cut" },
    { id: 4, name: "Fabric Cutting", percentage: 55, icon: "scissors" },
    { id: 5, name: "Stitching", percentage: 70, icon: "tshirt" },
    { id: 6, name: "Quality Check", percentage: 85, icon: "search" },
    { id: 7, name: "Final Touches", percentage: 95, icon: "magic" },
    {
      id: 8,
      name: "Ready for Delivery",
      percentage: 100,
      icon: "check-circle",
    },
  ];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  // Statistics
  const stats = {
    pending: orders.filter((o) => o.status === "assigned_to_designer").length,
    accepted: orders.filter((o) => o.status === "designer_accepted").length,
    inProduction: orders.filter((o) => o.status === "in_production").length,
    completed: orders.filter((o) => o.status === "production_completed").length,
    total: orders.length,
  };

  // Actions
  const handleAcceptOrder = async (orderId) => {
    try {
      await dispatch(acceptOrder(orderId)).unwrap();
      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  // ===== NEW DESIGN WORKFLOW HANDLERS =====

  const handleStartDesignWork = async (order) => {
    try {
      await designerAPI.updateDesignProgress(
        order._id,
        order.designProgress || 0,
        "Started working on your design",
      );
      await dispatch(fetchDesignerOrders()).unwrap();
    } catch (error) {
      console.error("Failed to start design work:", error);
      alert("Failed to start design work: " + (error?.message || "Please try again"));
    }
  };

  const openDesignProgressModal = (order) => {
    setSelectedOrder(order);
    setDesignProgress(order.designProgress || 0);
    setDesignNote("");
    setShowDesignModal(true);
  };

  const handleUpdateDesignProgress = async () => {
    if (!selectedOrder) return;

    try {
      setSavingProgress(true);
      await designerAPI.updateDesignProgress(
        selectedOrder._id,
        designProgress,
        designNote || `Design ${designProgress}% complete`,
      );

      // Send update to customer via chat
      if (chatOrder?._id === selectedOrder._id) {
        await dispatch(
          sendOrderMessage({
            orderId: selectedOrder._id,
            message: `Design Update: ${designProgress}% complete${
              designNote ? ` - ${designNote}` : ""
            }`,
          }),
        );
      }

      setShowDesignModal(false);
      dispatch(fetchDesignerOrders()); // refresh in background, don't block
    } catch (error) {
      console.error("Failed to update design progress:", error);
      alert("Failed to save progress: " + (error?.response?.data?.message || error?.message || "Please try again"));
    } finally {
      setSavingProgress(false);
    }
  };

  const openSubmitDesignModal = (order) => {
    setSelectedOrder(order);
    setDesignSubmissionNotes("");
    setDesignFiles([]);
    setShowSubmitDesignModal(true);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + designFiles.length > 5) {
      alert("Maximum 5 design files allowed");
      return;
    }

    setUploadingFiles(true);

    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              type: file.type.startsWith("image/") ? "image" : "file",
              url: e.target.result, // base64
            });
          };
          reader.readAsDataURL(file);
        });
      }),
    ).then((newFiles) => {
      setDesignFiles((prev) => [...prev, ...newFiles]);
      setUploadingFiles(false);
    });
  };

  // Remove file
  const removeFile = (index) => {
    setDesignFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDesign = async () => {
    if (!selectedOrder) return;

    if (designFiles.length === 0) {
      alert("Please upload at least one design file for customer review");
      return;
    }

    try {
      await designerAPI.submitDesignForApproval(
        selectedOrder._id,
        designSubmissionNotes || "Design completed and ready for review",
        designFiles,
      );

      // Notify customer
      await dispatch(
        sendOrderMessage({
          orderId: selectedOrder._id,
          message:
            "✅ Design complete! Your design has been submitted for your approval. Please review the design files.",
        }),
      );

      setShowSubmitDesignModal(false);
      setDesignFiles([]);
      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to submit design:", error);
      alert(
        error.response?.data?.message || "Failed to submit design for approval",
      );
    }
  };

  // Submit design to manager (after customer approval)
  const handleSubmitToManager = async (order) => {
    if (!confirm("Submit this design to manager for final approval?")) return;

    try {
      await designerAPI.submitDesignToManager(
        order._id,
        "Customer approved - Ready for production",
      );

      // Notify customer and manager
      await dispatch(
        sendOrderMessage({
          orderId: order._id,
          message:
            "✅ Your approved design has been submitted to our manager for final approval.",
        }),
      );

      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to submit to manager:", error);
      alert(
        error.response?.data?.message || "Failed to submit design to manager",
      );
    }
  };

  // ===== END DESIGN WORKFLOW HANDLERS =====

  const handleStartProduction = async (orderId) => {
    try {
      await dispatch(startProduction(orderId)).unwrap();
      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to start production:", error);
    }
  };

  const openProgressModal = (order) => {
    setSelectedOrder(order);
    setProgressValue(order.progressPercentage || 0);
    setProgressNote("");
    setSelectedMilestone(null);
    setShowProgressModal(true);
  };

  const handleMilestoneSelect = (milestone) => {
    setSelectedMilestone(milestone);
    setProgressValue(milestone.percentage);
    setProgressNote(`Completed: ${milestone.name}`);
  };

  const handleUpdateProgress = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(
        updateProgress({
          orderId: selectedOrder._id,
          progressPercentage: progressValue,
          note:
            progressNote ||
            (selectedMilestone ? `Milestone: ${selectedMilestone.name}` : ""),
        }),
      ).unwrap();

      // Send progress update to customer via chat
      if (chatOrder?._id === selectedOrder._id) {
        await dispatch(
          sendOrderMessage({
            orderId: selectedOrder._id,
            message: `📊 Progress Update: ${progressValue}% complete${
              selectedMilestone ? ` - ${selectedMilestone.name}` : ""
            }`,
          }),
        );
      }

      setShowProgressModal(false);
      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const openCompleteModal = (order) => {
    setSelectedOrder(order);
    setCompletionNotes("");
    setShowCompleteModal(true);
  };

  const handleCompleteProduction = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(
        completeProduction({
          orderId: selectedOrder._id,
          notes: completionNotes,
        }),
      ).unwrap();

      // Notify customer
      await dispatch(
        sendOrderMessage({
          orderId: selectedOrder._id,
          message:
            "🎉 Great news! Your custom design is complete and ready for delivery!",
        }),
      );

      setShowCompleteModal(false);
      dispatch(fetchDesignerOrders());
    } catch (error) {
      console.error("Failed to complete production:", error);
    }
  };

  // Chat functions
  const openChat = async (order) => {
    setChatOrder(order);
    setShowChatPanel(true);
    await dispatch(fetchOrderMessages(order._id));
  };

  const closeChat = () => {
    setChatOrder(null);
    setShowChatPanel(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatOrder) return;

    setSendingMessage(true);
    try {
      await dispatch(
        sendOrderMessage({
          orderId: chatOrder._id,
          message: newMessage,
        }),
      ).unwrap();
      setNewMessage("");
      await dispatch(fetchOrderMessages(chatOrder._id));
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      assigned_to_designer: {
        class: "bg-warning text-dark",
        icon: "clock",
        text: "Pending",
      },
      designer_accepted: { class: "bg-info", icon: "check", text: "Accepted" },
      design_in_progress: {
        class: "bg-primary",
        icon: "palette",
        text: "Design In Progress",
      },
      design_pending_customer_approval: {
        class: "bg-info",
        icon: "hourglass-half",
        text: "Awaiting Customer Approval",
      },
      design_approved_by_customer: {
        class: "bg-success",
        icon: "thumbs-up",
        text: "Customer Approved",
      },
      design_rejected_by_customer: {
        class: "bg-danger",
        icon: "redo",
        text: "Revision Requested",
      },
      design_ready: {
        class: "bg-info",
        icon: "hourglass-half",
        text: "Submitted to Manager",
      },
      design_approved: {
        class: "bg-success",
        icon: "check-circle",
        text: "Design Approved",
      },
      in_production: {
        class: "bg-primary",
        icon: "cogs",
        text: "In Production",
      },
      production_completed: {
        class: "bg-success",
        icon: "check-double",
        text: "Completed",
      },
    };
    return (
      badges[status] || {
        class: "bg-secondary",
        icon: "question",
        text: status,
      }
    );
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return "danger";
    if (progress < 50) return "warning";
    if (progress < 75) return "info";
    if (progress < 100) return "primary";
    return "success";
  };

  // Get current milestone
  const getCurrentMilestone = (progress) => {
    return (
      productionMilestones.find((m, idx) => {
        const next = productionMilestones[idx + 1];
        return (
          progress >= m.percentage && (!next || progress < next.percentage)
        );
      }) || productionMilestones[0]
    );
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="unified-dashboard">
      <div className="container-fluid my-4 animate-fade-in">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h2 className="mb-2">
                      <i className="fas fa-paint-brush me-2 text-purple"></i>
                      Designer Workspace
                    </h2>
                    <p className="text-muted mb-0">
                      Welcome, <strong>{user?.username}</strong>! Create
                      beautiful custom designs and keep customers updated.
                    </p>
                  </div>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    {/* Availability Status Toggle */}
                    <div className="availability-toggle-container">
                      <div className="availability-status">
                        <span className="status-label">Shop Status:</span>
                        <div className="status-toggle-group">
                          <button
                            className={`status-toggle-btn ${availabilityStatus === "available" ? "active available" : ""}`}
                            onClick={() =>
                              handleAvailabilityChange("available")
                            }
                            disabled={updatingAvailability}
                            title="Available - Ready to accept orders"
                          >
                            <i className="fas fa-check-circle"></i>
                            Open
                          </button>
                          <button
                            className={`status-toggle-btn ${availabilityStatus === "not_accepting" ? "active not-accepting" : ""}`}
                            onClick={() =>
                              handleAvailabilityChange("not_accepting")
                            }
                            disabled={updatingAvailability}
                            title="Closed - Not accepting orders"
                          >
                            <i className="fas fa-ban"></i>
                            Closed
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`dash-btn dash-btn-outline ${
                        refreshing ? "rotating" : ""
                      }`}
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                    <div className="dashboard-role-badge">
                      <i className="fas fa-palette"></i>
                      <span>Designer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Statistics Grid */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3 animate-slide-up delay-100">
            <div
              className={`dash-stat-card dash-card-warning cursor-pointer ${
                activeTab === "pending" ? "active" : ""
              }`}
              onClick={() => {
                setFilterStatus("assigned_to_designer");
                setActiveTab("pending");
              }}
            >
                <div className="dash-stat-icon dash-icon-warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="dash-stat-content">
                  <div className="dash-stat-label">Pending</div>
                  <div className="dash-stat-value text-warning">
                    {stats.pending}
                  </div>
                  <small className="text-muted">Awaiting your action</small>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3 animate-slide-up delay-200">
            <div
              className={`dash-stat-card dash-card-info cursor-pointer ${
                activeTab === "accepted" ? "active" : ""
              }`}
              onClick={() => {
                setFilterStatus("designer_accepted");
                setActiveTab("accepted");
              }}
            >
                <div className="dash-stat-icon dash-icon-info">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="dash-stat-content">
                  <div className="dash-stat-label">Accepted</div>
                  <div className="dash-stat-value text-info">{stats.accepted}</div>
                  <small className="text-muted">Ready to start</small>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3 animate-slide-up delay-300">
            <div
              className={`dash-stat-card dash-card-primary cursor-pointer ${
                activeTab === "production" ? "active" : ""
              }`}
              onClick={() => {
                setFilterStatus("in_production");
                setActiveTab("production");
              }}
            >
                <div className="dash-stat-icon dash-icon-purple">
                  <i className="fas fa-cogs"></i>
                </div>
                <div className="dash-stat-content">
                  <div className="dash-stat-label">In Production</div>
                  <div className="dash-stat-value text-primary">
                    {stats.inProduction}
                  </div>
                  <small className="text-muted">Currently working</small>
                </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3 animate-slide-up delay-400">
            <div
              className={`dash-stat-card dash-card-success cursor-pointer ${
                activeTab === "completed" ? "active" : ""
              }`}
              onClick={() => {
                setFilterStatus("production_completed");
                setActiveTab("completed");
              }}
            >
                <div className="dash-stat-icon dash-icon-success">
                  <i className="fas fa-check-double"></i>
                </div>
                <div className="dash-stat-content">
                  <div className="dash-stat-label">Completed</div>
                  <div className="dash-stat-value text-success">
                    {stats.completed}
                  </div>
                  <small className="text-muted">Ready for delivery</small>
                </div>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="fw-bold me-2">Filter:</span>
                  <button
                    className={`btn btn-sm ${
                      filterStatus === "all"
                        ? "btn-purple"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => {
                      setFilterStatus("all");
                      setActiveTab("orders");
                    }}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    className={`btn btn-sm ${
                      filterStatus === "assigned_to_designer"
                        ? "btn-warning"
                        : "btn-outline-warning"
                    }`}
                    onClick={() => setFilterStatus("assigned_to_designer")}
                  >
                    <i className="fas fa-clock me-1"></i> Pending (
                    {stats.pending})
                  </button>
                  <button
                    className={`btn btn-sm ${
                      filterStatus === "designer_accepted"
                        ? "btn-info"
                        : "btn-outline-info"
                    }`}
                    onClick={() => setFilterStatus("designer_accepted")}
                  >
                    <i className="fas fa-check me-1"></i> Accepted (
                    {stats.accepted})
                  </button>
                  <button
                    className={`btn btn-sm ${
                      filterStatus === "in_production"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterStatus("in_production")}
                  >
                    <i className="fas fa-cogs me-1"></i> In Production (
                    {stats.inProduction})
                  </button>
                  <button
                    className={`btn btn-sm ${
                      filterStatus === "production_completed"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                    onClick={() => setFilterStatus("production_completed")}
                  >
                    <i className="fas fa-check-double me-1"></i> Completed (
                    {stats.completed})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="row">
          {filteredOrders.length === 0 ? (
            <div className="col-12">
              <div className="dash-item-card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                  <h4 className="text-muted">No orders found</h4>
                  <p className="text-muted">
                    {filterStatus === "all"
                      ? "You have no assigned orders at the moment"
                      : "No orders with this status"}
                  </p>
                  <button
                    className="dash-btn dash-btn-outline"
                    onClick={() => setFilterStatus("all")}
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const currentMilestone =
                order.status === "in_production"
                  ? getCurrentMilestone(order.progressPercentage || 0)
                  : null;

              return (
                <div key={order._id} className="col-lg-6 col-xl-4 mb-4">
                  <div className={`dash-item-card h-100 ${order.status}`}>
                    {/* Card Header */}
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0 fw-bold">
                          Order #{order._id.substring(0, 8).toUpperCase()}
                        </h6>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </small>
                      </div>
                      <span className={`dash-badge ${statusInfo.class}`}>
                        <i className={`fas fa-${statusInfo.icon}`}></i>
                        {statusInfo.text}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      {/* Customer Info */}
                      <div className="customer-info d-flex align-items-center mb-3 p-2 bg-light rounded">
                        <div className="customer-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <div className="fw-bold">
                            {order.userId?.name || "Customer"}
                          </div>
                          <small className="text-muted">
                            {order.userId?.email}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-purple"
                          onClick={() => openChat(order)}
                          title="Chat with customer"
                        >
                          <i className="fas fa-comments"></i>
                        </button>
                      </div>

                      {/* Design Preview */}
                      <div className="design-preview mb-3">
                        <small className="text-muted d-block mb-2">
                          <i className="fas fa-palette me-1"></i> Design Items
                        </small>
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="design-item d-flex justify-content-between align-items-center p-2 bg-purple-light rounded mb-2"
                          >
                            <div className="d-flex align-items-center">
                              <div className="design-icon me-2">
                                <i className="fas fa-tshirt text-purple"></i>
                              </div>
                              <div>
                                <span className="fw-medium">
                                  {item.designId?.name || "Custom Design"}
                                </span>
                                <small className="text-muted d-block">
                                  Qty: {item.quantity}
                                </small>
                              </div>
                            </div>
                            <span className="fw-bold text-purple">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Design Progress Section */}
                      {shouldUseDesignWorkflow(order) &&
                        (order.status === "design_in_progress" ||
                          order.status === "design_rejected" ||
                          order.status === "design_rejected_by_customer") && (
                          <div className="progress-section mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                <i className="fas fa-palette me-1"></i> Design
                                Progress
                              </small>
                              <span className="badge bg-info">
                                {order.designProgress || 0}%
                              </span>
                            </div>
                            <div className="progress mb-1" style={{ height: "10px" }}>
                              <div
                                className="progress-bar bg-info progress-bar-striped progress-bar-animated"
                                style={{ width: `${order.designProgress || 0}%` }}
                              ></div>
                            </div>
                            {order.designProgress >= 100 && (
                              <small className="text-success fw-medium">
                                <i className="fas fa-check-circle me-1"></i>
                                Design complete — ready to submit
                              </small>
                            )}
                          </div>
                        )}

                      {/* Progress Section (for in production orders) */}
                      {order.status === "in_production" && (
                        <div className="progress-section mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              <i className="fas fa-tasks me-1"></i> Production
                              Progress
                            </small>
                            <span className="badge bg-primary">
                              {order.progressPercentage || 0}%
                            </span>
                          </div>
                          <div
                            className="progress mb-2"
                            style={{ height: "12px" }}
                          >
                            <div
                              className={`progress-bar progress-bar-striped progress-bar-animated bg-${getProgressColor(
                                order.progressPercentage || 0,
                              )}`}
                              style={{
                                width: `${order.progressPercentage || 0}%`,
                              }}
                            ></div>
                          </div>
                          {currentMilestone && (
                            <div className="current-milestone d-flex align-items-center p-2 bg-info bg-opacity-10 rounded">
                              <i
                                className={`fas fa-${currentMilestone.icon} text-info me-2`}
                              ></i>
                              <small className="text-info fw-medium">
                                Current: {currentMilestone.name}
                              </small>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total */}
                      <div className="order-total d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 rounded mb-2">
                        <span className="text-muted">Total Amount:</span>
                        <span className="fw-bold text-success fs-5">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      {/* Expected Earnings */}
                      <div className="expected-earnings d-flex justify-content-between align-items-center p-2 bg-primary bg-opacity-10 rounded">
                        <span className="text-muted">
                          <i className="fas fa-wallet me-1"></i>
                          Your Design Fee:
                        </span>
                        <span className="fw-bold text-primary">
                          {formatPrice(order.designerFee || 500)}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="card-footer bg-white border-top">
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Pending - Accept Order */}
                        {order.status === "assigned_to_designer" && (
                          <button
                            className="btn btn-success flex-grow-1"
                            onClick={() => handleAcceptOrder(order._id)}
                          >
                            <i className="fas fa-check me-2"></i>
                            Accept Order
                          </button>
                        )}

                        {/* NEW DESIGN WORKFLOW - Design Phase */}
                        {shouldUseDesignWorkflow(order) &&
                          isDesignPhase(order) && (
                            <>
                              {/* Show rejection message if design was rejected by manager */}
                              {wasDesignRejected(order) && (
                                <div className="w-100 alert alert-warning small mb-2">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  <strong>Manager Rejected:</strong>{" "}
                                  {order.designApproval?.rejectionReason}
                                  <br />
                                  <small>Please revise and resubmit.</small>
                                </div>
                              )}

                              {/* Show rejection message if customer requested revision */}
                              {order.status ===
                                "design_rejected_by_customer" && (
                                <div className="w-100 alert alert-danger small mb-2">
                                  <i className="fas fa-undo me-1"></i>
                                  <strong>
                                    Customer Requested Revision:
                                  </strong>{" "}
                                  {order.designRejection?.reason ||
                                    "Please make changes and resubmit."}
                                  <br />
                                  <small className="text-muted">
                                    Revision #
                                    {order.designRejection?.revisionCount || 1}{" "}
                                    - Update design progress and resubmit to
                                    customer.
                                  </small>
                                </div>
                              )}

                              {/* Design in progress - Update design progress */}
                              {(order.status === "design_in_progress" ||
                                order.status === "design_rejected" ||
                                order.status ===
                                  "design_rejected_by_customer") && (
                                <button
                                  className="btn btn-info flex-grow-1"
                                  onClick={() => openDesignProgressModal(order)}
                                >
                                  <i className="fas fa-palette me-2"></i>
                                  Update Design Progress
                                </button>
                              )}

                              {/* Submit design for approval when ready */}
                              {(order.status === "design_in_progress" ||
                                order.status === "design_rejected" ||
                                order.status ===
                                  "design_rejected_by_customer") &&
                                order.designProgress >= 100 && (
                                  <button
                                    className="btn btn-success"
                                    onClick={() => openSubmitDesignModal(order)}
                                  >
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Submit to Customer
                                  </button>
                                )}

                              {/* Awaiting customer approval */}
                              {order.status ===
                                "design_pending_customer_approval" && (
                                <div className="w-100 alert alert-info small mb-2">
                                  <i className="fas fa-clock me-1"></i>
                                  Design submitted - Awaiting customer approval
                                </div>
                              )}

                              {/* Customer approved - can submit to manager */}
                              {order.status ===
                                "design_approved_by_customer" && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleSubmitToManager(order)}
                                >
                                  <i className="fas fa-paper-plane me-2"></i>
                                  Submit to Manager
                                </button>
                              )}

                              {/* Awaiting manager approval */}
                              {order.status === "design_ready" && (
                                <div className="w-100 alert alert-info small mb-2">
                                  <i className="fas fa-clock me-1"></i>
                                  Submitted to manager - Awaiting final approval
                                </div>
                              )}

                              {/* Design accepted - Just start working */}
                              {order.status === "designer_accepted" && (
                                <button
                                  className="btn btn-primary flex-grow-1"
                                  onClick={() => handleStartDesignWork(order)}
                                >
                                  <i className="fas fa-palette me-2"></i>
                                  Start Design Work
                                </button>
                              )}
                            </>
                          )}

                        {/* LEGACY WORKFLOW - Old production workflow for non-custom orders */}
                        {!shouldUseDesignWorkflow(order) && (
                          <>
                            {/* Accepted - Start Production */}
                            {order.status === "designer_accepted" && (
                              <button
                                className="btn btn-primary flex-grow-1"
                                onClick={() => handleStartProduction(order._id)}
                              >
                                <i className="fas fa-play me-2"></i>
                                Start Production
                              </button>
                            )}

                            {/* In Production - Update Progress */}
                            {order.status === "in_production" && (
                              <>
                                <button
                                  className="btn btn-info flex-grow-1"
                                  onClick={() => openProgressModal(order)}
                                >
                                  <i className="fas fa-tasks me-2"></i>
                                  Update Progress
                                </button>
                                {order.progressPercentage >= 100 && (
                                  <button
                                    className="btn btn-success"
                                    onClick={() => openCompleteModal(order)}
                                  >
                                    <i className="fas fa-check-double me-2"></i>
                                    Complete
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Production phase info for new workflow */}
                        {shouldUseDesignWorkflow(order) &&
                          order.status === "design_approved" && (
                            <div className="w-100 alert alert-success small mb-2">
                              <i className="fas fa-check-circle me-1"></i>
                              Design approved! Manager is handling production.
                            </div>
                          )}

                        {shouldUseDesignWorkflow(order) &&
                          order.status === "in_production" && (
                            <div className="w-100 alert alert-info small mb-2">
                              <i className="fas fa-industry me-1"></i>
                              Production in progress - Manager handling (
                              {order.progressPercentage || 0}%)
                            </div>
                          )}

                        <button
                          className="btn btn-outline-purple"
                          onClick={() => openChat(order)}
                          title="Chat with customer"
                        >
                          <i className="fas fa-comments"></i>
                        </button>

                        {/* View Details */}
                        <Link
                          to={`/designer/orders/${order._id}`}
                          className="btn btn-outline-secondary"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel Slide-in */}
      {showChatPanel && chatOrder && (
        <div className="chat-panel-overlay" onClick={closeChat}>
          <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="d-flex align-items-center">
                <div className="chat-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="ms-3">
                  <div className="fw-bold">
                    {chatOrder.userId?.name || "Customer"}
                  </div>
                  <small className="text-muted-light">
                    Order #{chatOrder._id.substring(0, 8)}
                  </small>
                </div>
              </div>
              <button className="btn btn-light btn-sm" onClick={closeChat}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {!chatMessages || chatMessages.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No messages yet</p>
                  <small className="text-muted">
                    Start the conversation by sending a message
                  </small>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${
                      msg.senderRole === "designer" ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">
                      {msg.messageType === "progress_update" && (
                        <div className="progress-badge mb-1">
                          <i className="fas fa-chart-line me-1"></i> Progress
                          Update
                        </div>
                      )}
                      <p className="mb-1">{msg.message}</p>
                      <small className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="chat-quick-actions">
              <button
                className="quick-action-btn"
                onClick={() =>
                  setNewMessage("I've started working on your design! 🎨")
                }
              >
                🎨 Started
              </button>
              <button
                className="quick-action-btn"
                onClick={() =>
                  setNewMessage("Making great progress on your order! 📈")
                }
              >
                📈 Progress
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setNewMessage("Your design is almost ready! ✨")}
              >
                ✨ Almost Done
              </button>
            </div>

            {/* Chat Input */}
            <div className="chat-input-area">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={sendingMessage}
                />
                <button
                  className="btn btn-purple"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEW DESIGN WORKFLOW MODALS ===== */}

      {/* Design Progress Modal */}
      {showDesignModal && selectedOrder && createPortal(
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-palette me-2"></i>
                  Update Design Progress
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDesignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Update your design progress. When complete, submit for manager
                  approval.
                </div>

                <div className="order-info mb-4 p-3 bg-light rounded">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Order</small>
                      <div className="fw-bold">
                        #
                        {selectedOrder.orderNumber ||
                          selectedOrder._id.substring(0, 8)}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Customer</small>
                      <div className="fw-bold">
                        {selectedOrder.userId?.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Milestones */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-flag-checkered me-2"></i>
                    Design Milestones
                  </label>
                  <div className="row g-2">
                    {DESIGN_MILESTONES.map((milestone, idx) => (
                      <div key={idx} className="col-6">
                        <div
                          className={`card ${
                            designProgress >= milestone.percentage
                              ? "bg-success text-white"
                              : "bg-light"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setDesignProgress(milestone.percentage);
                            setDesignNote(milestone.name);
                          }}
                        >
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="fw-bold">
                                  {milestone.name}
                                </small>
                              </div>
                              <div>
                                <span className="badge bg-dark">
                                  {milestone.percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Progress Slider */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Design Progress:{" "}
                    <span className="text-info">{designProgress}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    step="25"
                    value={designProgress}
                    onChange={(e) => setDesignProgress(Number(e.target.value))}
                  />
                  <div className="progress mt-2" style={{ height: "20px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                      style={{ width: `${designProgress}%` }}
                    >
                      {designProgress}%
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-sticky-note me-2"></i>
                    Note (optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={designNote}
                    onChange={(e) => setDesignNote(e.target.value)}
                    placeholder="Add notes about this design update..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDesignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-info"
                  onClick={handleUpdateDesignProgress}
                  disabled={savingProgress}
                >
                  {savingProgress ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Progress
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Submit Design for Approval Modal */}
      {showSubmitDesignModal && selectedOrder && createPortal(
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-check-circle me-2"></i>
                  Submit Design for Approval
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSubmitDesignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Once submitted, the customer will review your design. Upload
                  design files so they can see and approve your work.
                </div>

                <div className="order-info mb-3 p-3 bg-light rounded">
                  <div className="row">
                    <div className="col-12">
                      <small className="text-muted">Order</small>
                      <div className="fw-bold">
                        #
                        {selectedOrder.orderNumber ||
                          selectedOrder._id.substring(0, 8)}
                      </div>
                    </div>
                    <div className="col-12 mt-2">
                      <small className="text-muted">Design Progress</small>
                      <div className="progress mt-1" style={{ height: "20px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${selectedOrder.designProgress || 0}%`,
                          }}
                        >
                          {selectedOrder.designProgress || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-upload me-2"></i>
                    Upload Design Files *
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    disabled={uploadingFiles || designFiles.length >= 5}
                  />
                  <small className="text-muted">
                    Upload images or PDF files (Max 5 files, 5MB each)
                  </small>

                  {/* Preview uploaded files */}
                  {designFiles.length > 0 && (
                    <div className="mt-3">
                      <div className="d-flex flex-wrap gap-2">
                        {designFiles.map((file, index) => (
                          <div
                            key={index}
                            className="position-relative border rounded p-2"
                            style={{ width: "120px" }}
                          >
                            {file.type === "image" ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="img-fluid rounded"
                                style={{
                                  height: "80px",
                                  objectFit: "cover",
                                  width: "100%",
                                }}
                              />
                            ) : (
                              <div className="text-center p-3 bg-light rounded">
                                <i className="fas fa-file-pdf fa-3x text-danger"></i>
                              </div>
                            )}
                            <button
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onClick={() => removeFile(index)}
                              style={{
                                width: "24px",
                                height: "24px",
                                padding: "0",
                                fontSize: "12px",
                              }}
                            >
                              ×
                            </button>
                            <small className="d-block text-truncate mt-1">
                              {file.name}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-comment me-2"></i>
                    Submission Notes
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={designSubmissionNotes}
                    onChange={(e) => setDesignSubmissionNotes(e.target.value)}
                    placeholder="Add any final notes about the design for the customer..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitDesignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSubmitDesign}
                  disabled={designFiles.length === 0 || uploadingFiles}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  {uploadingFiles ? "Uploading..." : "Submit to Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== END DESIGN WORKFLOW MODALS ===== */}

      {/* Progress Update Modal with Milestones */}
      {showProgressModal && selectedOrder && createPortal(
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-tasks me-2"></i>
                  Update Production Progress
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProgressModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="order-info mb-4 p-3 bg-light rounded">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">Order</small>
                      <div className="fw-bold">
                        #{selectedOrder._id.substring(0, 8)}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Customer</small>
                      <div className="fw-bold">
                        {selectedOrder.userId?.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-flag-checkered me-2"></i>
                    Select Milestone
                  </label>
                  <div className="milestone-grid">
                    {productionMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`milestone-item ${
                          selectedMilestone?.id === milestone.id
                            ? "selected"
                            : ""
                        } ${
                          (selectedOrder.progressPercentage || 0) >=
                          milestone.percentage
                            ? "completed"
                            : ""
                        }`}
                        onClick={() => handleMilestoneSelect(milestone)}
                      >
                        <div className="milestone-icon">
                          <i className={`fas fa-${milestone.icon}`}></i>
                        </div>
                        <div className="milestone-info">
                          <div className="milestone-name">{milestone.name}</div>
                          <div className="milestone-percentage">
                            {milestone.percentage}%
                          </div>
                        </div>
                        {(selectedOrder.progressPercentage || 0) >=
                          milestone.percentage && (
                          <i className="fas fa-check-circle text-success milestone-check"></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Progress Slider */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Or Set Manual Progress:{" "}
                    <span className="text-primary">{progressValue}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressValue}
                    onChange={(e) => {
                      setProgressValue(Number(e.target.value));
                      setSelectedMilestone(null);
                    }}
                  />
                  <div className="progress mt-2" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated bg-${getProgressColor(
                        progressValue,
                      )}`}
                      style={{ width: `${progressValue}%` }}
                    >
                      {progressValue}%
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-sticky-note me-2"></i>
                    Note for Customer (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add a note about the progress that will be shared with the customer..."
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Send update to customer toggle */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifyCustomer"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="notifyCustomer">
                    <i className="fas fa-bell me-1"></i>
                    Notify customer about this progress update
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProgressModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateProgress}
                >
                  <i className="fas fa-save me-2"></i>
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Complete Production Modal */}
      {showCompleteModal && selectedOrder && createPortal(
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-check-double me-2"></i>
                  Complete Production
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCompleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="success-icon mb-3">
                    <i className="fas fa-check-circle fa-4x text-success"></i>
                  </div>
                  <h5>Great work! 🎉</h5>
                  <p className="text-muted">
                    Order <strong>#{selectedOrder._id.substring(0, 8)}</strong>{" "}
                    is ready to be marked as complete.
                  </p>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This will:
                  <ul className="mb-0 mt-2">
                    <li>Mark the order as production completed</li>
                    <li>Notify the manager for delivery assignment</li>
                    <li>Send a completion message to the customer</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Final Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add any notes about the completed work..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCompleteProduction}
                >
                  <i className="fas fa-check-double me-2"></i>
                  Complete Production
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Shop Status Change Confirmation Modal */}
      {showStatusModal && pendingStatus && createPortal(
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg status-change-modal">
              <div
                className={`modal-header bg-${getStatusLabel(pendingStatus).color} text-white`}
              >
                <h5 className="modal-title">
                  <i
                    className={`fas fa-${getStatusLabel(pendingStatus).icon} me-2`}
                  ></i>
                  Change Shop Status
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowStatusModal(false);
                    setPendingStatus(null);
                  }}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="status-change-icon mb-4">
                  <div
                    className={`status-icon-circle bg-${getStatusLabel(pendingStatus).color}-soft`}
                  >
                    <i
                      className={`fas fa-${getStatusLabel(pendingStatus).icon} fa-3x text-${getStatusLabel(pendingStatus).color}`}
                    ></i>
                  </div>
                </div>
                <h5 className="mb-3">Change Status to</h5>
                <div
                  className={`status-badge-large bg-${getStatusLabel(pendingStatus).color} text-white mb-4`}
                >
                  <i
                    className={`fas fa-${getStatusLabel(pendingStatus).icon} me-2`}
                  ></i>
                  {getStatusLabel(pendingStatus).label}
                </div>
                <div className="status-info-box p-3 rounded mb-3">
                  {pendingStatus === "available" && (
                    <p className="mb-0 text-muted">
                      <i className="fas fa-info-circle me-2 text-success"></i>
                      Your shop will be visible to customers and you can receive
                      new orders.
                    </p>
                  )}
                  {pendingStatus === "busy" && (
                    <p className="mb-0 text-muted">
                      <i className="fas fa-info-circle me-2 text-warning"></i>
                      Customers can still view your shop, but will see you're
                      currently busy.
                    </p>
                  )}
                  {pendingStatus === "not_accepting" && (
                    <p className="mb-0 text-muted">
                      <i className="fas fa-info-circle me-2 text-danger"></i>
                      Your shop will be marked as closed. New customers cannot
                      place orders.
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer justify-content-center border-0 pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => {
                    setShowStatusModal(false);
                    setPendingStatus(null);
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-${getStatusLabel(pendingStatus).color} px-4`}
                  onClick={confirmStatusChange}
                  disabled={updatingAvailability}
                >
                  {updatingAvailability ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Confirm Change
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;
