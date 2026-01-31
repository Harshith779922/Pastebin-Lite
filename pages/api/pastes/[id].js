import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) {
    return res.status(404).json({ error: "Not found" });
  }

  /* ---------- DETERMINISTIC TIME (TEST MODE) ---------- */
  const now =
    process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
      ? new Date(Number(req.headers["x-test-now-ms"]))
      : new Date();

  /* ---------- EXPIRY CHECK ---------- */
  if (paste.expiresAt && paste.expiresAt < now) {
    return res.status(404).json({ error: "Expired" });
  }

  /* ---------- VIEW LIMIT CHECK ---------- */
  if (
    paste.maxViews !== null &&
    paste.currentViews >= paste.maxViews
  ) {
    return res.status(404).json({ error: "View limit reached" });
  }

  /* ---------- PASSWORD PROTECTION ---------- */
  if (paste.passwordHash) {
    if (req.method !== "POST") {
      return res.status(401).json({ error: "Password required" });
    }

    const { password } = req.body;

    const ok = await bcrypt.compare(
      password || "",
      paste.passwordHash
    );

    if (!ok) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  /* ---------- INCREMENT VIEWS ---------- */
  await prisma.paste.update({
    where: { id },
    data: { currentViews: { increment: 1 } },
  });

  /* ---------- RESPONSE (SPEC COMPLIANT) ---------- */
  return res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null
        ? null
        : Math.max(paste.maxViews - (paste.currentViews + 1), 0),
    expires_at: paste.expiresAt,
  });
}
