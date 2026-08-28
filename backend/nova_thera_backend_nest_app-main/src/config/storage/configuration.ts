export default () => ({
  storage: {
    // Google Cloud Storage. Two buckets by design: customer documents are
    // health information and must never be publicly reachable, while product
    // images are public marketing assets served straight from the bucket.
    projectId: process.env.GCP_PROJECT_ID ?? '',
    documentsBucket: process.env.GCS_DOCUMENTS_BUCKET ?? '',
    productImagesBucket: process.env.GCS_PRODUCT_IMAGES_BUCKET ?? '',
    // Full service-account JSON. Preferred on hosts where only env vars are
    // available; falls back to GOOGLE_APPLICATION_CREDENTIALS (a file path)
    // and then to the runtime's default credentials.
    credentialsJson: process.env.GCP_SERVICE_ACCOUNT_KEY ?? '',
    // Signed upload URLs are single-use in practice and short-lived by design.
    uploadUrlTtlSeconds: Number(process.env.GCS_UPLOAD_URL_TTL ?? 600),
    // Document read links are handed to a browser; keep the window tight so a
    // leaked or shoulder-surfed URL stops working quickly.
    downloadUrlTtlSeconds: Number(process.env.GCS_DOWNLOAD_URL_TTL ?? 300),
  },
});
