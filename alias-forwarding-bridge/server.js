import cookieParser from "cookie-parser";
import express from "express";

const app = express();
const port = process.env.PORT || 3002;

// Middleware setup
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(express.raw({ type: "*/*", limit: "10mb" })); // Parse raw bodies for any content type

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log("\n" + "=".repeat(100));
  console.log(`🕐 TIMESTAMP: ${timestamp}`);
  console.log(`📡 REQUEST: ${req.method} ${req.url}`);
  console.log(`🌐 PROTOCOL: ${req.protocol}`);
  console.log(`🏠 HOST: ${req.get("host")}`);
  console.log(`📍 IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`👤 USER-AGENT: ${req.get("user-agent") || "Not provided"}`);
  console.log(
    `📏 CONTENT-LENGTH: ${req.get("content-length") || "Not provided"}`
  );
  console.log(`🎯 CONTENT-TYPE: ${req.get("content-type") || "Not provided"}`);

  // Log all headers
  console.log("\n📋 HEADERS:");
  console.log(JSON.stringify(req.headers, null, 2));

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log("\n🔍 QUERY PARAMETERS:");
    console.log(JSON.stringify(req.query, null, 2));
  }

  // Log route parameters
  if (Object.keys(req.params).length > 0) {
    console.log("\n🎯 ROUTE PARAMETERS:");
    console.log(JSON.stringify(req.params, null, 2));
  }

  // Log body (if present)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("\n📦 REQUEST BODY:");
    if (Buffer.isBuffer(req.body)) {
      console.log("Raw Buffer Data:");
      console.log(req.body.toString("hex"));
      console.log("As String:");
      console.log(req.body.toString("utf8"));
    } else {
      console.log(JSON.stringify(req.body, null, 2));
    }
  }

  // Log cookies (if present)
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    console.log("\n🍪 COOKIES:");
    console.log(JSON.stringify(req.cookies, null, 2));
  }

  // Log signed cookies (if present)
  if (req.signedCookies && Object.keys(req.signedCookies).length > 0) {
    console.log("\n🔐 SIGNED COOKIES:");
    console.log(JSON.stringify(req.signedCookies, null, 2));
  }

  console.log("=".repeat(100) + "\n");

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "alias-forwarding-bridge",
  });
});

// Echo endpoint - returns what was sent
app.all("/echo", (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    cookies: req.cookies,
    timestamp: new Date().toISOString(),
  });
});

// V2 Anchors endpoint - logs and returns mock response
app.get("/v2/anchors/:id", (req, res) => {
  const { id } = req.params;
  console.log("🎯 V2 ANCHORS ENDPOINT HIT!");
  console.log("Query parameters:", req.query);

  // Mock response for anchors list
  const mockResponse = {
    data: [
      {
        hash: "mock-hash-1",
        handle: "@testuser1",
        target: "svgs:123456789@testbank.co",
        symbol: "cop",
        status: "ACTIVE",
        luid: "$anc.mock123456789",
        meta: {
          proofs: [],
          status: "ACTIVE",
          moment: new Date().toISOString(),
          owners: ["mock-public-key-1"],
          labels: ["ndin:1234567890"],
        },
      },
      {
        hash: "mock-hash-2",
        handle: "@testuser2",
        target: "svgs:987654321@testbank.co",
        symbol: "cop",
        status: "ACTIVE",
        luid: "$anc.mock987654321",
        meta: {
          proofs: [],
          status: "ACTIVE",
          moment: new Date().toISOString(),
          owners: ["mock-public-key-2"],
          labels: ["ndin:0987654321"],
        },
      },
    ],
    pagination: {
      limit: req.query.limit || 10,
      offset: req.query.offset || 0,
      total: 2,
    },
    timestamp: new Date().toISOString(),
    note: "This is a mock response from alias-forwarding-bridge",
  };

  res.json(mockResponse);
});

// Catch-all route for any other requests
app.all("*", (req, res) => {
  console.log(`🚨 UNHANDLED ROUTE: ${req.method} ${req.url}`);

  // Return a simple response
  res.status(200).json({
    message: "Request received and logged",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    note: "Check console for detailed logs",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 Alias Forwarding Bridge running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔄 Echo endpoint: http://localhost:${port}/echo`);
  console.log(`📝 All requests will be logged to console`);
  console.log(`🌐 Ready to receive requests...\n`);
});
