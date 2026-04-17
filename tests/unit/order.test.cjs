/**
 * Unit tests for order workflow logic - DesignDen
 */

// ─── Order workflow state machine ────────────────────────────────────────────
const ORDER_WORKFLOW = {
  pending: ["assigned_to_manager", "cancelled"],
  assigned_to_manager: ["assigned_to_designer", "cancelled"],
  assigned_to_designer: ["designer_accepted", "cancelled"],
  designer_accepted: ["design_in_progress"],
  design_in_progress: ["design_pending_customer_approval"],
  design_pending_customer_approval: ["design_approved_by_customer", "design_rejected_by_customer"],
  design_approved_by_customer: ["design_ready"],
  design_rejected_by_customer: ["design_in_progress"],
  design_ready: ["design_approved", "design_rejected"],
  design_approved: ["in_production"],
  design_rejected: ["design_in_progress"],
  in_production: ["production_completed"],
  production_completed: ["ready_for_pickup"],
  ready_for_pickup: ["picked_up"],
  picked_up: ["in_transit"],
  in_transit: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

function canTransition(from, to) {
  return (ORDER_WORKFLOW[from] || []).includes(to);
}

function getNextStatuses(current) {
  return ORDER_WORKFLOW[current] || [];
}

function isTerminalStatus(status) {
  return status === "delivered" || status === "cancelled";
}

function isDesignPhase(status) {
  return [
    "assigned_to_designer", "designer_accepted", "design_in_progress",
    "design_pending_customer_approval", "design_approved_by_customer",
    "design_rejected_by_customer", "design_ready", "design_approved", "design_rejected",
  ].includes(status);
}

function isDeliveryPhase(status) {
  return ["ready_for_pickup", "picked_up", "in_transit", "out_for_delivery", "delivered"].includes(status);
}

function calculateCartTotal(items) {
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
}

function validateCartItem(item) {
  const errors = [];
  if (!item.quantity || item.quantity < 1) errors.push("Invalid quantity");
  if (!item.size) errors.push("Size required");
  if (item.price < 0) errors.push("Price cannot be negative");
  return errors;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("canTransition", () => {
  test("pending → assigned_to_manager allowed", () => {
    expect(canTransition("pending", "assigned_to_manager")).toBe(true);
  });
  test("pending → delivered NOT allowed", () => {
    expect(canTransition("pending", "delivered")).toBe(false);
  });
  test("delivered → anything NOT allowed", () => {
    expect(canTransition("delivered", "cancelled")).toBe(false);
  });
  test("design_pending → approved allowed", () => {
    expect(canTransition("design_pending_customer_approval", "design_approved_by_customer")).toBe(true);
  });
  test("design_pending → rejected allowed", () => {
    expect(canTransition("design_pending_customer_approval", "design_rejected_by_customer")).toBe(true);
  });
  test("unknown status returns false", () => {
    expect(canTransition("nonexistent", "pending")).toBe(false);
  });
});

describe("getNextStatuses", () => {
  test("pending has 2 next statuses", () => {
    expect(getNextStatuses("pending")).toHaveLength(2);
  });
  test("delivered has no next statuses", () => {
    expect(getNextStatuses("delivered")).toHaveLength(0);
  });
  test("unknown returns empty array", () => {
    expect(getNextStatuses("invalid")).toHaveLength(0);
  });
});

describe("isTerminalStatus", () => {
  test("delivered is terminal", () => expect(isTerminalStatus("delivered")).toBe(true));
  test("cancelled is terminal", () => expect(isTerminalStatus("cancelled")).toBe(true));
  test("pending is not terminal", () => expect(isTerminalStatus("pending")).toBe(false));
  test("in_production is not terminal", () => expect(isTerminalStatus("in_production")).toBe(false));
});

describe("isDesignPhase", () => {
  test("design_in_progress is design phase", () => {
    expect(isDesignPhase("design_in_progress")).toBe(true);
  });
  test("in_production is NOT design phase", () => {
    expect(isDesignPhase("in_production")).toBe(false);
  });
  test("pending is NOT design phase", () => {
    expect(isDesignPhase("pending")).toBe(false);
  });
});

describe("isDeliveryPhase", () => {
  test("out_for_delivery is delivery phase", () => {
    expect(isDeliveryPhase("out_for_delivery")).toBe(true);
  });
  test("delivered is delivery phase", () => {
    expect(isDeliveryPhase("delivered")).toBe(true);
  });
  test("in_production is NOT delivery phase", () => {
    expect(isDeliveryPhase("in_production")).toBe(false);
  });
});

describe("calculateCartTotal", () => {
  test("single item", () => {
    expect(calculateCartTotal([{ price: 500, quantity: 2 }])).toBe(1000);
  });
  test("multiple items", () => {
    expect(calculateCartTotal([
      { price: 500, quantity: 1 },
      { price: 300, quantity: 3 },
    ])).toBe(1400);
  });
  test("empty cart returns 0", () => {
    expect(calculateCartTotal([])).toBe(0);
  });
  test("defaults quantity to 1", () => {
    expect(calculateCartTotal([{ price: 200 }])).toBe(200);
  });
});

describe("validateCartItem", () => {
  test("valid item returns no errors", () => {
    expect(validateCartItem({ quantity: 1, size: "M", price: 500 })).toHaveLength(0);
  });
  test("missing size returns error", () => {
    const errs = validateCartItem({ quantity: 1, price: 500 });
    expect(errs).toContain("Size required");
  });
  test("zero quantity returns error", () => {
    const errs = validateCartItem({ quantity: 0, size: "M", price: 500 });
    expect(errs).toContain("Invalid quantity");
  });
  test("negative price returns error", () => {
    const errs = validateCartItem({ quantity: 1, size: "M", price: -100 });
    expect(errs).toContain("Price cannot be negative");
  });
});
