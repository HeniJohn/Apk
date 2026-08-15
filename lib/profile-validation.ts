export const protocolGroups = [
  { title: "VPN", protocols: ["wireguard"] },
  { title: "SSH tunnel", protocols: ["ssh", "ssh_tls", "ssh_ws"] },
  { title: "Proxy", protocols: ["http_proxy", "https_proxy", "socks5"] },
  { title: "V2Ray / Xray", protocols: ["vmess", "vless", "shadowsocks", "hysteria2"] },
  { title: "DNS tunnel", protocols: ["dnstt", "slowdns"] },
] as const;

export const tunnelProtocols = protocolGroups.flatMap((group) => group.protocols);
export type TunnelProtocol = (typeof tunnelProtocols)[number];
export type DnsMode = "automatic" | "cloudflare" | "custom";
export type TransportMode = "raw" | "websocket" | "grpc";
export type SecurityMode = "none" | "tls" | "reality";

export const protocolInfo: Record<TunnelProtocol, { label: string; description: string; port: string }> = {
  wireguard: { label: "WireGuard", description: "Peer-key VPN", port: "51820" },
  ssh: { label: "SSH", description: "Secure shell tunnel", port: "22" },
  ssh_tls: { label: "SSH + TLS", description: "SSH through TLS", port: "443" },
  ssh_ws: { label: "SSH + WebSocket", description: "SSH through WebSocket", port: "443" },
  http_proxy: { label: "HTTP Proxy", description: "HTTP forward proxy", port: "8080" },
  https_proxy: { label: "HTTPS Proxy", description: "TLS HTTP proxy", port: "443" },
  socks5: { label: "SOCKS5", description: "SOCKS proxy", port: "1080" },
  vmess: { label: "VMess", description: "V2Ray VMess", port: "443" },
  vless: { label: "VLESS", description: "Xray VLESS", port: "443" },
  shadowsocks: { label: "Shadowsocks", description: "Encrypted proxy", port: "8388" },
  hysteria2: { label: "Hysteria 2", description: "QUIC proxy", port: "443" },
  dnstt: { label: "DNSTT", description: "DNS tunnel", port: "53" },
  slowdns: { label: "SlowDNS", description: "DNS tunnel", port: "53" },
};

export type ProfileDraft = {
  id?: string;
  name: string;
  protocol: TunnelProtocol;
  host: string;
  port: string;
  username?: string;
  secret?: string;
  dnsMode: DnsMode;
  customDns?: string;
  transport: TransportMode;
  security: SecurityMode;
  sni?: string;
  path?: string;
  uuid?: string;
  cipher?: string;
  clientAddress?: string;
  peerPublicKey?: string;
  tunnelDomain?: string;
  resolver?: string;
  obfuscation?: string;
};

export function createEmptyDraft(protocol: TunnelProtocol = "wireguard"): ProfileDraft {
  return {
    name: "",
    protocol,
    host: "",
    port: protocolInfo[protocol].port,
    username: "",
    secret: "",
    dnsMode: "automatic",
    customDns: "",
    transport: protocol === "ssh_ws" ? "websocket" : "raw",
    security: protocol === "ssh_tls" || protocol === "ssh_ws" || protocol === "https_proxy" || protocol === "hysteria2" ? "tls" : "none",
    sni: "",
    path: protocol === "ssh_ws" ? "/" : "",
    uuid: "",
    cipher: "aes-256-gcm",
    clientAddress: "",
    peerPublicKey: "",
    tunnelDomain: "",
    resolver: "",
    obfuscation: "",
  };
}

function isTunnelProtocol(value: unknown): value is TunnelProtocol {
  return typeof value === "string" && (tunnelProtocols as readonly string[]).includes(value);
}

function isTransport(value: unknown): value is TransportMode {
  return value === "raw" || value === "websocket" || value === "grpc";
}

function isSecurity(value: unknown): value is SecurityMode {
  return value === "none" || value === "tls" || value === "reality";
}

function needsSecret(protocol: TunnelProtocol) {
  return !["http_proxy", "https_proxy", "socks5"].includes(protocol);
}

export function validateProfileDraft(draft: ProfileDraft, options: { allowMissingSecret?: boolean } = {}) {
  const errors: Partial<Record<keyof ProfileDraft, string>> = {};
  if (!draft.name.trim()) errors.name = "Profile name is required.";
  if (!draft.host.trim()) errors.host = "Server host is required.";
  const port = Number(draft.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = "Use a port from 1 to 65535.";
  if (draft.dnsMode === "custom" && !draft.customDns?.trim()) errors.customDns = "Enter a custom DNS address.";
  if (!options.allowMissingSecret && needsSecret(draft.protocol) && !draft.secret?.trim()) errors.secret = "A credential or private key is required.";

  if (draft.protocol === "wireguard") {
    if (!draft.clientAddress?.trim()) errors.clientAddress = "Enter the client tunnel address.";
    if (!draft.peerPublicKey?.trim()) errors.peerPublicKey = "Enter the peer public key.";
  }
  if (["ssh", "ssh_tls", "ssh_ws"].includes(draft.protocol) && !draft.username?.trim()) errors.username = "SSH username is required.";
  if (["vmess", "vless"].includes(draft.protocol) && !draft.uuid?.trim()) errors.uuid = "A UUID is required.";
  if (draft.protocol === "shadowsocks" && !draft.cipher?.trim()) errors.cipher = "Select or enter the Shadowsocks cipher.";
  if (["dnstt", "slowdns"].includes(draft.protocol)) {
    if (!draft.tunnelDomain?.trim()) errors.tunnelDomain = "Tunnel domain is required.";
    if (!draft.resolver?.trim()) errors.resolver = "DNS resolver is required.";
  }
  if (["ssh_tls", "ssh_ws", "vmess", "vless", "hysteria2"].includes(draft.protocol) && draft.security !== "none" && !draft.sni?.trim()) errors.sni = "SNI / server name is required.";
  if (["ssh_ws", "vmess", "vless"].includes(draft.protocol) && draft.transport === "websocket" && !draft.path?.trim()) errors.path = "WebSocket path is required.";
  return errors;
}

type ImportedBundle = { format: "tunnelguard/v1"; profiles: Array<Partial<ProfileDraft>> };

function stringField(value: unknown) { return typeof value === "string" ? value : ""; }

export function parseImportedProfiles(content: string): ProfileDraft[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error("The selected file is not valid JSON."); }
  const bundle = parsed as Partial<ImportedBundle>;
  if (bundle.format !== "tunnelguard/v1" || !Array.isArray(bundle.profiles)) throw new Error("Use a TunnelGuard v1 configuration file.");
  const drafts = bundle.profiles.map((profile): ProfileDraft => {
    const protocol = isTunnelProtocol(profile.protocol) ? profile.protocol : "wireguard";
    return {
      ...createEmptyDraft(protocol),
      name: stringField(profile.name),
      host: stringField(profile.host),
      port: typeof profile.port === "number" || typeof profile.port === "string" ? String(profile.port) : "",
      username: stringField(profile.username),
      dnsMode: profile.dnsMode === "cloudflare" || profile.dnsMode === "custom" ? profile.dnsMode : "automatic",
      customDns: stringField(profile.customDns),
      transport: isTransport(profile.transport) ? profile.transport : createEmptyDraft(protocol).transport,
      security: isSecurity(profile.security) ? profile.security : createEmptyDraft(protocol).security,
      sni: stringField(profile.sni),
      path: stringField(profile.path),
      uuid: stringField(profile.uuid),
      cipher: stringField(profile.cipher) || createEmptyDraft(protocol).cipher,
      clientAddress: stringField(profile.clientAddress),
      peerPublicKey: stringField(profile.peerPublicKey),
      tunnelDomain: stringField(profile.tunnelDomain),
      resolver: stringField(profile.resolver),
      obfuscation: stringField(profile.obfuscation),
      secret: "",
    };
  });
  if (!drafts.length || drafts.some((draft) => Object.keys(validateProfileDraft(draft, { allowMissingSecret: true })).length > 0)) {
    throw new Error("The file contains an incomplete or invalid profile.");
  }
  return drafts;
}
