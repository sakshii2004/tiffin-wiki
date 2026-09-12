import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PresignSchema, ALLOWED_IMAGE_EXTENSIONS } from '@/lib/validations';
import { generatePresignedPutUrl, getPublicUrl } from '@/lib/r2';
import { getClientIp, hashIp, RateLimiters } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // IP-based rate limiting to prevent spamming presigned URLs
  const rawIp = getClientIp(req.headers);
  const ipHash = hashIp(rawIp);
  const rateLimit = RateLimiters.uploadPresign(ipHash);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many upload requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSeconds),
        },
      },
    );
  }

  const body = await req.json();

  // Validate input — contentType and filename extension (enforced by PresignSchema)
  const parsed = PresignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { filename, contentType, context } = parsed.data;
  // The original filename is used ONLY to extract the file extension. The stored
  // key uses only the UUID + extension for privacy (no user-supplied filename is
  // ever persisted or exposed) and to guarantee collision-free keys.
  const rawExt = extname(filename).toLowerCase();
  const ext = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(rawExt) ? rawExt : '.jpg';
  const uuid = randomUUID();

  // Key format: {context}s/{uuid}{ext} (Section 9)
  // e.g. listings/abc123.jpg or reviews/def456.png
  const key = `${context}s/${uuid}${ext}`;

  const presignedUrl = await generatePresignedPutUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ presignedUrl, key, publicUrl }, { status: 200 });
}
