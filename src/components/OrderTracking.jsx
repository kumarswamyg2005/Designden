/**
 * OrderTracking Component
 * Displays detailed order tracking timeline with visual progress
 * Shows different workflows for shop orders vs custom design orders
 * NOW INCLUDES: Design approval workflow for custom orders
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompleteTracking,
  selectTrackingData,
  selectOrdersLoading,
} from "../store/slices/ordersSlice";
import LoadingSpinner from "./LoadingSpinner";
import { shouldUseDesignWorkflow } from "../utils/designWorkflow";
import { customerAPI } from "../services/api";
import { useFlash } from "../context/FlashContext";
import "./OrderTracking.css";

const OrderTracking = ({ orderId }) => {
  const dispatch = useDispatch();
  const trackingData = useSelector(selectTrackingData);
  const loading = useSelector(selectOrdersLoading);
  const { showFlash } = useFlash();
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (orderId) {
      dispatch(fetchCompleteTracking(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!trackingData) {
    return (
      <div className="tracking-empty">
        <p>No tracking information available</p>
      </div>
    );
  }

  const isCustomOrder = trackingData.orderType === "Custom Design";
  const usesDesignWorkflow = shouldUseDesignWorkflow(trackingData);

  // Define workflow steps based on order type
  // These must match the actual statuses used in the database
  const shopWorkflow = [
    { status: "pending", label: "Order Placed", icon: "🛒" },
    { status: "assigned_to_manager", label: "Received by Manager", icon: "👔" },
    { status: "ready_for_pickup", label: "Ready for Delivery", icon: "📦" },
    { status: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
    { status: "delivered", label: "Delivered", icon: "✅" },
  ];

  // Legacy custom workflow (no design approval)
  const customWorkflowLegacy = [
    { status: "pending", label: "Order Placed", icon: "🛒" },
    { status: "assigned_to_manager", label: "Received by Manager", icon: "👔" },
    {
      status: "assigned_to_designer",
      label: "Assigned to Designer",
      icon: "👨‍🎨",
    },
    { status: "designer_accepted", label: "Designer Accepted", icon: "✔️" },
    { status: "in_production", label: "In Production", icon: "⚙️" },
    {
      status: "production_completed",
      label: "Production Complete",
      icon: "✨",
    },
    { status: "ready_for_pickup", label: "Ready for Delivery", icon: "📦" },
    { status: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
    { status: "delivered", label: "Delivered", icon: "✅" },
  ];

  // NEW: Custom workflow with design approval
  const customWorkflowWithApproval = [
    { status: "pending", label: "Order Placed", icon: "🛒" },
    { status: "assigned_to_manager", label: "Received by Manager", icon: "👔" },
    {
      status: "assigned_to_designer",
      label: "Assigned to Designer",
      icon: "👨‍🎨",
    },
    { status: "designer_accepted", label: "Designer Accepted", icon: "✔️" },
    { status: "design_in_progress", label: "Design in Progress", icon: "🎨" },
    {
      status: "design_pending_customer_approval",
      label: "Awaiting Your Approval",
      icon: "⏳",
    },
    {
      status: "design_approved_by_customer",
      label: "You Approved Design",
      icon: "👍",
    },
    { status: "design_ready", label: "Submitted to Manager", icon: "📋" },
    { status: "design_approved", label: "Manager Approved", icon: "✅" },
    { status: "in_production", label: "Production Started", icon: "⚙️" },
    {
      status: "production_completed",
      label: "Production Complete",
      icon: "✨",
    },
    { status: "ready_for_pickup", label: "Ready for Delivery", icon: "📦" },
    { status: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
    { status: "delivered", label: "Delivered", icon: "✅" },
  ];

  const workflow = isCustomOrder
    ? usesDesignWorkflow
      ? customWorkflowWithApproval
      : customWorkflowLegacy
    : shopWorkflow;

  // Map status to workflow index - handles statuses that aren't directly in workflow
  const getStatusIndex = (status) => {
    // Direct match
    const directIndex = workflow.findIndex((step) => step.status === status);
    if (directIndex !== -1) return directIndex;

    // Map intermediate statuses to their logical position
    const statusMapping = {
      // Design workflow statuses
      design_pending_customer_approval: workflow.findIndex(
        (s) => s.status === "design_in_progress",
      ),
      design_approved_by_customer: workflow.findIndex(
        (s) => s.status === "design_ready",
      ),
      design_rejected_by_customer: workflow.findIndex(
        (s) => s.status === "design_in_progress",
      ),
      design_rejected: workflow.findIndex(
        (s) => s.status === "design_in_progress",
      ),
      production_milestone: workflow.findIndex(
        (s) => s.status === "in_production",
      ),
      // These statuses come after ready_for_pickup but before out_for_delivery
      picked_up: workflow.findIndex((s) => s.status === "out_for_delivery"),
      in_transit: workflow.findIndex((s) => s.status === "out_for_delivery"),
      // Legacy status mappings
      assigned: workflow.findIndex((s) => s.status === "assigned_to_manager"),
      shipped: workflow.findIndex((s) => s.status === "out_for_delivery"),
      completed: workflow.findIndex((s) => s.status === "delivered"),
    };

    return statusMapping[status] ?? -1;
  };

  // Get current status index
  const currentStatusIndex = getStatusIndex(trackingData.currentStatus);

  // Debug logging
  console.log("OrderTracking Debug:", {
    currentStatus: trackingData.currentStatus,
    currentStatusIndex,
    isCustomOrder,
    workflowLength: workflow.length,
  });

  // Check if status is completed
  const isStatusCompleted = (index) => {
    if (trackingData.currentStatus === "cancelled") return false;
    if (currentStatusIndex === -1) return false;
    return index <= currentStatusIndex;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle customer approve design
  const handleApproveDesign = async () => {
    if (
      !confirm(
        "Are you sure you want to approve this design? This will allow production to begin.",
      )
    )
      return;

    setApprovalLoading(true);
    try {
      await customerAPI.approveDesign(orderId);
      showFlash("Design approved successfully!", "success");
      dispatch(fetchCompleteTracking(orderId)); // Refresh tracking
    } catch (error) {
      console.error("Approve design error:", error);
      showFlash(
        error.response?.data?.message || "Failed to approve design",
        "error",
      );
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle customer reject design
  const handleRejectDesign = async () => {
    if (!rejectReason.trim()) {
      showFlash("Please provide a reason for rejection", "error");
      return;
    }

    setApprovalLoading(true);
    try {
      await customerAPI.rejectDesign(orderId, rejectReason);
      showFlash("Revision requested successfully", "success");
      setShowRejectModal(false);
      setRejectReason("");
      dispatch(fetchCompleteTracking(orderId)); // Refresh tracking
    } catch (error) {
      console.error("Reject design error:", error);
      showFlash(
        error.response?.data?.message || "Failed to request revision",
        "error",
      );
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <div className="order-tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <h3>Order Tracking</h3>
        <div className="tracking-meta">
          <span className="order-number">#{trackingData.orderNumber}</span>
          <span className={`order-type ${isCustomOrder ? "custom" : "shop"}`}>
            {trackingData.orderType}
          </span>
          <span className={`order-status status-${trackingData.currentStatus}`}>
            {trackingData.currentStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Progress Bars (for custom orders with design workflow) */}
      {isCustomOrder && usesDesignWorkflow && (
        <div className="progress-section">
          {/* Design Progress */}
          {trackingData.designProgress !== undefined &&
            trackingData.designProgress > 0 && (
              <div className="mb-3">
                <div className="progress-label">
                  <span>
                    <i className="fas fa-palette me-2"></i>
                    Design Progress
                  </span>
                  <span className="progress-percentage">
                    {trackingData.designProgress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${trackingData.designProgress}%`,
                      backgroundColor: "#17a2b8",
                    }}
                  ></div>
                </div>
                {trackingData.designProgress >= 100 && (
                  <small className="text-success">
                    <i className="fas fa-check-circle me-1"></i>
                    {trackingData.currentStatus === "design_ready" &&
                      "Design submitted - Awaiting approval"}
                    {trackingData.currentStatus === "design_approved" &&
                      "Design approved"}
                    {trackingData.currentStatus === "design_rejected" &&
                      "Design needs revision"}
                    {![
                      "design_ready",
                      "design_approved",
                      "design_rejected",
                    ].includes(trackingData.currentStatus) && "Design complete"}
                  </small>
                )}
              </div>
            )}

          {/* Production Progress */}
          {trackingData.progressPercentage > 0 && (
            <div>
              <div className="progress-label">
                <span>
                  <i className="fas fa-industry me-2"></i>
                  Production Progress
                </span>
                <span className="progress-percentage">
                  {trackingData.progressPercentage}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${trackingData.progressPercentage}%`,
                    backgroundColor: "#28a745",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar (for legacy custom orders without design workflow) */}
      {isCustomOrder &&
        !usesDesignWorkflow &&
        trackingData.progressPercentage > 0 && (
          <div className="progress-section">
            <div className="progress-label">
              <span>Production Progress</span>
              <span className="progress-percentage">
                {trackingData.progressPercentage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${trackingData.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

      {/* Design Rejection Notice */}
      {trackingData.currentStatus === "design_rejected" &&
        trackingData.designApproval?.rejectionReason && (
          <div
            className="alert alert-warning border-warning mb-4"
            style={{
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #ffc107",
              padding: "15px",
            }}
          >
            <h5 className="mb-2" style={{ color: "#856404" }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              Design Requires Revision
            </h5>
            <p className="mb-1" style={{ color: "#856404" }}>
              <strong>Feedback:</strong>{" "}
              {trackingData.designApproval.rejectionReason}
            </p>
            <small className="text-muted d-block mt-2">
              <i className="fas fa-info-circle me-1"></i>
              Our designer is working on revisions based on manager feedback.
            </small>
          </div>
        )}

      {/* Customer Design Approval Section */}
      {trackingData.currentStatus === "design_pending_customer_approval" && (
        <div
          className="alert alert-info border-info mb-4"
          style={{
            backgroundColor: "#d1ecf1",
            borderLeft: "4px solid #17a2b8",
            padding: "20px",
          }}
        >
          <h5 className="mb-3" style={{ color: "#0c5460" }}>
            <i className="fas fa-check-circle me-2"></i>
            Your Design is Ready for Approval!
          </h5>

          {/* Display Design Files */}
          {trackingData.designFiles && trackingData.designFiles.length > 0 && (
            <div className="mb-3">
              <h6 style={{ color: "#0c5460" }}>
                <i className="fas fa-images me-2"></i>
                Design Files:
              </h6>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {trackingData.designFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded p-2 bg-white"
                    style={{ maxWidth: "200px" }}
                  >
                    {file.type === "image" ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="img-fluid rounded"
                          style={{ maxHeight: "150px", cursor: "pointer" }}
                        />
                      </a>
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <div className="text-center p-3">
                          <i className="fas fa-file-pdf fa-3x text-danger"></i>
                        </div>
                      </a>
                    )}
                    <small
                      className="d-block text-truncate mt-2 text-center"
                      style={{ fontSize: "0.85em" }}
                    >
                      {file.name}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mb-3" style={{ color: "#0c5460" }}>
            The designer has completed your custom design. Please review the
            design files carefully before approving. Once approved, the design
            will be sent to our manager for final production approval.
          </p>
          <div className="d-flex gap-3">
            <button
              className="btn btn-success"
              onClick={handleApproveDesign}
              disabled={approvalLoading}
              style={{
                padding: "10px 30px",
                fontWeight: "500",
              }}
            >
              {approvalLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-thumbs-up me-2"></i>
                  Approve Design
                </>
              )}
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setShowRejectModal(true)}
              disabled={approvalLoading}
              style={{
                padding: "10px 30px",
                fontWeight: "500",
              }}
            >
              <i className="fas fa-undo me-2"></i>
              Request Revision
            </button>
          </div>
        </div>
      )}

      {/* Customer Approved Notice */}
      {trackingData.currentStatus === "design_approved_by_customer" && (
        <div
          className="alert alert-success border-success mb-4"
          style={{
            backgroundColor: "#d4edda",
            borderLeft: "4px solid #28a745",
            padding: "15px",
          }}
        >
          <h5 className="mb-2" style={{ color: "#155724" }}>
            <i className="fas fa-check-circle me-2"></i>
            You Approved This Design
          </h5>
          <p className="mb-0" style={{ color: "#155724" }}>
            The designer will submit this to our manager for final approval
            before production begins.
          </p>
        </div>
      )}

      {/* Customer Rejection Notice */}
      {trackingData.currentStatus === "design_rejected_by_customer" &&
        trackingData.designRejection?.reason && (
          <div
            className="alert alert-warning border-warning mb-4"
            style={{
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #ffc107",
              padding: "15px",
            }}
          >
            <h5 className="mb-2" style={{ color: "#856404" }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              Revision Requested
            </h5>
            <p className="mb-1" style={{ color: "#856404" }}>
              <strong>Your Feedback:</strong>{" "}
              {trackingData.designRejection.reason}
            </p>
            <small className="text-muted d-block mt-2">
              <i className="fas fa-info-circle me-1"></i>
              Our designer is working on your requested changes.
            </small>
          </div>
        )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Design Revision</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">
                  Please explain what changes you'd like:
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Please change the color scheme to blue, adjust the logo size..."
                  disabled={approvalLoading}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={approvalLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleRejectDesign}
                  disabled={approvalLoading || !rejectReason.trim()}
                >
                  {approvalLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Revision Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Display - Show when delivery is active */}
      {trackingData.otp &&
        [
          "ready_for_pickup",
          "picked_up",
          "in_transit",
          "out_for_delivery",
        ].includes(trackingData.currentStatus) && (
          <div className="otp-display-section">
            <div
              className="alert alert-warning border-warning"
              style={{
                backgroundColor: "#fff3cd",
                borderLeft: "4px solid #ffc107",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <h4 className="mb-2" style={{ color: "#856404" }}>
                    <i className="fas fa-shield-alt me-2"></i>
                    Delivery OTP
                  </h4>
                  <p className="mb-0" style={{ color: "#856404" }}>
                    Share this OTP with the delivery person for successful
                    delivery
                  </p>
                </div>
                <div
                  className="text-center"
                  style={{
                    backgroundColor: "#fff",
                    padding: "15px 30px",
                    borderRadius: "8px",
                    border: "2px dashed #ffc107",
                    minWidth: "150px",
                  }}
                >
                  <small className="d-block text-muted mb-1">Your OTP</small>
                  <h2
                    className="mb-0 fw-bold"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                      letterSpacing: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    {trackingData.otp}
                  </h2>
                </div>
              </div>
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid #ffc107" }}
              >
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  This OTP is required for delivery verification. Keep it ready
                  when the delivery person arrives.
                </small>
              </div>
            </div>
          </div>
        )}

      {/* Visual Timeline */}
      <div className="tracking-timeline">
        {workflow.map((step, index) => {
          const isCompleted = isStatusCompleted(index);
          const isCurrent = index === currentStatusIndex;

          return (
            <div
              key={step.status}
              className={`timeline-step ${isCompleted ? "completed" : ""} ${
                isCurrent ? "current" : ""
              }`}
              style={{
                opacity: isCompleted || isCurrent ? 1 : 0.5,
              }}
            >
              <div
                className="timeline-icon"
                style={{
                  background: isCompleted
                    ? "#d1e7dd"
                    : isCurrent
                      ? "#cfe2ff"
                      : "#e9ecef",
                  borderColor: isCompleted
                    ? "#2ecc71"
                    : isCurrent
                      ? "#3498db"
                      : "#dee2e6",
                  borderWidth: "3px",
                  borderStyle: "solid",
                }}
              >
                {step.icon}
              </div>
              <div className="timeline-content">
                <h4
                  style={{
                    color: isCompleted || isCurrent ? "#2c3e50" : "#6c757d",
                  }}
                >
                  {step.label}
                </h4>
                {isCompleted && (
                  <p className="timeline-time">
                    {formatDate(
                      getTimestampForStatus(step.status, trackingData),
                    )}
                  </p>
                )}
              </div>
              {index < workflow.length - 1 && (
                <div
                  className={`timeline-connector ${
                    isCompleted ? "completed" : ""
                  }`}
                  style={{
                    background: isCompleted ? "#2ecc71" : "#dee2e6",
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Timeline History */}
      {trackingData.timeline && trackingData.timeline.length > 0 && (
        <div className="timeline-history">
          <h4>Order History</h4>
          <div className="history-list">
            {trackingData.timeline
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={index} className="history-item">
                  <div className="history-time">{formatDate(event.at)}</div>
                  <div className="history-details">
                    <span className="history-status">
                      {event.status.replace(/_/g, " ")}
                    </span>
                    {event.note && <p className="history-note">{event.note}</p>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {trackingData.shippingAddress && (
        <div className="shipping-info">
          <h4>Delivery Address</h4>
          <p>{trackingData.shippingAddress.name}</p>
          <p>{trackingData.shippingAddress.street}</p>
          <p>
            {trackingData.shippingAddress.city},{" "}
            {trackingData.shippingAddress.state}{" "}
            {trackingData.shippingAddress.zipCode}
          </p>
          <p>Phone: {trackingData.shippingAddress.phone}</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get timestamp for a specific status
const getTimestampForStatus = (status, trackingData) => {
  const { timestamps, timeline } = trackingData;

  // Check timestamps object first
  switch (status) {
    case "pending":
      return timestamps?.orderPlaced;
    case "assigned_to_manager":
      return timestamps?.managerAssigned;
    case "assigned_to_designer":
      return timestamps?.designerAssigned;
    case "designer_accepted":
      return timestamps?.designerAccepted;
    case "design_in_progress":
      return timestamps?.designStarted || timestamps?.designerAccepted;
    case "design_pending_customer_approval":
      return trackingData.designSubmittedAt;
    case "design_approved_by_customer":
      return trackingData.customerApprovedAt;
    case "design_rejected_by_customer":
      return trackingData.customerRejectedAt;
    case "design_ready":
      return (
        trackingData.designSubmittedAt || timestamps?.managerApprovalRequested
      );
    case "design_approved":
      return trackingData.designApprovedAt;
    case "design_rejected":
      return trackingData.designRejectedAt;
    case "in_production":
      return timestamps?.productionStarted;
    case "production_completed":
      return timestamps?.productionCompleted;
    case "ready_for_pickup":
    case "ready_for_delivery":
      return timestamps?.deliveryAssigned;
    default:
      break;
  }

  // Fall back to timeline
  if (timeline) {
    const timelineEvent = timeline.find((event) => event.status === status);
    return timelineEvent?.at;
  }
  return null;
};

export default OrderTracking;
