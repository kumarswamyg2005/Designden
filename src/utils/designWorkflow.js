// Design Workflow Helper - Determines if order should use new design workflow
export const shouldUseDesignWorkflow = (order) => {
  if (!order) return false;

  // New design workflow ONLY for custom orders
  return (
    order.orderType === "custom" ||
    (order.items &&
      order.items.some((item) => item.designId && !item.productId))
  );
};

// Check if designer is in design phase
export const isDesignPhase = (order) => {
  if (!shouldUseDesignWorkflow(order)) return false;

  const designPhaseStatuses = [
    "designer_accepted",
    "design_in_progress",
    "design_ready",
    "design_rejected",
    "design_pending_customer_approval",
    "design_approved_by_customer",
    "design_rejected_by_customer",
  ];

  return designPhaseStatuses.includes(order.status);
};

// Check if manager is handling production
export const isProductionPhase = (order) => {
  if (!shouldUseDesignWorkflow(order)) return false;

  const productionPhaseStatuses = [
    "design_approved",
    "in_production",
    "production_milestone",
    "production_completed",
  ];

  return productionPhaseStatuses.includes(order.status);
};

// Check if design is awaiting approval
export const isAwaitingApproval = (order) => {
  return (
    order?.status === "design_ready" &&
    order?.designApproval?.status === "pending"
  );
};

// Check if design was rejected
export const wasDesignRejected = (order) => {
  return (
    order?.status === "design_rejected" ||
    order?.designApproval?.status === "rejected"
  );
};

// Get current workflow phase for order
export const getOrderPhase = (order) => {
  if (!order) return "unknown";

  if (!shouldUseDesignWorkflow(order)) {
    return "legacy"; // Uses old workflow (ready-made orders)
  }

  if (isDesignPhase(order)) {
    return "design";
  }

  if (isProductionPhase(order)) {
    return "production";
  }

  // Assignment/pending phase
  if (
    [
      "pending",
      "assigned_to_manager",
      "confirmed",
      "processing",
      "assigned_to_designer",
    ].includes(order.status)
  ) {
    return "assignment";
  }

  // Delivery/completion phase
  if (
    [
      "ready_for_pickup",
      "picked_up",
      "in_transit",
      "out_for_delivery",
      "delivered",
    ].includes(order.status)
  ) {
    return "delivery";
  }

  return "other";
};

// Get status display text
export const getDesignStatusText = (order) => {
  if (!order) return "";

  switch (order.status) {
    case "designer_accepted":
      return "Ready to Start Design";
    case "design_in_progress":
      return `Design in Progress (${order.designProgress || 0}%)`;
    case "design_ready":
      return "Design Awaiting Approval";
    case "design_rejected":
      return `Design Rejected - Needs Revision (Attempt ${(order.designApproval?.revisionCount || 0) + 1})`;
    case "design_approved":
      return "Design Approved - Production Starting";
    case "in_production":
      return `In Production (${order.progressPercentage || 0}%)`;
    case "production_completed":
      return "Production Complete";
    default:
      return order.status
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

// Design milestones for progress tracking
export const DESIGN_MILESTONES = [
  { name: "Initial Concept", percentage: 25 },
  { name: "Design Draft", percentage: 50 },
  { name: "Refinement", percentage: 75 },
  { name: "Final Design", percentage: 100 },
];

// Production milestones (for manager)
export const PRODUCTION_MILESTONES = [
  { name: "Material Procurement", percentage: 12 },
  { name: "Pattern Making", percentage: 25 },
  { name: "Cutting", percentage: 37 },
  { name: "Stitching", percentage: 50 },
  { name: "Assembly", percentage: 62 },
  { name: "Quality Check", percentage: 75 },
  { name: "Finishing", percentage: 87 },
  { name: "Final QC & Packaging", percentage: 100 },
];

export default {
  shouldUseDesignWorkflow,
  isDesignPhase,
  isProductionPhase,
  isAwaitingApproval,
  wasDesignRejected,
  getOrderPhase,
  getDesignStatusText,
  DESIGN_MILESTONES,
  PRODUCTION_MILESTONES,
};
