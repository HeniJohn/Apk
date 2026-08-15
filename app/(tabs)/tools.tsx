import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";

const toolCards = [
  { title: "Profiles", subtitle: "Create, edit, import, or export manual configurations.", icon: "description" as const, route: "/profiles" as Href },
  { title: "Connection check", subtitle: "Run local preflight checks without exposing credentials.", icon: "fact-check" as const, route: "/diagnostics" as Href },
  { title: "DNS settings", subtitle: "Configure automatic, Cloudflare, or custom DNS per profile.", icon: "dns" as const, route: "/profile-form" as Href },
];

export default function ToolsScreen() {
  const router = useRouter();
  return (
    <View style={styles.page}>
      <InjectorNavigation active="tools" />
      <View style={styles.content}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>Manage manual profiles and verify local configuration readiness.</Text>
        {toolCards.map((tool) => <Pressable key={tool.title} onPress={() => router.push(tool.route)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.toolIcon}><MaterialIcons name={tool.icon} size={27} color="#9EEAF1" /></View><View style={styles.cardBody}><Text style={styles.cardTitle}>{tool.title}</Text><Text style={styles.cardText}>{tool.subtitle}</Text></View><MaterialIcons name="chevron-right" size={28} color="#B9C8C9" /></Pressable>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#111111" }, content: { padding: 18, gap: 12 }, title: { color: "#F5F5F5", fontSize: 24, fontWeight: "700" }, subtitle: { color: "#AAB4B5", fontSize: 14, lineHeight: 20, marginBottom: 8 }, card: { backgroundColor: "#292728", minHeight: 98, flexDirection: "row", alignItems: "center", gap: 13, padding: 15, borderRadius: 5, borderWidth: 1, borderColor: "#343233" }, toolIcon: { width: 47, height: 47, borderRadius: 8, backgroundColor: "#236B78", alignItems: "center", justifyContent: "center" }, cardBody: { flex: 1 }, cardTitle: { color: "#F5F5F5", fontSize: 17, fontWeight: "700" }, cardText: { color: "#B3BABB", fontSize: 13, lineHeight: 18, marginTop: 4 }, pressed: { opacity: 0.72 }, });
