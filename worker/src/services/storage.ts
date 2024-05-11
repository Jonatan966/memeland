import { S3Client } from "@aws-sdk/client-s3";

export function createStorageService(envs: Env) {
  const storageService = new S3Client({
    region: "auto",
    forcePathStyle: true,
    endpoint: envs.SUPABASE_STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: envs.SUPABASE_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: envs.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
    },
  });

  return storageService;
}
