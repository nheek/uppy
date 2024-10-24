import { pool } from "@/app/api/config";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const saltRounds = 10;

export async function POST(req: NextRequest) {
  const { username, password, confirmPassword } = await req.json(); // Use .json() to parse the request body

  if (!username || !password || !confirmPassword) {
    return NextResponse.json(
      { message: "Username, password, and confirm password are required" },
      { status: 400 },
    );
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Passwords do not match" },
      { status: 400 },
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const insertQuery = `
      INSERT INTO "Users" (username, password) VALUES ($1, $2)
      RETURNING id, username
    `;
    const { rows } = await pool.query(insertQuery, [username, hashedPassword]);

    return NextResponse.json(
      { id: rows[0].id, username: rows[0].username },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
