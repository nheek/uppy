import { NextResponse } from "next/server";
import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET is not defined" },
        { status: 500 },
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Query files uploaded by the user
    const query = `
      SELECT id, original_name, saved_name, file_url
      FROM "Files"
      WHERE user_id = $1
      ORDER BY upload_time DESC;
    `;
    const { rows: files } = await pool.query(query, [decoded.id]);

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
