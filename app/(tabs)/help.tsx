import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";

export default function HelpScreen() {
  const router = useRouter();
  return (
    <View style={styles.page}>
      <InjectorNavigation active="help" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help</Text>
        <HelpRow icon="edit" title="Add a manual profile" text="Open Tools or the document icon, then choose a protocol and enter the server details you are authorized to use." onPress={() => router.push("/profile-form" as Href)} />
        <HelpRow icon="play-arrow" title="Use Start" text="Home shows Start. It checks the selected profile and requests VPN permission only when a native tunnel engine is available." onPress={() => router.push("/" as Href)} />
        <HelpRow icon="subject" title="Review logs" text="Open Log to see privacy-safe local preflight and future connection events." onPress={() => router.push("/log" as Href)} />
        <View style={styles.notice}><MaterialIcons name="privacy-tip" size={24} color="#74D9E3" /><Text style={styles.noticeText}>Do not share private keys, passwords, or tokens in screenshots or exports. Heni Tech VPN saves credentials separately on the device.</Text></View>
      </ScrollView>
    </View>
  );
}

function HelpRow({ icon, title, text, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; text: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><MaterialIcons name={icon} size={25} color="#8BE3EC" /><View style={styles.rowBody}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowText}>{text}</Text></View><MaterialIcons name="chevron-right" size={24} color="#B6C7C8" /></Pressable>; }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#111111" }, content: { padding: 18, gap: 10 }, title: { color: "#F5F5F5", fontSize: 24, fontWeight: "700", marginBottom: 3 }, row: { backgroundColor: "#292728", borderWidth: 1, borderColor: "#343233", borderRadius: 5, flexDirection: "row", alignItems: "center", gap: 13, padding: 15 }, rowBody: { flex: 1 }, rowTitle: { color: "#F5F5F5", fontSize: 16, fontWeight: "700" }, rowText: { color: "#B3BABB", fontSize: 13, lineHeight: 19, marginTop: 4 }, notice: { marginTop: 10, flexDirection: "row", gap: 11, backgroundColor: "#17393F", borderRadius: 5, borderWidth: 1, borderColor: "#286673", padding: 15 }, noticeText: { flex: 1, color: "#D2F2F5", fontSize: 13, lineHeight: 19 }, pressed: { opacity: 0.72 }, });
