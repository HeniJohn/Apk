import { describe, expect, it } from "vitest";

import { buildDiagnosticEvent } from "../lib/diagnostics-safety";
import { initialTunnelLifecycle, transitionTunnelLifecycle } from "../lib/tunnel-lifecycle";

describe("TunnelGuard lifecycle safety", () => {
  it("does not reach connected before a start and verified handshake", () => {
    expect(transitionTunnelLifecycle(initialTunnelLifecycle, { type: "HANDSHAKE_VERIFIED" })).toMatchObject({ phase: "error", handshakeVerified: false });
    const preparing = transitionTunnelLifecycle(initialTunnelLifecycle, { type: "START_REQUESTED", profileId: "profile-1" });
    const starting = transitionTunnelLifecycle(preparing, { type: "ENGINE_STARTING" });
    expect(transitionTunnelLifecycle(starting, { type: "HANDSHAKE_VERIFIED" })).toMatchObject({ phase: "connected", handshakeVerified: true });
  });

  it("redacts credential-shaped values before logging", () => {
    const event = buildDiagnosticEvent("error", "password=top-secret uuid:ab-cd Authorization: Bearer abc.def");
    expect(event.message).toContain("password=[redacted]");
    expect(event.message).toContain("uuid:[redacted]");
    expect(event.message).not.toContain("top-secret");
    expect(event.message).not.toContain("abc.def");
  });
});
