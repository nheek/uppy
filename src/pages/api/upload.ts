import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/pages/api/config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      // Authorization token validation
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
      }

      if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET is not defined" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

      // Setup upload directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads'); // Change directory to public/uploads
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the directory is created recursively
      }

      // Initialize IncomingForm
      const form = new IncomingForm({
        uploadDir, // Set upload directory
        keepExtensions: true,
      });

      // Parse the form
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err); // Log parsing error
          return res.status(500).json({ message: "File upload failed" });
        }

        const file = files.file[0]; // Directly access the first file object

        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const originalName = file.originalFilename || 'unknown';
        const savedName = `${uuidv4()}${path.extname(originalName)}`;
        const filePath = path.join(uploadDir, savedName);

        // Rename the uploaded file to the target directory
        try {
          fs.renameSync(file.filepath, filePath);
        } catch (renameError) {
          console.error("File renaming error:", renameError); // Log renaming error
          return res.status(500).json({ message: "Error saving file" });
        }

        const fileUrl = uuidv4(); // Generate a unique file URL
        const query = `
          INSERT INTO "Files" (user_id, original_name, saved_name, file_url)
          VALUES ($1, $2, $3, $4);
        `;

        await pool.query(query, [decoded.id, originalName, savedName, fileUrl]);

        res.status(201).json({
          message: "File uploaded successfully",
          fileUrl: `/uploads/${savedName}`,
        });
      });
    } catch (error) {
      console.error("Error handling file upload:", error); // Log the error
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};

export default handler;
