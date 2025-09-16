const http = require("http");
const querystring = require("querystring");

// Test login with invalid credentials
const testData = querystring.stringify({
  email: "sai4@gmail.com",
  password: "wrongpassword",
});

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

console.log("Testing login with invalid credentials...");
console.log("Email: sai4@gmail.com");
console.log("Password: wrongpassword (intentionally wrong)");
console.log("---");

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 302) {
      console.log("✓ Server correctly redirects on invalid credentials");
      console.log(`Redirect Location: ${res.headers.location}`);

      // Check if redirecting to login (which means validation worked)
      if (res.headers.location === "/login") {
        console.log("✓ Redirects to /login (validation working!)");
        console.log("\nFlash message should appear on the login page.");
        console.log(
          "Open http://localhost:3000/login in browser to see the error message."
        );
      }
    } else {
      console.log("Response body:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("Error:", error.message);
  console.log("\nMake sure the server is running on port 3000");
});

req.write(testData);
req.end();
