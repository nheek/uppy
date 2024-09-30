// src/app/api/login/route.ts

import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

// POST method handler
export async function POST(req: NextRequest) {
  const { username, password } = await req.json(); // Use .json() to parse the request body

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the user by username
    const userQuery = `
      SELECT id, password FROM "Users" WHERE username = $1
    `;
    const { rows } = await pool.query(userQuery, [username]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET!, { expiresIn: "1h" });

    return NextResponse.json(
      { token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Optionally, you can export other methods if needed
export async function GET() {
  return NextResponse.json({ message: "GET method not supported" }, { status: 405 });
}
