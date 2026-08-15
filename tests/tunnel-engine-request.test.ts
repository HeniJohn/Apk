import { describe, expect, it } from "vitest";

import { createEmptyDraft } from "../lib/profile-validation";
import { createEngineRequest } from "../lib/tunnel-engine-request";

describe("TunnelGuard engine requests", () => {
  it("routes a complete WireGuard profile to sing-box without exposing its secret", () => {
    const draft = { ...createEmptyDraft("wireguard"), name: "Office", host: "wg.example.com", secret: "private-key", clientAddress: "10.0.0.2/32", peerPublicKey: "public-key" };
    expect(createEngineRequest(draft)).toMatchObject({ engine: "sing-box", protocol: "wireguard", endpoint: { host: "wg.example.com", port: 51820 } });
    expect(JSON.stringify(createEngineRequest(draft))).not.toContain("private-key");
  });

  it("routes a complete DNSTT profile to the dedicated DNS adapter", () => {
    const draft = { ...createEmptyDraft("dnstt"), name: "Fallback", host: "dns.example.com", secret: "client-key", tunnelDomain: "tunnel.example.com", resolver: "1.1.1.1" };
    expect(createEngineRequest(draft).engine).toBe("dns-adapter");
  });

  it("rejects a start request when a required secret is neither entered nor stored", () => {
    const draft = { ...createEmptyDraft("ssh"), name: "Remote", host: "ssh.example.com", username: "user" };
    expect(() => createEngineRequest(draft)).toThrow("complete profile");
    expect(createEngineRequest(draft, { hasStoredSecret: true })).toMatchObject({ engine: "sing-box", protocol: "ssh" });
  });
});
