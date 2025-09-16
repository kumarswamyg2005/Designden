/**
 * Comprehensive Form Validation Test Suite
 * Tests all forms in the application for proper validation
 */

const axios = require("axios");
const BASE_URL = "http://localhost:3000";

// Test utilities
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(testName, passed, details = "") {
  if (passed) {
    log(`✓ ${testName}`, "green");
  } else {
    log(`✗ ${testName}`, "red");
    if (details) log(`  ${details}`, "yellow");
  }
}

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTest(testName, testFn) {
  totalTests++;
  try {
    const result = await testFn();
    if (result) {
      passedTests++;
      testResult(testName, true);
    } else {
      failedTests++;
      testResult(testName, false);
    }
  } catch (error) {
    failedTests++;
    testResult(testName, false, error.message);
  }
}

// Test 1: Login Form Validation Tests
async function testLoginFormValidation() {
  log("\n=== Testing Login Form Validation ===", "cyan");

  // Test 1.1: Empty email
  await runTest("Login - Empty email should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: "",
          password: "password123",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302; // Should redirect back with error
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 1.2: Invalid email format
  await runTest("Login - Invalid email format should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: "notanemail",
          password: "password123",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 1.3: Password too short
  await runTest("Login - Password less than 6 chars should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: "test@example.com",
          password: "12345",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 1.4: Invalid credentials
  await runTest("Login - Invalid credentials should show error", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: "nonexistent@example.com",
          password: "password123",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });
}

// Test 2: Signup Form Validation Tests
async function testSignupFormValidation() {
  log("\n=== Testing Signup Form Validation ===", "cyan");

  // Test 2.1: Username too short
  await runTest("Signup - Username less than 3 chars should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username: "ab",
          email: "test@example.com",
          password: "password123",
          contactNumber: "1234567890",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 2.2: Invalid email
  await runTest("Signup - Invalid email should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username: "testuser",
          email: "invalidemail",
          password: "password123",
          contactNumber: "1234567890",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 2.3: Password too short
  await runTest("Signup - Password less than 6 chars should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username: "testuser",
          email: "test@example.com",
          password: "12345",
          contactNumber: "1234567890",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 2.4: Invalid phone number
  await runTest("Signup - Invalid phone number should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          contactNumber: "12345",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });

  // Test 2.5: Phone number with letters
  await runTest("Signup - Phone number with letters should fail", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          contactNumber: "123abc7890",
        },
        {
          maxRedirects: 0,
          validateStatus: () => true,
        }
      );
      return response.status === 302;
    } catch (error) {
      return error.response && error.response.status === 302;
    }
  });
}

// Test 3: Client-side validation tests
async function testClientSideValidation() {
  log("\n=== Testing Client-Side Validation Elements ===", "cyan");

  // Test 3.1: Login page has validation
  await runTest("Login page has novalidate attribute", async () => {
    const response = await axios.get(`${BASE_URL}/login`);
    return (
      response.data.includes("novalidate") &&
      response.data.includes("invalid-feedback")
    );
  });

  // Test 3.2: Signup page has validation
  await runTest("Signup page has validation scripts", async () => {
    const response = await axios.get(`${BASE_URL}/signup`);
    return (
      response.data.includes("novalidate") &&
      response.data.includes("invalid-feedback") &&
      response.data.includes("form.checkValidity()")
    );
  });

  // Test 3.3: Flash messages partial exists
  await runTest("Flash messages are included in forms", async () => {
    const response = await axios.get(`${BASE_URL}/login`);
    return response.data.includes("flash-messages");
  });
}

// Test 4: Validation Summary
function printSummary() {
  log("\n" + "=".repeat(50), "blue");
  log("TEST SUMMARY", "blue");
  log("=".repeat(50), "blue");
  log(`Total Tests: ${totalTests}`, "cyan");
  log(`Passed: ${passedTests}`, "green");
  log(`Failed: ${failedTests}`, "red");
  log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`,
    "cyan"
  );
  log("=".repeat(50), "blue");

  if (failedTests === 0) {
    log("\n🎉 All form validations are working correctly!", "green");
  } else {
    log(
      `\n⚠️  ${failedTests} test(s) failed. Please review the errors above.`,
      "yellow"
    );
  }
}

// Main test runner
async function runAllTests() {
  log("Starting Comprehensive Form Validation Tests...", "cyan");
  log("Server URL: " + BASE_URL, "cyan");

  try {
    await testLoginFormValidation();
    await testSignupFormValidation();
    await testClientSideValidation();

    printSummary();
    process.exit(failedTests === 0 ? 0 : 1);
  } catch (error) {
    log("\n❌ Fatal error during testing:", "red");
    log(error.message, "red");
    process.exit(1);
  }
}

// Run tests
runAllTests();
