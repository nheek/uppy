// pages/api/register.ts

import { pool } from "@/pages/api/config";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

const saltRounds = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert the new user into the database
      const insertQuery = `
        INSERT INTO "Users" (username, password) VALUES ($1, $2)
        RETURNING id, username
      `;
      const { rows } = await pool.query(insertQuery, [username, hashedPassword]);

      return res.status(201).json({ id: rows[0].id, username: rows[0].username });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
