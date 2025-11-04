export async function intentEffect(req, res) {
  console.log("\n=== INTENT EFFECT RECEIVED ===");
  console.log(
    `[INTENT-EFFECT] Received request at: ${new Date().toISOString()}`
  );
  console.log(`[INTENT-EFFECT] Method: ${req.method}`);
  console.log(`[INTENT-EFFECT] URL: ${req.url}`);
  console.log(`[INTENT-EFFECT] Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[INTENT-EFFECT] Body:`, JSON.stringify(req.body, null, 2));
  console.log(
    `[INTENT-EFFECT] Query params:`,
    JSON.stringify(req.query, null, 2)
  );
  console.log(
    `[INTENT-EFFECT] Route params:`,
    JSON.stringify(req.params, null, 2)
  );

  // Return 202 Accepted immediately
  res.status(202).json({
    message: "Intent effect received and accepted",
    timestamp: new Date().toISOString(),
    accepted: true,
  });

  console.log(`[INTENT-EFFECT] Response sent with 202 Accepted status`);
  console.log("=== END INTENT EFFECT ===\n");
}
