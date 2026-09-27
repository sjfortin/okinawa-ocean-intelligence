import { describe, expect, it } from "vitest";

import { mccsSiteReviewQueue } from "@/data/mccs-site-review-queue";
import { createSourceSnapshotMetadata } from "@/server/sources/snapshot";

describe("source snapshots", () => {
  it("hashes response bytes without retaining the body", () => {
    const headers = new Headers({
      "content-type": "text/html; charset=utf-8",
      etag: '"fixture"',
    });

    const snapshot = createSourceSnapshotMetadata({
      sourceId: "fixture",
      canonicalUrl: "https://example.com/source",
      resolvedUrl: "https://example.com/source",
      retrievedAt: "2026-09-27T00:00:00.000Z",
      httpStatus: 200,
      body: new TextEncoder().encode("hello"),
      headers,
    });

    expect(snapshot.contentHash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
    expect(snapshot.byteLength).toBe(5);
    expect(snapshot.bodyStored).toBe(false);
    expect(snapshot.storageUri).toBeNull();
    expect(snapshot).not.toHaveProperty("body");
  });
});

describe("MCCS review queue", () => {
  it("enumerates unique heading-level source locators", () => {
    expect(mccsSiteReviewQueue).toHaveLength(15);
    expect(new Set(mccsSiteReviewQueue.map((item) => item.sourceLocator)).size).toBe(15);
  });

  it("keeps every catalog item in verification", () => {
    expect(
      mccsSiteReviewQueue.every(
        (item) =>
          item.identityStatus === "needs_verification" &&
          item.coordinatesStatus === "needs_verification" &&
          item.accessStatus === "needs_verification",
      ),
    ).toBe(true);
  });
});
