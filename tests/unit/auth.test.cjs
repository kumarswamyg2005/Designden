"use strict";
const {
  validateEmail,
  validatePassword,
  validateRole,
  hasRole,
  isApproved,
  hashPassword,
  verifyPassword,
  sanitizeUser,
} = require("../../src/utils/authHelpers.cjs");

describe("validateEmail", () => {
  test("valid email passes", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });
  test("email without @ fails", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });
  test("email without domain fails", () => {
    expect(validateEmail("user@")).toBe(false);
  });
  test("empty string fails", () => {
    expect(validateEmail("")).toBe(false);
  });
  test("spaces fail", () => {
    expect(validateEmail("us er@example.com")).toBe(false);
  });
});

describe("validatePassword", () => {
  test("6+ chars passes", () => {
    expect(validatePassword("secret")).toBe(true);
  });
  test("fewer than 6 chars fails", () => {
    expect(validatePassword("abc")).toBe(false);
  });
  test("null fails", () => {
    expect(validatePassword(null)).toBe(false);
  });
  test("number fails (not string)", () => {
    expect(validatePassword(123456)).toBe(false);
  });
});

describe("validateRole", () => {
  test("customer is valid", () => expect(validateRole("customer")).toBe(true));
  test("designer is valid", () => expect(validateRole("designer")).toBe(true));
  test("manager is valid", () => expect(validateRole("manager")).toBe(true));
  test("admin is valid", () => expect(validateRole("admin")).toBe(true));
  test("delivery is valid", () => expect(validateRole("delivery")).toBe(true));
  test("unknown role fails", () => expect(validateRole("superadmin")).toBe(false));
  test("empty string fails", () => expect(validateRole("")).toBe(false));
});

describe("hasRole", () => {
  test("matching role returns true", () => {
    expect(hasRole({ role: "designer" }, "designer")).toBe(true);
  });
  test("wrong role returns false", () => {
    expect(hasRole({ role: "customer" }, "designer")).toBe(false);
  });
  test("null user returns false", () => {
    expect(hasRole(null, "customer")).toBe(false);
  });
});

describe("isApproved", () => {
  test("approved user returns true", () => {
    expect(isApproved({ approved: true })).toBe(true);
  });
  test("unapproved user returns false", () => {
    expect(isApproved({ approved: false })).toBe(false);
  });
  test("missing approved field returns false", () => {
    expect(isApproved({})).toBe(false);
  });
});

describe("hashPassword + verifyPassword", () => {
  test("hash and verify round-trip", async () => {
    const hashed = await hashPassword("mypassword");
    expect(await verifyPassword("mypassword", hashed)).toBe(true);
  });

  test("wrong password fails", async () => {
    const hashed = await hashPassword("mypassword");
    expect(await verifyPassword("wrongpassword", hashed)).toBe(false);
  });

  test("hash is not plaintext", async () => {
    const hashed = await hashPassword("secret");
    expect(hashed).not.toBe("secret");
    expect(hashed.startsWith("$2")).toBe(true);
  });
}, 15000);

describe("sanitizeUser", () => {
  test("removes password field", () => {
    const user = { _id: "1", username: "test", email: "t@t.com", password: "hashed" };
    const safe = sanitizeUser(user);
    expect(safe.password).toBeUndefined();
  });
  test("keeps other fields", () => {
    const user = { _id: "1", username: "test", email: "t@t.com", password: "hashed" };
    const safe = sanitizeUser(user);
    expect(safe.username).toBe("test");
    expect(safe.email).toBe("t@t.com");
  });
});
