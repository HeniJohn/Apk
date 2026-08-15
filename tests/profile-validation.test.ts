import { describe, expect, it } from "vitest";

import { createEmptyDraft, parseImportedProfiles, validateProfileDraft } from "../lib/profile-validation";

describe("TunnelGuard profile validation", () => {
  it("accepts a complete profile with an allowed port", () => {
    expect(validateProfileDraft({ ...createEmptyDraft("http_proxy"), name: "Office", host: "vpn.example.com", port: "8080" })).toEqual({});
  });

  it("requires a valid host, name, and port", () => {
    expect(validateProfileDraft({ ...createEmptyDraft("ssh"), name: "", host: "", port: "70000" })).toMatchObject({
      name: expect.any(String), host: expect.any(String), port: expect.any(String),
    });
  });

  it("parses only a complete TunnelGuard v1 import", () => {
    const profiles = parseImportedProfiles(JSON.stringify({
      format: "tunnelguard/v1",
      profiles: [{ name: "Home gateway", protocol: "http_proxy", host: "vpn.home.example", port: 8080, dnsMode: "cloudflare" }],
    }));
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({ name: "Home gateway", port: "8080", dnsMode: "cloudflare" });
    expect(() => parseImportedProfiles('{"profiles":[]}')).toThrow("TunnelGuard v1");
  });
});
