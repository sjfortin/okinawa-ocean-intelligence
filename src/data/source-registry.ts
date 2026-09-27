import type { SourceDefinition } from "@/domain/provenance";

export const sourceRegistry = {
  mccsDiveSites: {
    id: "mccs-tsunami-scuba-dive-sites",
    name: "MCCS Tsunami Scuba — Okinawa Dive Sites",
    canonicalUrl:
      "https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites",
    publisher: "Marine Corps Community Services",
    licenseNotes:
      "MCCS says information not identified as copyright-protected is public information and may be copied or distributed with appropriate credit requested. Store only retrieval metadata, hashes, locators, and short structured paraphrases; confirm broader republication or commercial-use assumptions with MCCS.",
  },
} as const satisfies Record<string, SourceDefinition>;
