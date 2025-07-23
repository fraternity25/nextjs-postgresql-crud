// pages/api/user/me.js
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import db from "@/lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { roles: true },
  });

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map(r => r.name),
  });
}
