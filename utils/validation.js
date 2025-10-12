/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {string[]} fields - Array of required field names
 * @returns {object} - { valid: boolean, missing: string[] }
 */
function validateRequiredFields(body, fields) {
  const missing = [];

  for (const field of fields) {
    if (
      !body[field] ||
      (typeof body[field] === "string" && body[field].trim() === "")
    ) {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize string input (trim and limit length)
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string} - Sanitized string
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== "string") return "";
  return str.trim().substring(0, maxLength);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = {
  validateRequiredFields,
  sanitizeString,
  escapeHtml,
};
