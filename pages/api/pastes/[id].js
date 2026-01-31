import pool from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  const result = await pool.query(
    "SELECT * FROM pastes WHERE id = $1",
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  const paste = result.rows[0];

  // Deterministic time support (for automated tests)
  const now =
    process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
      ? new Date(Number(req.headers["x-test-now-ms"]))
      : new Date();

  // TTL check
  if (paste.expires_at && now > paste.expires_at) {
    return res.status(404).json({ error: "Expired" });
  }

  // View limit check
  if (paste.remaining_views !== null) {
    if (paste.remaining_views <= 0) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    await pool.query(
      "UPDATE pastes SET remaining_views = remaining_views - 1 WHERE id = $1",
      [id]
    );
  }

  res.status(200).json({
    content: paste.content,
    remaining_views:
      paste.remaining_views !== null ? paste.remaining_views - 1 : null,
    expires_at: paste.expires_at,
  });
}
