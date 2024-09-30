// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/app/api/config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET;

// Enable formidable to parse incoming form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST method handler
export async function POST(req: NextRequest) {
  try {
    // Authorization token validation
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    if (!JWT_SECRET) {
      return NextResponse.json({ message: "JWT_SECRET is not defined" }, { status: 500 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Setup upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Initialize IncomingForm
    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
    });

    // Parse the form using formidable
    const parsedFiles = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => { // Type assertion here
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });

    const file = parsedFiles.file[0];

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const originalName = file.originalFilename || 'unknown';
    const savedName = `${uuidv4()}${path.extname(originalName)}`;
    const filePath = path.join(uploadDir, savedName);

    // Rename the uploaded file to the target directory
    fs.renameSync(file.filepath, filePath);

    const fileUrl = uuidv4(); // Generate a unique file URL
    const query = `
      INSERT INTO "Files" (user_id, original_name, saved_name, file_url)
      VALUES ($1, $2, $3, $4);
    `;

    await pool.query(query, [decoded.id, originalName, savedName, fileUrl]);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUrl: `/uploads/${savedName}`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
