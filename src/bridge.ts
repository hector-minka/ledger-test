import express from "express";
import util from "util";

const app = express();
const PORT = process.env["PORT"] || 3000;

// Middleware
app.use(express.json());

// POST /api/v1/debit
app.post("/api/v2/debits", async (req, res) => {
  try {
    console.info(
      "INTENT DATA:",
      util.inspect(req.body, { depth: null, colors: true })
    );
    // const { source, target, amount, symbol = "lps" } = req.body;

    res.status(202).send();
  } catch (error) {
    console.error("Error creating debit intent:", error);
    res.status(500).json({
      error: "Failed to create transfer intent",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bridge server running on port ${PORT}`);
  console.log(`📡 POST /api/v2/debit - Create transfer intent`);
  console.log(`🏥 GET /health - Health check`);
});

export default app;
