import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable Next.js body parser
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const form = formidable({ uploadDir: uploadsDir, keepExtensions: true });

  return new Promise((resolve) => {
    form.parse(req as any, async (err: any, fields: any, files: any) => {
      if (err) {
        resolve(NextResponse.json({ error: "Upload gagal" }, { status: 500 }));
        return;
      }
      const file = files.file;
      const filePath = `/uploads/${path.basename(file.filepath)}`;
      resolve(NextResponse.json({ filePath }));
    });
  });
}
