import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.DO_SPACES_KEY;
const secretAccessKey = process.env.DO_SPACES_SECRET;
const endpoint = process.env.DO_SPACES_ENDPOINT;
const region = process.env.DO_SPACES_REGION;

export const bucketName = process.env.DO_SPACES_BUCKET;

if (!accessKeyId) {
  console.warn("DO_SPACES_KEY is not set in environment variables.");
}
if (!secretAccessKey) {
  console.warn("DO_SPACES_SECRET is not set in environment variables.");
}
if (!endpoint) {
  console.warn("DO_SPACES_ENDPOINT is not set in environment variables.");
}
if (!region) {
  console.warn("DO_SPACES_REGION is not set in environment variables.");
}
if (!bucketName) {
  console.warn("DO_SPACES_BUCKET is not set in environment variables.");
}

let s3Client: S3Client | null = null;

if (accessKeyId && secretAccessKey && endpoint && region && bucketName) {
  s3Client = new S3Client({
    endpoint: `https://${endpoint}`,
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
  console.log("DigitalOcean Spaces S3 client initialized.");
} else {
  console.warn(
    "DigitalOcean Spaces S3 client not initialized due to missing credentials or configuration. File uploads to Spaces will not work."
  );
}

export { s3Client };
