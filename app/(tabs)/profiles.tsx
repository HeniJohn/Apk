import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppMark, Card, PrimaryButton, ProtocolPill } from "@/components/tunnel-ui";
import { shareProfileExport } from "@/lib/native-profile-export";
import { getPreferences, getProfiles, parseImportedProfiles, savePreferences, TunnelProfile, upsertProfile } from "@/lib/tunnel-store";

export default function ProfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<TunnelProfile[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const refresh = useCallback(async () => setProfiles(await getProfiles()), []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const importBundle = async () => {
    setLoadingImport(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const content = asset.file ? await asset.file.text() : await new File(asset.uri).text();
      const drafts = parseImportedProfiles(content);
      for (const draft of drafts) await upsertProfile(draft, { allowMissingSecret: true });
      await refresh();
      Alert.alert("Profiles imported", `${drafts.length} profile${drafts.length === 1 ? "" : "s"} added to this device.`);
    } catch (error) {
      Alert.alert("Import could not be completed", error instanceof Error ? error.message : "Choose a valid TunnelGuard JSON file.");
    } finally {
      setLoadingImport(false);
    }
  };

  const select = async (profile: TunnelProfile) => {
    const preferences = await getPreferences();
    await savePreferences({ ...preferences, activeProfileId: profile.id });
    router.push("/");
  };

  const exportProfiles = async () => {
    if (!profiles.length) {
      Alert.alert("No profiles to export", "Add a profile first.");
      return;
    }
    try {
      await shareProfileExport(profiles);
    } catch (error) {
      Alert.alert("Could not export profiles", error instanceof Error ? error.message : "Try again from an Android development build.");
    }
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, profiles.length === 0 && styles.emptyContent]}
        ListHeaderComponent={<View><View style={styles.header}><View><Text style={styles.eyebrow}>Manual configurations</Text><Text style={styles.pageTitle}>Profiles</Text></View><AppMark size={44} /></View><Text style={styles.subtitle}>Create or import server configurations for any supported protocol.</Text></View>}
        ListEmptyComponent={<Card style={styles.emptyCard}><View style={styles.emptyIcon}><MaterialIcons name="dns" size={32} color="#147E9F" /></View><Text style={styles.emptyTitle}>No profiles yet</Text><Text style={styles.emptyText}>Create a manual profile, choose its protocol, and enter server details whenever you are ready.</Text><PrimaryButton label="Add manual profile" onPress={() => router.push("/profile-form" as Href)} icon="add" /></Card>}
        renderItem={({ item }) => <ProfileRow profile={item} onSelect={() => void select(item)} onEdit={() => router.push({ pathname: "/profile-form", params: { id: item.id } } as unknown as Href)} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListFooterComponent={<View style={styles.footer}><PrimaryButton label="Add manual profile" onPress={() => router.push("/profile-form" as Href)} icon="add" /><Pressable onPress={() => void importBundle()} style={({ pressed }) => [styles.importButton, pressed && styles.pressed]} disabled={loadingImport}><MaterialIcons name="file-download" size={19} color="#275F7A" /><Text style={styles.importText}>{loadingImport ? "Importing…" : "Import Heni Tech JSON"}</Text></Pressable><Pressable onPress={() => void exportProfiles()} style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}><MaterialIcons name="ios-share" size={19} color="#087A70" /><Text style={styles.exportText}>Export profiles (no secrets)</Text></Pressable><Text style={styles.hint}>Imports and exports use `tunnelguard/v1` JSON. Private credentials never leave the device keystore.</Text></View>}
      />
    </View>
  );
}

function ProfileRow({ profile, onSelect, onEdit }: { profile: TunnelProfile; onSelect: () => void; onEdit: () => void }) {
  return (
    <Pressable onPress={onSelect} style={({ pressed }) => [styles.profile, pressed && styles.pressed]} accessibilityLabel={`Select ${profile.name}`}>
      <View style={styles.profileIcon}><MaterialIcons name="storage" size={21} color="#147E9F" /></View>
      <View style={styles.profileBody}><Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text><Text style={styles.endpoint} numberOfLines={1}>{profile.host}:{profile.port}</Text><ProtocolPill protocol={profile.protocol} /></View>
      <Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]} hitSlop={8} accessibilityLabel={`Edit ${profile.name}`}><MaterialIcons name="edit" size={19} color="#4A6A80" /></Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#111111" },
  content: { padding: 18, paddingBottom: 36 },
  emptyContent: { flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: "#8ACFD7", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  pageTitle: { color: "#F5F5F5", fontSize: 29, fontWeight: "800", marginTop: 2 },
  subtitle: { color: "#B3BBBB", fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 22 },
  emptyCard: { alignItems: "center", paddingVertical: 30, marginTop: 34, backgroundColor: "#292728", borderColor: "#3C3A3B", borderRadius: 5, shadowOpacity: 0, elevation: 0 },
  emptyIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: "#245E69", alignItems: "center", justifyContent: "center", marginBottom: 13 },
  emptyTitle: { color: "#F4F4F4", fontSize: 18, fontWeight: "800" },
  emptyText: { color: "#B3BBBB", fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 7, marginBottom: 19 },
  profile: { borderRadius: 5, borderWidth: 1, borderColor: "#3C3A3B", backgroundColor: "#292728", padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  profileIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: "#245E69", alignItems: "center", justifyContent: "center" },
  profileBody: { flex: 1, gap: 3 },
  profileName: { color: "#F1F1F1", fontSize: 15, fontWeight: "800" },
  endpoint: { color: "#B3BBBB", fontSize: 12, marginBottom: 3 },
  editButton: { padding: 7 },
  footer: { gap: 11, marginTop: 22 },
  importButton: { minHeight: 48, backgroundColor: "#213F44", borderRadius: 5, borderWidth: 1, borderColor: "#2A6A73", justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8 },
  importText: { color: "#B1EEF4", fontSize: 14, fontWeight: "800" },
  exportButton: { minHeight: 48, backgroundColor: "#1B5F69", borderRadius: 5, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8 },
  exportText: { color: "#D7FAFD", fontSize: 14, fontWeight: "800" },
  hint: { color: "#96A4A5", fontSize: 12, lineHeight: 17, textAlign: "center", paddingHorizontal: 8 },
  pressed: { opacity: 0.72 },
});
