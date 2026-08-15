import { TunnelProfile } from "./tunnel-store";

export type TunnelGuardExport = {
  format: "tunnelguard/v1";
  exportedAt: string;
  profiles: Array<Omit<TunnelProfile, "id" | "secretKey" | "createdAt" | "updatedAt">>;
};

/** Produces a portable profile bundle without device identifiers or secrets. */
export function createProfileExport(profiles: TunnelProfile[], exportedAt = new Date().toISOString()): TunnelGuardExport {
  return {
    format: "tunnelguard/v1",
    exportedAt,
    profiles: profiles.map(({ id: _id, secretKey: _secretKey, createdAt: _createdAt, updatedAt: _updatedAt, ...profile }) => profile),
  };
}

export function stringifyProfileExport(profiles: TunnelProfile[], exportedAt?: string) {
  return JSON.stringify(createProfileExport(profiles, exportedAt), null, 2);
}
