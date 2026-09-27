import { createHash } from "node:crypto";

import type { SourceSnapshotMetadata } from "@/domain/provenance";

interface SnapshotInput {
  sourceId: string;
  canonicalUrl: string;
  resolvedUrl: string;
  retrievedAt: string;
  httpStatus: number;
  body: Uint8Array;
  headers: Pick<Headers, "get">;
}

export function createSourceSnapshotMetadata({
  sourceId,
  canonicalUrl,
  resolvedUrl,
  retrievedAt,
  httpStatus,
  body,
  headers,
}: SnapshotInput): SourceSnapshotMetadata {
  return {
    schemaVersion: 1,
    sourceId,
    canonicalUrl,
    resolvedUrl,
    retrievedAt,
    httpStatus,
    contentHash: createHash("sha256").update(body).digest("hex"),
    hashAlgorithm: "sha256",
    byteLength: body.byteLength,
    contentType: headers.get("content-type"),
    etag: headers.get("etag"),
    lastModified: headers.get("last-modified"),
    bodyStored: false,
    storageUri: null,
  };
}
