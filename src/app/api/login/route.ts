import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
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
        { status: 401 },
      );
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET!, { expiresIn: "30d" });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "GET method not supported" },
    { status: 405 },
  );
}
