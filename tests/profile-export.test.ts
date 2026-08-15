import { describe, expect, it } from "vitest";

import { createEmptyDraft } from "../lib/profile-validation";
import { createProfileExport, stringifyProfileExport } from "../lib/profile-export";
import { TunnelProfile } from "../lib/tunnel-store";

describe("TunnelGuard profile export", () => {
  const profile: TunnelProfile = {
    ...createEmptyDraft("http_proxy"), id: "profile-1", name: "Office", host: "proxy.example.com", port: 8080,
    secretKey: "tunnelguard.profile.profile-1.secret", createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
  };

  it("exports portable profile metadata without a secret reference or device ID", () => {
    const bundle = createProfileExport([profile], "2026-08-14T00:00:00.000Z");
    expect(bundle).toMatchObject({ format: "tunnelguard/v1", profiles: [{ name: "Office", host: "proxy.example.com", port: 8080 }] });
    expect(JSON.stringify(bundle)).not.toContain("secretKey");
    expect(JSON.stringify(bundle)).not.toContain("profile-1");
  });

  it("formats a parseable TunnelGuard v1 document", () => {
    expect(JSON.parse(stringifyProfileExport([profile], "2026-08-14T00:00:00.000Z"))).toMatchObject({ format: "tunnelguard/v1" });
  });
});
