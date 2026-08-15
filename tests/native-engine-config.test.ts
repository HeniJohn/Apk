import { describe, expect, it } from "vitest";
import { createNativeEngineConfig } from "../lib/native-engine-config";
import type { EngineRequest } from "../lib/tunnel-engine-request";

function request(protocol: EngineRequest["protocol"]): EngineRequest {
  return {
    engine: "sing-box",
    protocol,
    endpoint: { host: "vpn.example.test", port: 22 },
    transport: "raw",
    security: "none",
    options: { username: "operator", sni: undefined, path: undefined, uuid: "00000000-0000-4000-8000-000000000000", cipher: "aes-256-gcm", clientAddress: undefined, peerPublicKey: undefined, tunnelDomain: undefined, resolver: undefined, obfuscation: undefined },
  };
}

describe("native sing-box configuration", () => {
  it("compiles a raw SSH profile into a TUN-routed libbox config", () => {
    const config = createNativeEngineConfig(request("ssh"), "device-only-password");
    expect(config.inbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "tun", auto_route: true })]));
    expect(config.outbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "ssh", user: "operator", password: "device-only-password" })]));
    expect(config.route).toEqual(expect.objectContaining({ final: "proxy" }));
  });

  it("adds an HTTPS proxy TLS setting without requiring a saved proxy password", () => {
    const config = createNativeEngineConfig({ ...request("https_proxy"), endpoint: { host: "proxy.example.test", port: 443 }, security: "tls", options: { ...request("https_proxy").options, sni: "proxy.example.test" } });
    expect(config.outbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "http", tls: expect.objectContaining({ enabled: true, server_name: "proxy.example.test" }) })]));
  });

  it("rejects adapters that are not packaged in the current libbox artifact", () => {
    expect(() => createNativeEngineConfig(request("dnstt"), "secret")).toThrow("DNS tunnel");
    expect(() => createNativeEngineConfig(request("ssh_tls"), "secret")).toThrow("SSH over TLS");
  });
});
