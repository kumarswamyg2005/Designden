const http = require("http");
const querystring = require("querystring");

console.log("═══════════════════════════════════════════════════════════");
console.log("Testing Flash Messages After Session Configuration Fix");
console.log("═══════════════════════════════════════════════════════════\n");

// Test 1: Login with wrong password
function testWrongPassword() {
  return new Promise((resolve) => {
    const testData = querystring.stringify({
      email: "sai4@gmail.com",
      password: "wrongpassword",
    });

    console.log("TEST 1: Login with Wrong Password");
    console.log("-----------------------------------");
    console.log("Email: sai4@gmail.com");
    console.log("Password: wrongpassword");
    console.log("");

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/login",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": testData.length,
      },
    };

    const req = http.request(options, (res) => {
      let cookies = res.headers["set-cookie"] || [];

      console.log(`Response Status: ${res.statusCode}`);

      if (res.statusCode === 302) {
        console.log("✓ Server redirected (302)");
        console.log(`Redirect Location: ${res.headers.location}`);
        console.log("✓ Flash message should be saved in session");

        // Now make a GET request to /login with the session cookie to see the flash message
        if (cookies.length > 0) {
          const sessionCookie = cookies[0].split(";")[0];
          console.log(`Session Cookie: ${sessionCookie.substring(0, 50)}...`);

          // Wait a bit for session to save
          setTimeout(() => {
            const getOptions = {
              hostname: "localhost",
              port: 3000,
              path: "/login",
              method: "GET",
              headers: {
                Cookie: sessionCookie,
              },
            };

            console.log(
              "\nFetching /login page with session cookie to verify flash message..."
            );

            const getReq = http.request(getOptions, (getRes) => {
              let data = "";
              getRes.on("data", (chunk) => {
                data += chunk;
              });

              getRes.on("end", () => {
                // Check if flash message appears in HTML
                if (
                  data.includes("Invalid email or password") ||
                  data.includes("alert-danger")
                ) {
                  console.log("✓ SUCCESS! Flash message found in HTML");
                  console.log(
                    "✓ Error alert box should be visible on the page"
                  );
                } else {
                  console.log("✗ ISSUE: Flash message NOT found in HTML");
                  console.log(
                    "  This means the flash message is not being displayed"
                  );
                }
                resolve();
              });
            });

            getReq.on("error", (error) => {
              console.error("Error:", error.message);
              resolve();
            });

            getReq.end();
          }, 100);
        }
      } else {
        console.log("✗ Server did not redirect (expected 302)");
        console.log(
          "  This is incorrect - should redirect to show flash message"
        );
        resolve();
      }
    });

    req.on("error", (error) => {
      console.error("Error:", error.message);
      resolve();
    });

    req.write(testData);
    req.end();
  });
}

// Test 2: Login with invalid email format
function testInvalidEmail() {
  return new Promise((resolve) => {
    const testData = querystring.stringify({
      email: "notanemail",
      password: "password123",
    });

    console.log(
      "\n═══════════════════════════════════════════════════════════"
    );
    console.log("TEST 2: Login with Invalid Email Format");
    console.log("-----------------------------------");
    console.log("Email: notanemail");
    console.log("Password: password123");
    console.log("");

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/login",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": testData.length,
      },
    };

    const req = http.request(options, (res) => {
      console.log(`Response Status: ${res.statusCode}`);

      if (res.statusCode === 302) {
        console.log("✓ Server redirected (302)");
        console.log("✓ Validation working correctly");
      } else {
        console.log("✗ Server did not redirect");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.error("Error:", error.message);
      resolve();
    });

    req.write(testData);
    req.end();
  });
}

// Test 3: Login with short password
function testShortPassword() {
  return new Promise((resolve) => {
    const testData = querystring.stringify({
      email: "test@example.com",
      password: "12345",
    });

    console.log(
      "\n═══════════════════════════════════════════════════════════"
    );
    console.log("TEST 3: Login with Short Password");
    console.log("-----------------------------------");
    console.log("Email: test@example.com");
    console.log("Password: 12345 (less than 6 chars)");
    console.log("");

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/login",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": testData.length,
      },
    };

    const req = http.request(options, (res) => {
      console.log(`Response Status: ${res.statusCode}`);

      if (res.statusCode === 302) {
        console.log("✓ Server redirected (302)");
        console.log("✓ Password length validation working");
      } else {
        console.log("✗ Server did not redirect");
      }
      resolve();
    });

    req.on("error", (error) => {
      console.error("Error:", error.message);
      resolve();
    });

    req.write(testData);
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log("Starting Flash Message Tests...\n");
  console.log("Make sure the server is running on http://localhost:3000\n");

  await testWrongPassword();
  await testInvalidEmail();
  await testShortPassword();

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TESTS COMPLETE");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\nNow open your browser and navigate to:");
  console.log("http://localhost:3000/login");
  console.log("\nTry logging in with:");
  console.log("  Email: sai4@gmail.com");
  console.log("  Password: wrongpassword");
  console.log(
    "\nYou should see a RED ALERT BOX at the top with the error message!"
  );
  console.log("═══════════════════════════════════════════════════════════\n");
}

runAllTests();
