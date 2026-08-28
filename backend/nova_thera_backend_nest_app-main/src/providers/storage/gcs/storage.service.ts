import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { StorageConfigService } from '../../../config/storage/config.service';

/**
 * Service-account JSON, accepted either base64-encoded or raw.
 *
 * Base64 is strongly preferred and what `.env.example` documents: the private
 * key contains newlines, and pasting raw JSON into a `.env` reliably corrupts
 * it — dotenv turns the escaped `\n` sequences into real line breaks and the
 * JSON no longer parses.
 */
function decodeCredentials(raw: string): string {
  const value = raw.trim();
  if (value.startsWith('{')) return value;
  return Buffer.from(value, 'base64').toString('utf8');
}

export type StorageTarget = 'document' | 'productImage';

export type SignedUpload = {
  /** PUT the file here with exactly the Content-Type that was signed. */
  uploadUrl: string;
  /** Store this, not the URL — private objects need a fresh signature to read. */
  objectPath: string;
  /** Public URL for product images; null for documents. */
  publicUrl: string | null;
  expiresAt: Date;
};

/**
 * Google Cloud Storage access for uploads and private reads.
 *
 * Browsers upload straight to GCS using a short-lived signed URL, so file bytes
 * never pass through this API. Two buckets are used deliberately:
 *
 *   documents      — customer health information (assessments, labs, consents).
 *                    Public access prevention is enforced on the bucket, so the
 *                    only way to read an object is a signed URL minted here
 *                    after a permission check.
 *   product images — public marketing assets, served directly from the bucket.
 */
@Injectable()
export class GcsStorageService {
  private readonly logger = new Logger(GcsStorageService.name);
  private readonly client: Storage | null;

  constructor(private readonly config: StorageConfigService) {
    this.client = this.createClient();
  }

  private createClient(): Storage | null {
    if (!this.config.isConfigured) {
      this.logger.warn(
        'GCS buckets are not configured — uploads will be rejected',
      );
      return null;
    }

    try {
      const raw = this.config.credentialsJson;
      if (raw) {
        const credentials = JSON.parse(decodeCredentials(raw)) as {
          client_email: string;
          private_key: string;
          project_id?: string;
        };
        return new Storage({
          projectId: this.config.projectId || credentials.project_id,
          credentials,
        });
      }

      // No inline key: fall back to GOOGLE_APPLICATION_CREDENTIALS or the
      // host's attached identity (Cloud Run, GCE, Workload Identity).
      return new Storage({
        projectId: this.config.projectId || undefined,
      });
    } catch (error) {
      this.logger.error(
        `Could not initialise Cloud Storage: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  private bucketFor(target: StorageTarget): string {
    return target === 'document'
      ? this.config.documentsBucket
      : this.config.productImagesBucket;
  }

  /**
   * Builds an unguessable object path. The original filename is never used as
   * the key — it can contain traversal sequences, unicode tricks, or the
   * customer's name, none of which belong in a storage path.
   */
  private buildObjectPath(input: {
    target: StorageTarget;
    filename: string;
    scopeId?: string;
  }): string {
    const extension = extname(input.filename).toLowerCase().slice(0, 10);
    const safeExtension = /^\.[a-z0-9]+$/.test(extension) ? extension : '';
    const id = randomUUID();

    if (input.target === 'document') {
      // Scoped per customer so lifecycle rules and access audits can reason
      // about one person's records as a unit.
      const scope = input.scopeId ?? 'unassigned';
      return `documents/${scope}/${id}${safeExtension}`;
    }
    return `products/${id}${safeExtension}`;
  }

  async createUploadUrl(input: {
    target: StorageTarget;
    filename: string;
    contentType: string;
    scopeId?: string;
  }): Promise<SignedUpload> {
    const client = this.client;
    if (!client) throw new Error('Cloud Storage is not configured');

    const bucketName = this.bucketFor(input.target);
    const objectPath = this.buildObjectPath(input);
    const expiresAt = new Date(
      Date.now() + this.config.uploadUrlTtlSeconds * 1000,
    );

    const [uploadUrl] = await client
      .bucket(bucketName)
      .file(objectPath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: expiresAt,
        // Binds the signature to this content type — the browser cannot upload
        // an executable against a URL signed for an image.
        contentType: input.contentType,
      });

    return {
      uploadUrl,
      objectPath,
      publicUrl:
        input.target === 'productImage'
          ? `https://storage.googleapis.com/${bucketName}/${objectPath}`
          : null,
      expiresAt,
    };
  }

  /**
   * Short-lived read URL for a private object. Callers must have already
   * checked that the requester is allowed to see this particular file.
   */
  async createReadUrl(
    target: StorageTarget,
    objectPath: string,
  ): Promise<string> {
    const client = this.client;
    if (!client) throw new Error('Cloud Storage is not configured');

    const [url] = await client
      .bucket(this.bucketFor(target))
      .file(objectPath)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: new Date(
          Date.now() + this.config.downloadUrlTtlSeconds * 1000,
        ),
      });

    return url;
  }

  async deleteObject(target: StorageTarget, objectPath: string): Promise<void> {
    const client = this.client;
    if (!client) return;

    try {
      await client
        .bucket(this.bucketFor(target))
        .file(objectPath)
        .delete({ ignoreNotFound: true });
    } catch (error) {
      // Never fail the caller's operation because cleanup failed — the bucket
      // has soft delete and versioning to fall back on.
      this.logger.warn(
        `Could not delete ${objectPath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
