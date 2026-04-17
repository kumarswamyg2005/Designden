"use strict";

function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getOrderStatusLabel(status) {
  const map = {
    pending: "Pending",
    assigned_to_manager: "Processing",
    assigned_to_designer: "Assigned to Designer",
    designer_accepted: "Designer Working",
    design_in_progress: "Design In Progress",
    design_pending_customer_approval: "Design Awaiting Your Approval",
    design_approved_by_customer: "Design Approved",
    design_rejected_by_customer: "Revision Requested",
    design_ready: "Design Under Manager Review",
    design_approved: "Design Approved — Going to Production",
    in_production: "In Production",
    production_completed: "Production Done",
    ready_for_pickup: "Out for Delivery Soon",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status?.replace(/_/g, " ") || "Unknown";
}

function isCustomOrder(order) {
  return order.orderType === "custom" ||
    (order.items || []).some((i) => i.designId && !i.productId);
}

function canCustomerApproveDesign(order) {
  return order.status === "design_pending_customer_approval";
}

function generateOrderNumber(dateStr, count) {
  return `DD-${dateStr}-${String(count + 1).padStart(4, "0")}`;
}

function estimatePrice({ basePrice = 500, fabric, graphic, customText }) {
  let price = basePrice;
  if (fabric === "silk") price += 500;
  if (fabric === "linen") price += 300;
  if (graphic) price += 200;
  if (customText) price += 100;
  return price;
}

function buildProductCacheKey(query) {
  return `products:${JSON.stringify(query)}`;
}

module.exports = {
  formatPrice,
  getOrderStatusLabel,
  isCustomOrder,
  canCustomerApproveDesign,
  generateOrderNumber,
  estimatePrice,
  buildProductCacheKey,
};
