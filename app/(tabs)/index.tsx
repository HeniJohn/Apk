import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";
import { appendDiagnosticEvent } from "@/lib/diagnostic-events";
import { createEngineRequest } from "@/lib/tunnel-engine-request";
import { AppPreferences, draftFromProfile, getPreferences, getProfiles, protocolInfo, savePreferences, TunnelProfile } from "@/lib/tunnel-store";
import { getEngineStatus, requestVpnPermission, startEngine } from "@/modules/tunnelguard-core";

export default function HomeScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<TunnelProfile[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>({ autoConnect: false, killSwitchEnabled: false });
  const [starting, setStarting] = useState(false);
  const hydrate = useCallback(async () => { const [savedProfiles, savedPreferences] = await Promise.all([getProfiles(), getPreferences()]); setProfiles(savedProfiles); setPreferences(savedPreferences); }, []);
  useFocusEffect(useCallback(() => { void hydrate(); }, [hydrate]));
  const active = profiles.find((profile) => profile.id === preferences.activeProfileId) ?? profiles[0];
  const editActive = () => router.push(active ? ({ pathname: "/profile-form", params: { id: active.id } } as unknown as Href) : ("/profile-form" as Href));
  const start = async () => {
    if (!active) { await appendDiagnosticEvent("info", "Manual profile setup opened from Home."); editActive(); return; }
    setStarting(true);
    try {
      const status = await getEngineStatus();
      if (status.state === "development-build-required" || status.state === "core-not-bundled") { await appendDiagnosticEvent("warning", "Start was requested, but the native protocol engine is not included in this build."); Alert.alert("Start unavailable", "Your manual profile is saved. A native protocol engine must be included in the Android build before the tunnel can start."); return; }
      if (!active.secretKey && needsCredential(active.protocol)) { await appendDiagnosticEvent("warning", "Start was blocked because the selected profile has no stored credential."); Alert.alert("Credential required", "Edit the profile to add its private key or password before starting."); editActive(); return; }
      const permission = await requestVpnPermission();
      if (permission.state === "requested") { await appendDiagnosticEvent("info", "Android VPN permission was requested."); Alert.alert("VPN permission requested", "Approve Android VPN permission, then tap Start again."); return; }
      const result = await startEngine(JSON.stringify(createEngineRequest(draftFromProfile(active), { profileId: active.id, hasStoredSecret: Boolean(active.secretKey) })));
      await appendDiagnosticEvent("info", result.detail);
      Alert.alert("Engine status", result.detail);
    } catch (error) { await appendDiagnosticEvent("error", error instanceof Error ? error.message : "Could not prepare VPN."); Alert.alert("Could not start", error instanceof Error ? error.message : "Try again."); } finally { setStarting(false); }
  };
  const selectProfile = async () => { if (active) { await savePreferences({ ...preferences, activeProfileId: active.id }); setPreferences((current) => ({ ...current, activeProfileId: active.id })); } router.push("/profiles" as Href); };
  const protocolLabel = active ? protocolInfo[active.protocol].label : "Select protocol";
  return (
    <View style={styles.page}>
      <InjectorNavigation active="home" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => void start()} style={({ pressed }) => [styles.start, pressed && styles.pressed, starting && styles.disabled]}><Text style={styles.startText}>{starting ? "Starting…" : "Start"}</Text></Pressable>
        <Pressable onPress={editActive} style={({ pressed }) => [styles.settingCard, pressed && styles.pressed]}><View style={styles.cardIcon}><MaterialIcons name="swap-horiz" size={29} color="#DCE9EB" /></View><View style={styles.cardBody}><Text style={styles.cardLabel}>Protocol</Text><Text style={styles.cardValue}>{protocolLabel}</Text>{active ? <Text style={styles.cardDetail}>{active.host}:{active.port}</Text> : <Text style={styles.cardDetail}>Tap to enter server manually</Text>}</View><MaterialIcons name="chevron-right" size={32} color="#E5E5E5" /></Pressable>
        <Pressable onPress={editActive} style={({ pressed }) => [styles.settingCard, pressed && styles.pressed]}><View style={styles.cardIcon}><MaterialIcons name="public" size={28} color="#DCE9EB" /></View><View style={styles.cardBody}><Text style={styles.cardLabel}>Server Name Indication (SNI)</Text><Text style={styles.cardValue}>{active?.sni || "Not set"}</Text></View><MaterialIcons name="edit" size={26} color="#E5E5E5" /></Pressable>
        <Pressable onPress={editActive} style={({ pressed }) => [styles.dnsRow, pressed && styles.pressed]}><View style={[styles.checkbox, active?.dnsMode && active.dnsMode !== "automatic" && styles.checked]}>{active?.dnsMode && active.dnsMode !== "automatic" ? <MaterialIcons name="check" size={20} color="#FFFFFF" /> : null}</View><View><Text style={styles.dnsTitle}>DNS (Custom DNS)</Text><Text style={styles.dnsText}>{active?.dnsMode === "custom" ? active.customDns || "Configure DNS" : active?.dnsMode === "cloudflare" ? "Cloudflare DNS" : "Automatic DNS"}</Text></View></Pressable>
        <View style={styles.manualBar}><MaterialIcons name="edit-note" size={22} color="#7BD6DF" /><Text style={styles.manualText}>Manual profile configuration</Text><Pressable onPress={selectProfile} style={({ pressed }) => [styles.manage, pressed && styles.pressed]}><Text style={styles.manageText}>Profiles</Text></Pressable></View>
      </ScrollView>
    </View>
  );
}
function needsCredential(protocol: TunnelProfile["protocol"]) { return !["http_proxy", "https_proxy", "socks5"].includes(protocol); }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#111111" }, content: { padding: 18, gap: 28, paddingBottom: 42 }, start: { minHeight: 76, borderRadius: 39, backgroundColor: "#177F91", alignItems: "center", justifyContent: "center", marginTop: 18, shadowColor: "#000000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, startText: { color: "#FFFFFF", fontSize: 24, fontWeight: "700" }, settingCard: { minHeight: 126, backgroundColor: "#2B292A", borderRadius: 4, padding: 17, flexDirection: "row", alignItems: "center", gap: 14 }, cardIcon: { width: 40, alignItems: "center" }, cardBody: { flex: 1 }, cardLabel: { color: "#F0F0F0", fontSize: 16, fontWeight: "800" }, cardValue: { color: "#D6D6D6", fontSize: 20, marginTop: 7 }, cardDetail: { color: "#9EA5A6", fontSize: 13, marginTop: 5 }, dnsRow: { flexDirection: "row", alignItems: "center", gap: 15, paddingLeft: 4 }, checkbox: { width: 37, height: 37, borderRadius: 4, borderWidth: 2, borderColor: "#458C96", alignItems: "center", justifyContent: "center" }, checked: { backgroundColor: "#177F91" }, dnsTitle: { color: "#EEEEEE", fontSize: 18, fontWeight: "700" }, dnsText: { color: "#A7AFB0", fontSize: 14, marginTop: 3 }, manualBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C3033", borderWidth: 1, borderColor: "#265C62", borderRadius: 5, padding: 13, gap: 9 }, manualText: { color: "#D8F4F7", fontSize: 14, fontWeight: "700", flex: 1 }, manage: { paddingVertical: 5, paddingHorizontal: 8 }, manageText: { color: "#79D9E4", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.72 }, disabled: { opacity: 0.55 }, });
