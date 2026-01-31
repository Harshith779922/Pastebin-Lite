import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, ttl_seconds, max_views, password } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Content required" });
    }

    const expiresAt = ttl_seconds
      ? new Date(Date.now() + ttl_seconds * 1000)
      : null;

    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : null;

    const paste = await prisma.paste.create({
      data: {
        id: nanoid(),
        content,
        expiresAt,
        maxViews: max_views ?? null,
        passwordHash,
      },
    });

    return res.status(201).json({ id: paste.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
