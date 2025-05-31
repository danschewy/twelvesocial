import { NextRequest, NextResponse } from "next/server";
import { s3Client, bucketName } from "@/lib/doSpaces";
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import axios, { AxiosError } from "axios";
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

interface S3ErrorType extends Error {
  Code?: string;
  Message?: string;
  // Add other common S3 error properties if needed
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
    } catch (fetchError) {
      console.error("Error fetching video from sourceUrl:", fetchError);
      let details: string | object = "Unknown fetch error"; // Ensure details can be an object
      if (axios.isAxiosError(fetchError)) {
        const axiosError = fetchError as AxiosError<{ message: string }>; // Use AxiosError<any> for broader data type
        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === "string") {
            details = axiosError.response.data;
          } else if (typeof axiosError.response.data.message === "string") {
            details = axiosError.response.data.message;
          } else if (axiosError.message) {
            details = axiosError.message;
          } else {
            details = axiosError.response.data; // Fallback to the whole data object if no message string
          }
        } else if (axiosError.message) {
          details = axiosError.message;
        }
      } else if (fetchError instanceof Error) {
        details = fetchError.message;
      }

      return NextResponse.json<UploadToSpaceErrorResponse>(
        {
          error: "Failed to fetch video from sourceUrl.",
          details: details,
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
      const s3Error = error as S3ErrorType; // Use defined S3ErrorType
      if (s3Error.Code) {
        // Check for Code property, which is uppercase in S3 errors
        errorDetails = {
          code: s3Error.Code,
          message: s3Error.Message || s3Error.message,
        };
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
