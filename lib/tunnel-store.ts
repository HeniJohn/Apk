import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { createEmptyDraft, type DnsMode, type ProfileDraft, type TunnelProtocol, validateProfileDraft } from "./profile-validation";

export { createEmptyDraft, parseImportedProfiles, protocolGroups, protocolInfo, tunnelProtocols, validateProfileDraft, type DnsMode, type ProfileDraft, type SecurityMode, type TransportMode, type TunnelProtocol } from "./profile-validation";

const PROFILES_KEY = "tunnelguard.profiles.v2";
const PREFERENCES_KEY = "tunnelguard.preferences.v1";

export type TunnelProfile = Omit<ProfileDraft, "id" | "port" | "secret"> & {
  id: string;
  port: number;
  secretKey?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppPreferences = { autoConnect: boolean; killSwitchEnabled: boolean; activeProfileId?: string };
const defaultPreferences: AppPreferences = { autoConnect: false, killSwitchEnabled: false };

function makeId() { return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function secretStorageKey(profileId: string) { return `tunnelguard.profile.${profileId}.secret`; }
function clean(value?: string) { return value?.trim() || undefined; }

async function setSecret(key: string, value: string) {
  if (Platform.OS === "web") { if (typeof sessionStorage !== "undefined") sessionStorage.setItem(key, value); return; }
  await SecureStore.setItemAsync(key, value);
}
async function removeSecret(key: string) {
  if (Platform.OS === "web") { if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(key); return; }
  await SecureStore.deleteItemAsync(key);
}

export async function getProfiles(): Promise<TunnelProfile[]> {
  const value = await AsyncStorage.getItem(PROFILES_KEY);
  if (!value) return [];
  try {
    const profiles = JSON.parse(value) as TunnelProfile[];
    return Array.isArray(profiles) ? profiles.map((profile) => ({ ...createEmptyDraft(profile.protocol), ...profile, secret: undefined } as TunnelProfile)) : [];
  } catch { return []; }
}
async function persistProfiles(profiles: TunnelProfile[]) { await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }

export async function upsertProfile(draft: ProfileDraft, options: { allowMissingSecret?: boolean } = {}): Promise<TunnelProfile> {
  const errors = validateProfileDraft(draft, options);
  if (Object.keys(errors).length > 0) throw new Error("Please correct the profile fields.");
  const profiles = await getProfiles();
  const existing = draft.id ? profiles.find((profile) => profile.id === draft.id) : undefined;
  const id = existing?.id ?? makeId();
  const now = new Date().toISOString();
  const secretKey = draft.secret?.trim() ? secretStorageKey(id) : existing?.secretKey;
  const { id: _draftId, port, secret: _secret, ...metadata } = draft;
  const profile: TunnelProfile = {
    ...metadata,
    id,
    name: draft.name.trim(),
    host: draft.host.trim(),
    port: Number(port),
    username: clean(draft.username),
    customDns: draft.dnsMode === "custom" ? clean(draft.customDns) : undefined,
    sni: clean(draft.sni), path: clean(draft.path), uuid: clean(draft.uuid), cipher: clean(draft.cipher),
    clientAddress: clean(draft.clientAddress), peerPublicKey: clean(draft.peerPublicKey),
    tunnelDomain: clean(draft.tunnelDomain), resolver: clean(draft.resolver), obfuscation: clean(draft.obfuscation),
    secretKey, createdAt: existing?.createdAt ?? now, updatedAt: now,
  };
  if (draft.secret?.trim()) await setSecret(secretStorageKey(id), draft.secret.trim());
  await persistProfiles(existing ? profiles.map((item) => item.id === id ? profile : item) : [profile, ...profiles]);
  return profile;
}

export async function deleteProfile(profile: TunnelProfile) {
  const profiles = await getProfiles();
  await persistProfiles(profiles.filter((item) => item.id !== profile.id));
  if (profile.secretKey) await removeSecret(profile.secretKey);
  const preferences = await getPreferences();
  if (preferences.activeProfileId === profile.id) await savePreferences({ ...preferences, activeProfileId: undefined });
}
export async function getPreferences(): Promise<AppPreferences> {
  const value = await AsyncStorage.getItem(PREFERENCES_KEY);
  if (!value) return defaultPreferences;
  try { return { ...defaultPreferences, ...(JSON.parse(value) as Partial<AppPreferences>) }; } catch { return defaultPreferences; }
}
export async function savePreferences(preferences: AppPreferences) { await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); }
export function draftFromProfile(profile: TunnelProfile): ProfileDraft {
  const { id, port, secretKey: _secretKey, createdAt: _createdAt, updatedAt: _updatedAt, ...metadata } = profile;
  return { ...metadata, id, port: String(port), secret: "" };
}
