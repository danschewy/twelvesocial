import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const TEMP_CLIP_DIR = path.join(process.cwd(), "tmp", "generated-clips");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json(
      { message: "File name is required." },
      { status: 400 }
    );
  }

  // Basic security: Sanitize fileName to prevent directory traversal
  const safeFileName = path.basename(fileName);
  if (safeFileName !== fileName) {
    return NextResponse.json(
      { message: "Invalid file name." },
      { status: 400 }
    );
  }

  const filePath = path.join(TEMP_CLIP_DIR, safeFileName);

  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const headers = new Headers();
      headers.set("Content-Type", "video/mp4");
      headers.set(
        "Content-Disposition",
        `attachment; filename="${safeFileName}"`
      );

      // Optional: Delete file after download to save space, if they are truly temporary.
      // Consider your use case: if users might re-download, don't delete immediately.
      // fs.unlinkSync(filePath);

      return new NextResponse(fileBuffer, { status: 200, headers });
    } else {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error serving file ${safeFileName}:`, error);
    return NextResponse.json(
      { message: "Error serving file." },
      { status: 500 }
    );
  }
}
