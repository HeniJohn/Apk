import { ProfileDraft, validateProfileDraft } from "./profile-validation";

export type EngineRequest = {
  profileId?: string;
  engine: "sing-box" | "dns-adapter";
  protocol: ProfileDraft["protocol"];
  endpoint: { host: string; port: number };
  transport: ProfileDraft["transport"];
  security: ProfileDraft["security"];
  options: Record<string, string | undefined>;
};

/**
 * Produces secret-free metadata for the Android native layer. The native core
 * retrieves the associated credential through the device keystore by profile ID.
 */
export function createEngineRequest(draft: ProfileDraft, options: { profileId?: string; hasStoredSecret?: boolean } = {}): EngineRequest {
  const errors = validateProfileDraft(draft, { allowMissingSecret: Boolean(options.hasStoredSecret) });
  if (Object.keys(errors).length > 0) throw new Error("A complete profile is required before starting a tunnel.");
  const dnsTunnel = draft.protocol === "dnstt" || draft.protocol === "slowdns";
  return {
    profileId: options.profileId,
    engine: dnsTunnel ? "dns-adapter" : "sing-box",
    protocol: draft.protocol,
    endpoint: { host: draft.host.trim(), port: Number(draft.port) },
    transport: draft.transport,
    security: draft.security,
    options: {
      username: draft.username?.trim(), sni: draft.sni?.trim(), path: draft.path?.trim(), uuid: draft.uuid?.trim(),
      cipher: draft.cipher?.trim(), clientAddress: draft.clientAddress?.trim(), peerPublicKey: draft.peerPublicKey?.trim(),
      tunnelDomain: draft.tunnelDomain?.trim(), resolver: draft.resolver?.trim(), obfuscation: draft.obfuscation?.trim(),
    },
  };
}
