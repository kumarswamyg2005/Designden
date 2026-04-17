"use strict";
const bcrypt = require("bcryptjs");

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

function validateRole(role) {
  const validRoles = ["customer", "designer", "manager", "admin", "delivery"];
  return validRoles.includes(role);
}

function hasRole(user, role) {
  return user?.role === role;
}

function isApproved(user) {
  return user?.approved === true;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRole,
  hasRole,
  isApproved,
  hashPassword,
  verifyPassword,
  sanitizeUser,
};
