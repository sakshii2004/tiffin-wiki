import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate a presigned PUT URL that the client uploads to directly.
 * The upload expires in 300 seconds (5 minutes).
 */
export async function generatePresignedPutUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 300 });
}

/**
 * Return the public URL for a stored object.
 * Served via the custom domain configured in Cloudflare R2.
 */
export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}
