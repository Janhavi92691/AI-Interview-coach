/**
 * @file lib/blob.js
 * @description Azure Blob Storage client for private resume management.
 * Enforces:
 * 1. Private container isolation (no anonymous access, no public URLs).
 * 2. Partitioned path structure: <userId>/<resumeId>.pdf.
 * 3. Graceful in-memory dev fallback when storage connection string is not yet configured.
 */

import { BlobServiceClient } from "@azure/storage-blob";
import { AppError } from "./errors.js";

const DEFAULT_CONTAINER = "resumes";

// In-memory fallback for local dev & testing without cloud storage configured
const memoryBlobStorage = new Map(); // blobPath -> { buffer, mimeType }

/**
 * Checks if Azure Blob Storage connection string is set.
 * @returns {boolean}
 */
export function isAzureStorageConfigured() {
  return Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING);
}

/**
 * Returns the singleton BlobServiceClient instance.
 * @returns {BlobServiceClient}
 */
function getBlobServiceClient() {
  if (!globalThis._blobServiceClient) {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connStr) {
      throw new AppError("DB_ERROR", "Azure Storage connection string is missing.", 500);
    }
    globalThis._blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  }
  return globalThis._blobServiceClient;
}

/**
 * Returns the ContainerClient for resumes and ensures private access container exists.
 * @param {string} [containerName]
 * @returns {Promise<import("@azure/storage-blob").ContainerClient>}
 */
async function getContainerClient(containerName = process.env.AZURE_STORAGE_CONTAINER || DEFAULT_CONTAINER) {
  const serviceClient = getBlobServiceClient();
  const containerClient = serviceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

/**
 * Uploads a resume PDF buffer to private Azure Blob Storage.
 * Partitioned under: <userId>/<resumeId>.pdf
 *
 * @param {string} userId
 * @param {string} resumeId
 * @param {Buffer} buffer
 * @param {string} [mimeType="application/pdf"]
 * @returns {Promise<string>} The storage blob_path
 */
export async function uploadResumeBlob(userId, resumeId, buffer, mimeType = "application/pdf") {
  const blobPath = `${userId}/${resumeId}.pdf`;

  if (isAzureStorageConfigured()) {
    try {
      const containerClient = await getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
          blobContentDisposition: "attachment; filename=resume.pdf",
        },
      });

      return blobPath;
    } catch (err) {
      console.error("[Azure Blob Upload Error]", err);
      throw new AppError("UPLOAD_FAILED", "Failed to upload resume to cloud storage.", 500, err);
    }
  }

  // Local/Dev Fallback
  memoryBlobStorage.set(blobPath, { buffer, mimeType });
  return blobPath;
}

/**
 * Downloads a resume PDF buffer from private Azure Blob Storage.
 *
 * @param {string} blobPath - Format: <userId>/<resumeId>.pdf
 * @returns {Promise<Buffer>}
 */
export async function getResumeBlobBuffer(blobPath) {
  if (isAzureStorageConfigured()) {
    try {
      const containerClient = await getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      return await blockBlobClient.downloadToBuffer();
    } catch (err) {
      console.error("[Azure Blob Download Error]", err);
      throw new AppError("NOT_FOUND", "Resume file not found in storage.", 404, err);
    }
  }

  // Local/Dev Fallback
  const stored = memoryBlobStorage.get(blobPath);
  if (!stored) {
    throw new AppError("NOT_FOUND", "Resume file not found in local storage.", 404);
  }
  return stored.buffer;
}

/**
 * Deletes a resume PDF blob from storage.
 *
 * @param {string} blobPath - Format: <userId>/<resumeId>.pdf
 * @returns {Promise<boolean>}
 */
export async function deleteResumeBlob(blobPath) {
  if (isAzureStorageConfigured()) {
    try {
      const containerClient = await getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      const res = await blockBlobClient.deleteIfExists();
      return res.succeeded;
    } catch (err) {
      console.error("[Azure Blob Delete Error]", err);
      return false;
    }
  }

  // Local/Dev Fallback
  return memoryBlobStorage.delete(blobPath);
}

/**
 * Clears the in-memory fallback storage (for testing).
 */
export function resetMemoryBlobStorage() {
  memoryBlobStorage.clear();
}
