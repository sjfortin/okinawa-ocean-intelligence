export interface SourceDefinition {
  id: string;
  name: string;
  canonicalUrl: string;
  publisher: string;
  licenseNotes: string;
}

export interface SourceSnapshotMetadata {
  schemaVersion: 1;
  sourceId: string;
  canonicalUrl: string;
  resolvedUrl: string;
  retrievedAt: string;
  httpStatus: number;
  contentHash: string;
  hashAlgorithm: "sha256";
  byteLength: number;
  contentType: string | null;
  etag: string | null;
  lastModified: string | null;
  bodyStored: false;
  storageUri: null;
}
