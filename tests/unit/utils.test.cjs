/**
 * Unit tests for core utility functions - DesignDen
 */

// ─── Price / Currency helpers ────────────────────────────────────────────────
function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Order status helpers (mirrors server logic) ─────────────────────────────
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

// ─── Cache key helpers ───────────────────────────────────────────────────────
function buildProductCacheKey(query) {
  return `products:${JSON.stringify(query)}`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("formatPrice", () => {
  test("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });
  test("formats positive amount", () => {
    expect(formatPrice(1200)).toContain("1,200");
  });
  test("handles null", () => {
    expect(formatPrice(null)).toBe("₹0");
  });
  test("handles undefined", () => {
    expect(formatPrice(undefined)).toBe("₹0");
  });
  test("handles NaN", () => {
    expect(formatPrice(NaN)).toBe("₹0");
  });
  test("includes rupee symbol", () => {
    expect(formatPrice(500)).toMatch(/₹|Rs|INR/);
  });
});

describe("getOrderStatusLabel", () => {
  test("known status returns label", () => {
    expect(getOrderStatusLabel("pending")).toBe("Pending");
  });
  test("delivered maps correctly", () => {
    expect(getOrderStatusLabel("delivered")).toBe("Delivered");
  });
  test("unknown status humanizes underscore", () => {
    expect(getOrderStatusLabel("some_unknown_status")).toBe("some unknown status");
  });
  test("null returns Unknown", () => {
    expect(getOrderStatusLabel(null)).toBe("Unknown");
  });
  test("design workflow status", () => {
    expect(getOrderStatusLabel("design_pending_customer_approval")).toContain("Approval");
  });
  test("production status", () => {
    expect(getOrderStatusLabel("in_production")).toBe("In Production");
  });
});

describe("isCustomOrder", () => {
  test("orderType custom", () => {
    expect(isCustomOrder({ orderType: "custom", items: [] })).toBe(true);
  });
  test("orderType shop", () => {
    expect(isCustomOrder({ orderType: "shop", items: [{ productId: "abc" }] })).toBe(false);
  });
  test("items with designId and no productId", () => {
    expect(isCustomOrder({ items: [{ designId: "x" }] })).toBe(true);
  });
  test("items with both ids", () => {
    expect(isCustomOrder({ items: [{ designId: "x", productId: "y" }] })).toBe(false);
  });
});

describe("canCustomerApproveDesign", () => {
  test("returns true for pending approval", () => {
    expect(canCustomerApproveDesign({ status: "design_pending_customer_approval" })).toBe(true);
  });
  test("returns false for other statuses", () => {
    expect(canCustomerApproveDesign({ status: "in_production" })).toBe(false);
    expect(canCustomerApproveDesign({ status: "delivered" })).toBe(false);
    expect(canCustomerApproveDesign({ status: "pending" })).toBe(false);
  });
});

describe("generateOrderNumber", () => {
  test("generates DD prefix", () => {
    expect(generateOrderNumber("20240417", 0)).toMatch(/^DD-20240417-\d{4}$/);
  });
  test("pads count correctly", () => {
    expect(generateOrderNumber("20240417", 0)).toBe("DD-20240417-0001");
    expect(generateOrderNumber("20240417", 9)).toBe("DD-20240417-0010");
  });
  test("handles large count", () => {
    expect(generateOrderNumber("20240417", 999)).toBe("DD-20240417-1000");
  });
});

describe("estimatePrice", () => {
  test("base price only", () => {
    expect(estimatePrice({ basePrice: 500 })).toBe(500);
  });
  test("silk fabric adds 500", () => {
    expect(estimatePrice({ basePrice: 500, fabric: "silk" })).toBe(1000);
  });
  test("linen fabric adds 300", () => {
    expect(estimatePrice({ basePrice: 500, fabric: "linen" })).toBe(800);
  });
  test("graphic adds 200", () => {
    expect(estimatePrice({ basePrice: 500, graphic: "logo.png" })).toBe(700);
  });
  test("custom text adds 100", () => {
    expect(estimatePrice({ basePrice: 500, customText: "Hello" })).toBe(600);
  });
  test("all addons combined", () => {
    expect(estimatePrice({ basePrice: 500, fabric: "silk", graphic: "x", customText: "y" })).toBe(1300);
  });
});

describe("buildProductCacheKey", () => {
  test("same query = same key", () => {
    const q = { category: "tshirt", gender: "men" };
    expect(buildProductCacheKey(q)).toBe(buildProductCacheKey(q));
  });
  test("different query = different key", () => {
    expect(buildProductCacheKey({ category: "a" })).not.toBe(buildProductCacheKey({ category: "b" }));
  });
  test("key has products prefix", () => {
    expect(buildProductCacheKey({})).toMatch(/^products:/);
  });
});
