import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const POST = async (request: Request) => {
  try {
    const data = await request.json();
    const { croppedImage, savedName } = data; // assuming these are sent from the frontend

    // Decode the base64 image string
    const base64Data = croppedImage.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, savedName);

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    // Save the cropped image
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ message: 'Cropped image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading cropped image:', error);
    return NextResponse.json({ message: 'Failed to upload cropped image' }, { status: 500 });
  }
};
