import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "@/core/config";
import crypto from "crypto";
import { AppLogger } from "@/core/logging/logger";

const logger = new AppLogger("RustFS");

const s3Client = new S3Client({
  region: config.rustfs.region,
  endpoint: config.rustfs.endpoint,
  credentials: {
    accessKeyId: config.rustfs.accessKey,
    secretAccessKey: config.rustfs.secretKey,
  },
  forcePathStyle: true, 
});

export const uploadFileToRustFS = async (
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> => {
  logger.info("Uploading file to RustFS", { originalName, mimetype });

  const uniqueId = crypto.randomUUID();
  const extension = originalName.split(".").pop();
  const key = `${uniqueId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: config.rustfs.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const publicUrl = `${config.rustfs.endpoint}/${config.rustfs.bucket}/${key}`;
  
  logger.info("File uploaded successfully", { url: publicUrl });
  
  return publicUrl;
};
