import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    return res.status(404).json({ error: "Not found" });
  }

  if (paste.expiresAt && paste.expiresAt < new Date()) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews !== null && paste.currentViews >= paste.maxViews) {
    return res.status(404).json({ error: "View limit reached" });
  }

  // PASSWORD PROTECTED
  if (paste.passwordHash) {
    if (req.method !== "POST") {
      return res.status(401).json({ error: "Password required" });
    }

    const { password } = req.body;
    const ok = await bcrypt.compare(password || "", paste.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  await prisma.paste.update({
    where: { id },
    data: { currentViews: { increment: 1 } },
  });

  return res.json({ content: paste.content });
}
