import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { AppPreferences, getPreferences, savePreferences } from "@/lib/tunnel-store";

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<AppPreferences>({ autoConnect: false, killSwitchEnabled: false });
  const hydrate = useCallback(async () => setPreferences(await getPreferences()), []);
  useFocusEffect(useCallback(() => { void hydrate(); }, [hydrate]));
  const update = async (next: AppPreferences) => { setPreferences(next); await savePreferences(next); };
  return (
    <View style={styles.page}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={27} color="#FFFFFF" /></Pressable><Text style={styles.headerTitle}>Settings</Text></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.group}>
          <SettingRow icon="play-circle-outline" title="Connect when app opens" description="Prepare the selected manual profile on launch." value={preferences.autoConnect} onChange={(autoConnect) => void update({ ...preferences, autoConnect })} />
          <View style={styles.line} />
          <SettingRow icon="shield" title="Kill switch" description="Use when the Android native VPN engine is installed." value={preferences.killSwitchEnabled} onChange={(killSwitchEnabled) => void update({ ...preferences, killSwitchEnabled })} />
        </View>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Pressable onPress={() => router.push("/profiles" as Href)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}><MaterialIcons name="description" size={25} color="#8DE2EA" /><Text style={styles.linkText}>Profiles</Text><MaterialIcons name="chevron-right" size={27} color="#C2D0D1" /></Pressable>
        <Pressable onPress={() => router.push("/diagnostics" as Href)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}><MaterialIcons name="subject" size={25} color="#8DE2EA" /><Text style={styles.linkText}>Diagnostics and logs</Text><MaterialIcons name="chevron-right" size={27} color="#C2D0D1" /></Pressable>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.privacy}><MaterialIcons name="verified-user" size={24} color="#88DBE4" /><Text style={styles.privacyText}>Manual server settings are stored on this device. Credentials are kept separately and never included in profile exports.</Text></View>
        <Text style={styles.version}>Heni Tech VPN · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
function SettingRow({ icon, title, description, value, onChange }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.settingRow}><MaterialIcons name={icon} size={25} color="#8DE2EA" /><View style={styles.settingBody}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDescription}>{description}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: "#51595A", true: "#278D9D" }} thumbColor={value ? "#D9FFFF" : "#F3F4F4"} /></View>; }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#111111" }, header: { height: 72, backgroundColor: "#177F91", alignItems: "center", flexDirection: "row", paddingHorizontal: 13 }, back: { padding: 8 }, headerTitle: { flex: 1, color: "#FFFFFF", fontSize: 26, fontWeight: "500", marginLeft: 12 }, content: { padding: 18, paddingBottom: 36 }, sectionTitle: { color: "#9FC5C9", fontSize: 13, fontWeight: "900", letterSpacing: 0.8, marginTop: 17, marginBottom: 8, textTransform: "uppercase" }, group: { backgroundColor: "#2A2829", borderRadius: 4, borderWidth: 1, borderColor: "#3B393A" }, settingRow: { minHeight: 84, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 13 }, settingBody: { flex: 1 }, settingTitle: { color: "#F2F2F2", fontSize: 16, fontWeight: "700" }, settingDescription: { color: "#AAB2B3", fontSize: 12, lineHeight: 17, marginTop: 3 }, line: { height: 1, backgroundColor: "#414041", marginLeft: 53 }, linkRow: { minHeight: 61, backgroundColor: "#2A2829", borderRadius: 4, borderWidth: 1, borderColor: "#3B393A", alignItems: "center", flexDirection: "row", gap: 14, paddingHorizontal: 15, marginBottom: 8 }, linkText: { color: "#F1F1F1", fontSize: 16, fontWeight: "700", flex: 1 }, privacy: { flexDirection: "row", gap: 12, backgroundColor: "#18363A", borderWidth: 1, borderColor: "#2B646C", padding: 14, borderRadius: 4 }, privacyText: { color: "#D4F1F3", flex: 1, fontSize: 13, lineHeight: 20 }, version: { color: "#879293", fontSize: 12, textAlign: "center", marginTop: 31 }, pressed: { opacity: 0.72 }, });
