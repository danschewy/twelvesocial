import { NextRequest, NextResponse } from "next/server";
import { s3Client, bucketName } from "@/lib/doSpaces";
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // For generating unique filenames if needed

interface UploadToSpaceRequestBody {
  sourceUrl: string; // URL where the clip can be downloaded from (e.g., http://localhost:3000/api/download-clip?file=...)
  targetFileName?: string; // Optional: Desired filename in the Space. If not provided, a unique one will be generated.
  contentType?: string; // Optional: MIME type, e.g., 'video/mp4'. Defaults to 'application/octet-stream'
}

interface UploadToSpaceErrorResponse {
  error: string;
  details?: string | object | null;
}

export async function POST(request: NextRequest) {
  if (!s3Client || !bucketName) {
    console.error(
      "DigitalOcean Spaces S3 client or bucket name is not configured. Check environment variables."
    );
    return NextResponse.json<UploadToSpaceErrorResponse>(
      { error: "File upload service is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as UploadToSpaceRequestBody;
    const { sourceUrl, targetFileName, contentType } = body;

    if (!sourceUrl) {
      return NextResponse.json<UploadToSpaceErrorResponse>(
        { error: "Source URL (sourceUrl) is required." },
        { status: 400 }
      );
    }

    // Fetch the video file from the sourceUrl
    let fileBuffer: Buffer;
    let resolvedContentType = contentType || "application/octet-stream";
    try {
      console.log(`Fetching video from source URL: ${sourceUrl}`);
      const response = await axios.get(sourceUrl, {
        responseType: "arraybuffer",
      });
      fileBuffer = Buffer.from(response.data);
      if (response.headers["content-type"] && !contentType) {
        resolvedContentType = response.headers["content-type"] as string;
      }
      console.log(
        `Fetched video. Size: ${fileBuffer.length} bytes. Content-Type: ${resolvedContentType}`
      );
    } catch (fetchError: any) {
      console.error("Error fetching video from sourceUrl:", fetchError);
      return NextResponse.json<UploadToSpaceErrorResponse>(
        {
          error: "Failed to fetch video from sourceUrl.",
          details: fetchError.message || "Unknown fetch error",
        },
        { status: 500 }
      );
    }

    const originalFileName = sourceUrl
      .substring(sourceUrl.lastIndexOf("/") + 1)
      .split("?")[0]; // Get filename before query params
    const uniquePrefix = uuidv4();
    const finalFileNameWithPrefix = targetFileName
      ? `${uniquePrefix}-${targetFileName}`
      : `${uniquePrefix}-${originalFileName}`;

    // Ensure a reasonable file extension if one isn't obvious or provided
    const defaultExtension = resolvedContentType === "video/mp4" ? ".mp4" : "";
    const fileExtension = finalFileNameWithPrefix.includes(".")
      ? ""
      : defaultExtension;
    const keyInSpace = `video-clips/${finalFileNameWithPrefix}${fileExtension}`;

    console.log(
      `Uploading to DO Spaces: Bucket: ${bucketName}, Key: ${keyInSpace}`
    );

    const putObjectParams = {
      Bucket: bucketName,
      Key: keyInSpace,
      Body: fileBuffer,
      ContentType: resolvedContentType,
      ACL: ObjectCannedACL.public_read, // Use the enum from the SDK
    };

    const command = new PutObjectCommand(putObjectParams);
    await s3Client.send(command);

    // Construct the public URL
    // The endpoint for DO Spaces is usually like {bucketName}.{region}.digitaloceanspaces.com or {region}.digitaloceanspaces.com/{bucketName}
    // We need to check which format is correct for your specific endpoint from DO_SPACES_ENDPOINT
    // Assuming process.env.DO_SPACES_ENDPOINT is like `nyc3.digitaloceanspaces.com`
    const spacePublicUrl = `https://${bucketName}.${process.env.DO_SPACES_ENDPOINT}/${keyInSpace}`;
    // Alternatively, if your endpoint is just the region part (e.g., nyc3) and bucket is accessed as a path:
    // const spacePublicUrl = `https://${process.env.DO_SPACES_ENDPOINT}/${bucketName}/${keyInSpace}`;
    // You might need to adjust this based on your exact Spaces configuration and desired URL structure.

    console.log(
      "File uploaded successfully to DO Spaces. Public URL:",
      spacePublicUrl
    );

    return NextResponse.json(
      { success: true, publicUrl: spacePublicUrl },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error uploading to DigitalOcean Spaces:", error);
    let errorMessage = "Failed to upload file to Space.";
    let errorDetails: string | object | null = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      const s3Error = error as any; // For potential S3 error details
      if (s3Error.Code) {
        errorDetails = { code: s3Error.Code, message: s3Error.Message };
      }
    }
    return NextResponse.json<UploadToSpaceErrorResponse>(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
