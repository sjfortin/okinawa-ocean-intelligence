export type ReviewQueueStatus = "seeded" | "not_seeded" | "partially_seeded";
export type SegmentationDecision = "single_site" | "needs_review";

export interface MccsSiteReviewItem {
  sourceLocator: string;
  candidateCanonicalNames: string[];
  listedActivities: Array<"snorkel" | "shore_dive">;
  segmentation: SegmentationDecision;
  seedStatus: ReviewQueueStatus;
  identityStatus: "needs_verification";
  coordinatesStatus: "needs_verification";
  accessStatus: "needs_verification";
  note?: string;
}

/**
 * Heading-level inventory reviewed against the MCCS dive-sites page on 2026-09-27.
 * It intentionally contains no copied page descriptions or directions.
 */
export const mccsSiteReviewQueue: MccsSiteReviewItem[] = [
  {
    sourceLocator: "Bolo Point / Cap Zanpa — heading",
    candidateCanonicalNames: ["Bolo Point", "Cape Zanpa"],
    listedActivities: ["shore_dive"],
    segmentation: "needs_review",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
    note: "Confirm whether the two names are aliases for one site.",
  },
  {
    sourceLocator: "Channel Crevasses — heading",
    candidateCanonicalNames: ["Channel Crevasses"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Devil's Cove — heading",
    candidateCanonicalNames: ["Devil's Cove"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "single_site",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Hedo Beach / Hedo Point — heading",
    candidateCanonicalNames: ["Hedo Beach", "Hedo Point"],
    listedActivities: ["shore_dive"],
    segmentation: "needs_review",
    seedStatus: "partially_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
    note: "The source assigns separate levels; the current seed represents Hedo Point only.",
  },
  {
    sourceLocator: "Horseshoe Beach — heading",
    candidateCanonicalNames: ["Horseshoe Beach"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Ie Island — heading",
    candidateCanonicalNames: ["Ie Island southeast side", "Wajee", "Rainbow Reef"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "needs_review",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
    note: "The heading contains multiple named areas and shore/boat contexts.",
  },
  {
    sourceLocator: "Ikei Island — heading",
    candidateCanonicalNames: ["Big Time Resort Side", "Mama-san Beach"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "needs_review",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Junkyard — heading",
    candidateCanonicalNames: ["Junkyard"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Kadena North — heading",
    candidateCanonicalNames: ["Kadena North"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Maeda Flats — heading",
    candidateCanonicalNames: ["Maeda Flats"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "single_site",
    seedStatus: "seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Maeda Point — heading",
    candidateCanonicalNames: ["Maeda Point"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "single_site",
    seedStatus: "seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Onna Point — heading",
    candidateCanonicalNames: ["Onna Point"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Sesoko Island — heading",
    candidateCanonicalNames: ["Sesoko Island first site", "Sesoko Island second site", "Seragaki Beach area"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "needs_review",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
    note: "The source appears to combine multiple entry areas; confirm record boundaries.",
  },
  {
    sourceLocator: "Sunabe Seawall — heading",
    candidateCanonicalNames: ["Sunabe Seawall"],
    listedActivities: ["snorkel", "shore_dive"],
    segmentation: "single_site",
    seedStatus: "seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
  },
  {
    sourceLocator: "Toliet Bowl — heading (source spelling)",
    candidateCanonicalNames: ["Toilet Bowl"],
    listedActivities: ["shore_dive"],
    segmentation: "single_site",
    seedStatus: "not_seeded",
    identityStatus: "needs_verification",
    coordinatesStatus: "needs_verification",
    accessStatus: "needs_verification",
    note: "Preserve the source spelling only in the locator; verify the canonical name.",
  },
];
