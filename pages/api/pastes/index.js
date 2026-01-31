import pool from "@/lib/db";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && ttl_seconds < 1) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && max_views < 1) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid();
  const createdAt = new Date();
  const expiresAt = ttl_seconds
    ? new Date(createdAt.getTime() + ttl_seconds * 1000)
    : null;

  await pool.query(
    `INSERT INTO pastes (id, content, created_at, expires_at, remaining_views)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, content, createdAt, expiresAt, max_views ?? null]
  );

  res.status(201).json({
    id,
    url: `http://localhost:3000/p/${id}`,
  });
}
