import type { EngineRequest } from "./tunnel-engine-request";

type JsonObject = Record<string, unknown>;

function required(value: string | undefined, label: string) {
  const cleaned = value?.trim();
  if (!cleaned) throw new Error(`${label} is required before the tunnel can start.`);
  return cleaned;
}

function tlsFor(request: EngineRequest): JsonObject | undefined {
  if (request.security === "none") return undefined;
  const serverName = required(request.options.sni, "SNI / server name");
  const tls: JsonObject = { enabled: true, server_name: serverName };
  if (request.security === "reality") {
    tls.reality = { enabled: true, public_key: required(request.options.peerPublicKey, "Reality public key") };
  }
  return tls;
}

function transportFor(request: EngineRequest): JsonObject | undefined {
  if (request.transport === "raw") return undefined;
  if (request.transport === "websocket") return { type: "ws", path: required(request.options.path, "WebSocket path") };
  return { type: "grpc", service_name: required(request.options.path, "gRPC service name") };
}

function sshCredential(credential: string) {
  return credential.includes("-----BEGIN") ? { private_key: [credential] } : { password: credential };
}

function outboundFor(request: EngineRequest, credential?: string): JsonObject {
  const server = request.endpoint.host;
  const serverPort = request.endpoint.port;
  const tls = tlsFor(request);
  const transport = transportFor(request);
  const username = request.options.username?.trim();

  switch (request.protocol) {
    case "ssh":
      return { type: "ssh", tag: "proxy", server, server_port: serverPort, user: required(username, "SSH username"), ...sshCredential(required(credential, "SSH password or private key")) };
    case "http_proxy":
    case "https_proxy":
      return { type: "http", tag: "proxy", server, server_port: serverPort, ...(username ? { username } : {}), ...(credential ? { password: credential } : {}), ...(request.protocol === "https_proxy" ? { tls: tls ?? { enabled: true, server_name: request.options.sni?.trim() || server } } : {}) };
    case "socks5":
      return { type: "socks", tag: "proxy", server, server_port: serverPort, version: "5", ...(username ? { username } : {}), ...(credential ? { password: credential } : {}) };
    case "vmess":
      return { type: "vmess", tag: "proxy", server, server_port: serverPort, uuid: required(request.options.uuid, "VMess UUID"), security: "auto", ...(tls ? { tls } : {}), ...(transport ? { transport } : {}) };
    case "vless":
      return { type: "vless", tag: "proxy", server, server_port: serverPort, uuid: required(request.options.uuid, "VLESS UUID"), ...(tls ? { tls } : {}), ...(transport ? { transport } : {}) };
    case "shadowsocks":
      return { type: "shadowsocks", tag: "proxy", server, server_port: serverPort, method: required(request.options.cipher, "Shadowsocks cipher"), password: required(credential, "Shadowsocks password") };
    case "hysteria2":
      return { type: "hysteria2", tag: "proxy", server, server_port: serverPort, password: required(credential, "Hysteria2 password"), tls: tls ?? { enabled: true, server_name: request.options.sni?.trim() || server } };
    case "ssh_tls":
    case "ssh_ws":
      throw new Error("SSH over TLS/WebSocket requires the dedicated SSH transport adapter, which is not included in this libbox build yet.");
    case "wireguard":
      throw new Error("WireGuard endpoint mode requires its dedicated endpoint configuration adapter, which is not included in this libbox build yet.");
    case "dnstt":
    case "slowdns":
      throw new Error("This DNS tunnel requires the dedicated DNSTT/SlowDNS adapter, which is not included in this libbox build yet.");
  }
}

function dnsFor(request: EngineRequest): JsonObject | undefined {
  if (request.options.resolver?.trim()) return { servers: [{ tag: "profile-dns", address: request.options.resolver.trim() }], final: "profile-dns" };
  return undefined;
}

/**
 * Builds an in-memory sing-box configuration immediately before crossing the
 * native bridge. The credential is never persisted here, exported, or logged.
 */
export function createNativeEngineConfig(request: EngineRequest, credential?: string): JsonObject {
  if (request.engine !== "sing-box") throw new Error("This profile requires a DNS tunnel adapter rather than the bundled sing-box core.");
  const config: JsonObject = {
    log: { level: "warn" },
    inbounds: [{ type: "tun", tag: "tun-in", address: ["172.19.0.1/30", "fdfe:dcba:9876::1/126"], auto_route: true, strict_route: false, stack: "system" }],
    outbounds: [outboundFor(request, credential), { type: "direct", tag: "direct" }],
    route: { auto_detect_interface: true, final: "proxy" },
  };
  const dns = dnsFor(request);
  if (dns) config.dns = dns;
  return config;
}
