import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Card, PrimaryButton, SectionTitle, ui } from "@/components/tunnel-ui";
import { appendDiagnosticEvent, getDiagnosticEvents, type DiagnosticEvent } from "@/lib/diagnostic-events";
import { AppPreferences, getPreferences, getProfiles, TunnelProfile } from "@/lib/tunnel-store";
import { getEngineStatus, type NativeEngineStatus } from "@/modules/tunnelguard-core";

export default function DiagnosticsScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<TunnelProfile[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>({ autoConnect: false, killSwitchEnabled: false });
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const [engineStatus, setEngineStatus] = useState<NativeEngineStatus>({ state: "development-build-required", detail: "Checking native bridge…", nativeModule: false });
  const [checking, setChecking] = useState(false);

  const hydrate = useCallback(async () => {
    const [savedProfiles, savedPreferences, savedEvents, nativeStatus] = await Promise.all([getProfiles(), getPreferences(), getDiagnosticEvents(), getEngineStatus()]);
    setProfiles(savedProfiles);
    setPreferences(savedPreferences);
    setEvents(savedEvents);
    setEngineStatus(nativeStatus);
  }, []);
  useFocusEffect(useCallback(() => { void hydrate(); }, [hydrate]));

  const active = profiles.find((profile) => profile.id === preferences.activeProfileId) ?? profiles[0];
  const runPreflight = async () => {
    setChecking(true);
    try {
      const refreshedStatus = await getEngineStatus();
      setEngineStatus(refreshedStatus);
      let nextEvents = await appendDiagnosticEvent(refreshedStatus.nativeModule ? "info" : "warning", refreshedStatus.detail);
      if (!active) nextEvents = await appendDiagnosticEvent("warning", "No active profile is configured on this device.");
      else if (requiresCredential(active.protocol) && !active.secretKey) nextEvents = await appendDiagnosticEvent("warning", "Selected profile is missing a required device-keystore credential.");
      else nextEvents = await appendDiagnosticEvent("info", "Selected profile passed local metadata and credential readiness checks.");
      setEvents(nextEvents);
    } finally { setChecking(false); }
  };

  const engineValue = engineStatus.state === "core-not-bundled" ? "Native bridge ready — core packaging pending" : engineStatus.state === "development-build-required" ? "Android development build required" : "VPN permission needed";
  return (
    <View style={ui.screen}>
      <Stack.Screen options={{ title: "Diagnostics", headerShadowVisible: false, headerStyle: { backgroundColor: "#F5F8FC" }, headerTintColor: "#102A43" }} />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View><Text style={ui.eyebrow}>Read-only</Text><Text style={ui.pageTitle}>Connection diagnostics</Text><Text style={[ui.pageSubtitle, styles.subtitle]}>Verify local readiness without adding traffic, credentials, or raw profile data to diagnostics.</Text><SectionTitle>Local status</SectionTitle><Card><DiagnosticRow icon="memory" label="Tunnel engine" value={engineValue} tone={engineStatus.nativeModule ? "warning" : "muted"} /><View style={ui.divider} /><DiagnosticRow icon="vpn-key" label="VPN permission" value={engineStatus.nativeModule ? "Request available after core packaging" : "Available in Android development build"} tone="muted" /><View style={ui.divider} /><DiagnosticRow icon="dns" label="DNS preference" value={active?.dnsMode === "cloudflare" ? "Cloudflare DNS" : active?.dnsMode === "custom" ? "Custom DNS" : "Automatic"} tone="muted" /></Card><SectionTitle>Selected profile</SectionTitle><Card><DiagnosticRow icon="storage" label="Server" value={active ? active.name : "No profile selected"} tone={active ? "success" : "muted"} /><View style={ui.divider} /><DiagnosticRow icon="settings-input-antenna" label="Protocol" value={active?.protocol?.toUpperCase() ?? "—"} tone="muted" /><View style={ui.divider} /><DiagnosticRow icon="shield" label="Credential storage" value={active?.secretKey ? "Device keystore" : "No local secret"} tone="muted" /></Card><SectionTitle>Local preflight events</SectionTitle></View>}
        ListEmptyComponent={<Card style={styles.eventCard}><MaterialIcons name="info-outline" size={24} color="#40728A" /><View style={styles.eventBody}><Text style={styles.eventTitle}>No preflight events yet</Text><Text style={styles.eventText}>Run a local preflight to check profile metadata, credential presence, and native bridge readiness.</Text></View></Card>}
        renderItem={({ item }) => <EventRow event={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={<View style={styles.footer}><PrimaryButton label={checking ? "Running preflight…" : "Run local preflight"} onPress={() => void runPreflight()} icon="fact-check" disabled={checking} /><PrimaryButton label="Manage profiles" onPress={() => router.push("/profiles" as Href)} icon="dns" variant="secondary" /></View>}
      />
    </View>
  );
}

function requiresCredential(protocol: TunnelProfile["protocol"]) { return !["http_proxy", "https_proxy", "socks5"].includes(protocol); }
function DiagnosticRow({ icon, label, value, tone }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; tone: "success" | "warning" | "muted" }) { const color = tone === "success" ? "#0C8C7E" : tone === "warning" ? "#B87500" : "#547086"; return <View style={styles.row}><MaterialIcons name={icon} size={20} color={color} /><View style={styles.rowBody}><Text style={styles.label}>{label}</Text><Text style={[styles.value, { color }]}>{value}</Text></View></View>; }
function EventRow({ event }: { event: DiagnosticEvent }) { const color = event.level === "error" ? "#C43D57" : event.level === "warning" ? "#B87500" : "#0C8C7E"; const icon = event.level === "error" ? "error-outline" : event.level === "warning" ? "warning-amber" : "check-circle-outline"; return <Card style={styles.eventRow}><MaterialIcons name={icon} size={21} color={color} /><View style={styles.eventBody}><Text style={[styles.eventTitle, { color }]}>{event.level.toUpperCase()}</Text><Text style={styles.eventText}>{event.message}</Text><Text style={styles.eventTime}>{new Date(event.createdAt).toLocaleString()}</Text></View></Card>; }

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 38 }, subtitle: { marginTop: 6 }, row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }, rowBody: { flex: 1 }, label: { color: "#173250", fontSize: 14, fontWeight: "800" }, value: { fontSize: 13, lineHeight: 18, marginTop: 2 }, eventCard: { flexDirection: "row", gap: 13, alignItems: "flex-start" }, eventRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" }, eventBody: { flex: 1 }, eventTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 0.55 }, eventText: { color: "#66788B", fontSize: 13, lineHeight: 19, marginTop: 3 }, eventTime: { color: "#8A9CAC", fontSize: 11, marginTop: 6 }, footer: { gap: 10, marginTop: 18 },
});
