import { NextResponse } from 'next/server';
import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET;

// Disable body parsing by Next.js, since we'll handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    // Verify the JWT token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    if (!JWT_SECRET) {
      return NextResponse.json({ message: "JWT_SECRET is not defined" }, { status: 500 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Parse formData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Prepare the directory to store the uploaded files
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalName = file.name;
    const savedName = `${uuidv4()}${path.extname(originalName)}`;
    const filePath = path.join(uploadDir, savedName);

    // Save the uploaded file to the filesystem
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    // Generate a unique URL for the file
    const fileUrlUnique = uuidv4();

    // Insert file data into the database
    const query = `
      INSERT INTO "Files" (user_id, original_name, saved_name, file_url)
      VALUES ($1, $2, $3, $4);
    `;
    await pool.query(query, [decoded.id, originalName, savedName, fileUrlUnique]);

    const domain = process.env.DOMAIN || 'http://localhost:3034'; // Production domain should be used in deployment
    const fileUrl = `/uploads/${savedName}`; // Relative URL for preview
    const fullUrl = `${domain}${fileUrl}`; // Full URL for sharing

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUrl,
      fullUrl,
    }, { status: 201 });



  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
