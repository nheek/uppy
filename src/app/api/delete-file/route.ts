import { NextResponse } from "next/server";
import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
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
      throw new Error("JWT_SECRET is not defined");
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as unknown as {
      id: number;
    };
    const { id: userId } = decodedToken;
    const { fileId, savedName } = await request.json();

    // Query to ensure file belongs to the user and delete it
    const query = `DELETE FROM "Files" WHERE id = $1 AND user_id = $2 RETURNING saved_name`;
    const { rows } = await pool.query(query, [fileId, userId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "File not found or unauthorized" },
        { status: 404 },
      );
    }

    // Remove the file from the file system
    const filePath = path.join(process.cwd(), "public", "uploads", savedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
