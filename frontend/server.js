const express = require("express");
const path = require("path");
const compression = require("compression");
const app = express();

// Enable CORS if needed
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// Security headers
app.use((req, res, next) => {
  res.header("X-Frame-Options", "DENY");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  next();
});

// Enable compression
app.use(compression());

// Serve static files from React build
app.use(
  express.static(path.join(__dirname, "build"), {
    maxAge: "1y", // Cache static assets for 1 year
    etag: true,
  }),
);

// Log incoming requests in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Handle React routing
app.get("*", (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.url.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error ${new Date().toISOString()}: `, err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
    🚀 Server is running on port ${PORT}
    📁 Serving static files from: ${path.join(__dirname, "build")}
    🔧 Environment: ${process.env.NODE_ENV || "development"}
    `);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
