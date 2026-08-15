import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Card, PrimaryButton } from "@/components/tunnel-ui";
import { createEmptyDraft, deleteProfile, draftFromProfile, getProfiles, ProfileDraft, protocolGroups, protocolInfo, type SecurityMode, type TransportMode, type TunnelProtocol, upsertProfile, validateProfileDraft } from "@/lib/tunnel-store";

export default function ProfileFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);
  const [draft, setDraft] = useState<ProfileDraft>(() => createEmptyDraft());
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const errors = useMemo(() => showErrors ? validateProfileDraft(draft, { allowMissingSecret: editing }) : {}, [draft, editing, showErrors]);

  const set = useCallback(<Key extends keyof ProfileDraft>(key: Key, value: ProfileDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const chooseProtocol = (protocol: TunnelProtocol) => {
    setDraft((current) => ({ ...createEmptyDraft(protocol), id: current.id, name: current.name, host: current.host, dnsMode: current.dnsMode, customDns: current.customDns }));
  };

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const profiles = await getProfiles();
      const profile = profiles.find((item) => item.id === id);
      if (!profile) {
        Alert.alert("Profile not found", "This profile is no longer available.");
        router.back();
        return;
      }
      setDraft(draftFromProfile(profile));
      setLoading(false);
    })();
  }, [id, router]);

  const save = async () => {
    const validationErrors = validateProfileDraft(draft, { allowMissingSecret: editing });
    if (Object.keys(validationErrors).length) {
      setShowErrors(true);
      Alert.alert("Review profile", "Fill all fields required for this protocol before saving.");
      return;
    }
    setSaving(true);
    try {
      await upsertProfile(draft, { allowMissingSecret: editing });
      router.back();
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const profiles = await getProfiles();
    const profile = profiles.find((item) => item.id === id);
    if (!profile) return;
    Alert.alert("Delete this profile?", "The server settings and local secret will be removed from this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteProfile(profile).then(() => router.back()) },
    ]);
  };

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: editing ? "Edit profile" : "Manual profile", headerShadowVisible: false, headerStyle: { backgroundColor: "#177F91" }, headerTintColor: "#FFFFFF", headerTitleStyle: { fontWeight: "600" } }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>{editing ? "Server settings" : "Manual setup"}</Text>
        <Text style={styles.title}>{editing ? "Edit tunnel profile" : "Add a tunnel profile"}</Text>
        <Text style={styles.subtitle}>Choose a protocol, then enter the server details you are authorized to use. Credentials stay only in the device keystore.</Text>

        <Card style={styles.card}>
          <Field label="Profile name" value={draft.name} placeholder="Work gateway" onChangeText={(value) => set("name", value)} error={errors.name} />
          <Text style={styles.fieldLabel}>Protocol</Text>
          {protocolGroups.map((group) => <View key={group.title} style={styles.protocolGroup}><Text style={styles.groupLabel}>{group.title}</Text><View style={styles.protocols}>{group.protocols.map((protocol) => <Pressable key={protocol} onPress={() => chooseProtocol(protocol)} style={({ pressed }) => [styles.protocolButton, draft.protocol === protocol && styles.protocolButtonActive, pressed && styles.pressed]}><Text style={[styles.protocolLabel, draft.protocol === protocol && styles.protocolLabelActive]}>{protocolInfo[protocol].label}</Text></Pressable>)}</View></View>)}
          <Text style={styles.protocolDescription}>{protocolInfo[draft.protocol].description}</Text>
          <Field label="Server host" value={draft.host} placeholder="vpn.example.com" onChangeText={(value) => set("host", value)} autoCapitalize="none" autoCorrect={false} error={errors.host} />
          <Field label="Port" value={draft.port} placeholder={protocolInfo[draft.protocol].port} onChangeText={(value) => set("port", value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" error={errors.port} />
          {needsUsername(draft.protocol) ? <Field label="SSH username" value={draft.username ?? ""} placeholder="Account username" onChangeText={(value) => set("username", value)} autoCapitalize="none" autoCorrect={false} error={errors.username} /> : null}
          {needsUuid(draft.protocol) ? <Field label="UUID" value={draft.uuid ?? ""} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" onChangeText={(value) => set("uuid", value)} autoCapitalize="none" autoCorrect={false} error={errors.uuid} /> : null}
          {draft.protocol === "shadowsocks" ? <Field label="Cipher" value={draft.cipher ?? ""} placeholder="aes-256-gcm" onChangeText={(value) => set("cipher", value)} autoCapitalize="none" autoCorrect={false} error={errors.cipher} /> : null}
          {draft.protocol === "wireguard" ? <><Field label="Client tunnel address" value={draft.clientAddress ?? ""} placeholder="10.0.0.2/32" onChangeText={(value) => set("clientAddress", value)} autoCapitalize="none" autoCorrect={false} error={errors.clientAddress} /><Field label="Peer public key" value={draft.peerPublicKey ?? ""} placeholder="Server public key" onChangeText={(value) => set("peerPublicKey", value)} autoCapitalize="none" autoCorrect={false} error={errors.peerPublicKey} /></> : null}
          {isDnsTunnel(draft.protocol) ? <><Field label="Tunnel domain" value={draft.tunnelDomain ?? ""} placeholder="tunnel.example.com" onChangeText={(value) => set("tunnelDomain", value)} autoCapitalize="none" autoCorrect={false} error={errors.tunnelDomain} /><Field label="DNS resolver" value={draft.resolver ?? ""} placeholder="1.1.1.1" onChangeText={(value) => set("resolver", value)} autoCapitalize="none" autoCorrect={false} error={errors.resolver} /></> : null}
          {usesStreamSettings(draft.protocol) ? <><SelectRow label="Transport" value={draft.transport} options={["raw", "websocket", "grpc"] as TransportMode[]} onSelect={(value) => set("transport", value)} /><SelectRow label="Security" value={draft.security} options={["none", "tls", "reality"] as SecurityMode[]} onSelect={(value) => set("security", value)} />{draft.security !== "none" ? <Field label="SNI / server name" value={draft.sni ?? ""} placeholder="cdn.example.com" onChangeText={(value) => set("sni", value)} autoCapitalize="none" autoCorrect={false} error={errors.sni} /> : null}{draft.transport === "websocket" ? <Field label="WebSocket path" value={draft.path ?? ""} placeholder="/connect" onChangeText={(value) => set("path", value)} autoCapitalize="none" autoCorrect={false} error={errors.path} /> : null}</> : null}
          {draft.protocol === "hysteria2" ? <Field label="Obfuscation (optional)" value={draft.obfuscation ?? ""} placeholder="Obfs password" onChangeText={(value) => set("obfuscation", value)} autoCapitalize="none" autoCorrect={false} /> : null}
          <View style={styles.secretHeader}><Text style={styles.fieldLabel}>{draft.protocol === "wireguard" ? "Private key" : needsSecret(draft.protocol) ? "Password / key" : "Password (optional)"}</Text><Pressable onPress={() => setShowSecret((visible) => !visible)} accessibilityLabel={showSecret ? "Hide secret" : "Show secret"} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><MaterialIcons name={showSecret ? "visibility-off" : "visibility"} size={20} color="#40728A" /></Pressable></View>
          <TextInput value={draft.secret ?? ""} placeholder={editing ? "Stored securely — enter to replace" : needsSecret(draft.protocol) ? "Required credential" : "Optional credential"} placeholderTextColor="#93A2B1" secureTextEntry={!showSecret} onChangeText={(value) => set("secret", value)} style={[styles.input, errors.secret && styles.inputError]} autoCapitalize="none" autoCorrect={false} />
          {errors.secret ? <Text style={styles.error}>{errors.secret}</Text> : null}
          <Text style={styles.helper}>The private credential is stored separately from profile metadata in the device keystore.</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>DNS preference</Text>
          {(["automatic", "cloudflare", "custom"] as const).map((mode) => <Pressable key={mode} onPress={() => set("dnsMode", mode)} style={({ pressed }) => [styles.dnsRow, pressed && styles.pressed]}><View style={[styles.radio, draft.dnsMode === mode && styles.radioActive]}>{draft.dnsMode === mode ? <View style={styles.radioDot} /> : null}</View><View style={styles.flexOne}><Text style={styles.dnsTitle}>{mode === "automatic" ? "Automatic" : mode === "cloudflare" ? "Cloudflare DNS" : "Custom DNS"}</Text><Text style={styles.dnsSubtitle}>{mode === "automatic" ? "Use the tunnel configuration." : mode === "cloudflare" ? "Use 1.1.1.1 when supported." : "Provide a DNS resolver address."}</Text></View></Pressable>)}
          {draft.dnsMode === "custom" ? <Field label="DNS address" value={draft.customDns ?? ""} placeholder="1.1.1.1" onChangeText={(value) => set("customDns", value)} error={errors.customDns} /> : null}
        </Card>

        <PrimaryButton label={saving ? "Saving…" : "Save profile"} onPress={() => void save()} icon="check" disabled={saving || loading} />
        {editing ? <Pressable onPress={() => void remove()} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><Text style={styles.deleteLabel}>Delete profile</Text></Pressable> : null}
      </ScrollView>
    </View>
  );
}

function needsUsername(protocol: TunnelProtocol) { return ["ssh", "ssh_tls", "ssh_ws"].includes(protocol); }
function needsUuid(protocol: TunnelProtocol) { return protocol === "vmess" || protocol === "vless"; }
function needsSecret(protocol: TunnelProtocol) { return !["http_proxy", "https_proxy", "socks5"].includes(protocol); }
function isDnsTunnel(protocol: TunnelProtocol) { return protocol === "dnstt" || protocol === "slowdns"; }
function usesStreamSettings(protocol: TunnelProtocol) { return ["ssh_tls", "ssh_ws", "vmess", "vless", "hysteria2"].includes(protocol); }

function SelectRow<T extends string>({ label, value, options, onSelect }: { label: string; value: T; options: readonly T[]; onSelect: (value: T) => void }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.selectOptions}>{options.map((option) => <Pressable key={option} onPress={() => onSelect(option)} style={({ pressed }) => [styles.selectOption, value === option && styles.selectOptionActive, pressed && styles.pressed]}><Text style={[styles.selectLabel, value === option && styles.selectLabelActive]}>{option.toUpperCase()}</Text></Pressable>)}</View></View>;
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} style={[styles.input, error && styles.inputError]} placeholderTextColor="#93A2B1" />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#111111" }, content: { padding: 18, paddingBottom: 42, gap: 14 }, eyebrow: { color: "#8ACFD7", fontSize: 12, fontWeight: "900", letterSpacing: 0.9, textTransform: "uppercase" }, title: { color: "#F5F5F5", fontSize: 27, lineHeight: 33, fontWeight: "800", letterSpacing: -0.6, marginTop: 4 }, subtitle: { color: "#B3BBBB", fontSize: 14, lineHeight: 21 }, card: { gap: 4, backgroundColor: "#292728", borderColor: "#3C3A3B", borderRadius: 5, shadowOpacity: 0, elevation: 0 }, field: { marginTop: 10 }, fieldLabel: { color: "#E6E8E8", fontSize: 13, fontWeight: "800", marginBottom: 7 }, input: { minHeight: 48, borderRadius: 4, borderColor: "#505153", borderWidth: 1, backgroundColor: "#1A1A1A", color: "#F2F2F2", fontSize: 16, paddingHorizontal: 13 }, inputError: { borderColor: "#E1666E" }, error: { color: "#F08A92", fontSize: 12, fontWeight: "600", marginTop: 5 }, protocols: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, protocolGroup: { marginBottom: 9 }, groupLabel: { color: "#8AA9AD", fontSize: 11, fontWeight: "900", letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }, protocolButton: { borderRadius: 4, borderColor: "#4A5051", borderWidth: 1, backgroundColor: "#1A1A1A", paddingHorizontal: 10, paddingVertical: 10 }, protocolButtonActive: { backgroundColor: "#1A8293", borderColor: "#7AD9E4" }, protocolLabel: { color: "#CFD5D5", fontSize: 11, fontWeight: "900", letterSpacing: 0.25 }, protocolLabelActive: { color: "#FFFFFF" }, protocolDescription: { color: "#94BFC5", fontSize: 12, fontWeight: "700", marginTop: -3, marginBottom: 3 }, selectOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, selectOption: { borderRadius: 4, borderColor: "#4A5051", borderWidth: 1, backgroundColor: "#1A1A1A", paddingHorizontal: 10, paddingVertical: 9 }, selectOptionActive: { backgroundColor: "#1A8293", borderColor: "#7AD9E4" }, selectLabel: { color: "#CFD5D5", fontSize: 10, fontWeight: "900", letterSpacing: 0.3 }, selectLabelActive: { color: "#FFFFFF" }, secretHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 }, iconButton: { padding: 5, marginBottom: 4 }, helper: { color: "#9EA9AA", fontSize: 12, lineHeight: 17, marginTop: 6 }, sectionHeading: { color: "#F1F1F1", fontSize: 16, fontWeight: "800", marginBottom: 3 }, dnsRow: { alignItems: "center", flexDirection: "row", gap: 11, paddingVertical: 11 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#8A999A", justifyContent: "center", alignItems: "center" }, radioActive: { borderColor: "#60D7E2" }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#48C6D4" }, flexOne: { flex: 1 }, dnsTitle: { color: "#EEEEEE", fontSize: 14, fontWeight: "800" }, dnsSubtitle: { color: "#A9B3B4", fontSize: 12, lineHeight: 17, marginTop: 2 }, deleteButton: { alignSelf: "center", paddingVertical: 12, paddingHorizontal: 16 }, deleteLabel: { color: "#F1848C", fontSize: 14, fontWeight: "800" }, pressed: { opacity: 0.72 },
});
