import { EMBEDDED_PAYLOAD } from "../payload.generated";
import type { EmbeddedPayload, Payload } from "../types";

/**
 * Validate the embedded payload's sources and their marketplace references.
 * Throws a descriptive Error on the first problem; returns `p` unchanged on
 * success. Kept as a pure function so it can be unit-tested with fixtures.
 */
export function validatePayload(p: EmbeddedPayload): EmbeddedPayload {
  const marketplaceNames = new Set(p.marketplaces.map(m => m.name));

  for (const src of p.sources) {
    const label = src?.name ? `source "${src.name}"` : "a source";

    if (src.type !== "plugin" && src.type !== "mcp") {
      throw new Error(
        `Invalid ${label}: type must be "plugin" or "mcp", got ${JSON.stringify((src as { type?: unknown }).type)}.`,
      );
    }

    if (src.type === "plugin") {
      if (!src.marketplace) {
        throw new Error(`Invalid plugin ${label}: missing "marketplace".`);
      }
      if (!src.plugin) {
        throw new Error(`Invalid plugin ${label}: missing "plugin".`);
      }
      if (!marketplaceNames.has(src.marketplace)) {
        throw new Error(
          `Invalid plugin ${label}: marketplace "${src.marketplace}" is not declared in payload.marketplaces.`,
        );
      }
    } else {
      if (src.transport !== "http" && src.transport !== "sse") {
        throw new Error(
          `Invalid mcp ${label}: transport must be "http" or "sse", got ${JSON.stringify((src as { transport?: unknown }).transport)}.`,
        );
      }
      if (!src.url) {
        throw new Error(`Invalid mcp ${label}: missing "url".`);
      }
    }
  }

  if (p.contextWorkspace !== undefined) {
    const w = p.contextWorkspace as { repo?: unknown; dirName?: unknown; branch?: unknown };
    if (typeof w.repo !== "string" || !w.repo) {
      throw new Error(`Invalid contextWorkspace: missing non-empty "repo".`);
    }
    if (typeof w.dirName !== "string" || !w.dirName) {
      throw new Error(`Invalid contextWorkspace: missing non-empty "dirName".`);
    }
    if (w.branch !== undefined && (typeof w.branch !== "string" || !w.branch)) {
      throw new Error(`Invalid contextWorkspace: "branch" must be a non-empty string.`);
    }
  }

  return p;
}

/** Load and validate the payload embedded at build time. */
export function loadPayload(): Payload {
  return validatePayload(EMBEDDED_PAYLOAD);
}
