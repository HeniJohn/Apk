import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type InjectorTab = "home" | "log" | "tools" | "help";

const tabs: { key: InjectorTab; label: string; route: Href }[] = [
  { key: "home", label: "Home", route: "/" as Href },
  { key: "log", label: "Log", route: "/log" as Href },
  { key: "tools", label: "Tools", route: "/tools" as Href },
  { key: "help", label: "Help", route: "/help" as Href },
];

export function InjectorNavigation({ active }: { active: InjectorTab }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable onPress={() => router.push("/profiles" as Href)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="Open profiles">
          <MaterialIcons name="menu" size={29} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>Heni Tech VPN</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/settings" as Href)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="Open settings">
            <MaterialIcons name="settings" size={29} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => router.push("/profile-form" as Href)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="Create manual profile">
            <MaterialIcons name="description" size={27} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => Alert.alert("Heni Tech VPN", "Choose a tab to manage profiles, review logs, use tools, or open help.")} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="More options">
            <MaterialIcons name="more-vert" size={29} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable key={tab.key} onPress={() => router.replace(tab.route)} style={({ pressed }) => [styles.tab, active === tab.key && styles.activeTab, pressed && styles.pressed]}>
            <Text style={[styles.tabText, active === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#177F91", paddingTop: 7 },
  titleRow: { height: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "500", letterSpacing: -0.25, marginLeft: 8, flex: 1 },
  actions: { flexDirection: "row", alignItems: "center" },
  iconButton: { width: 35, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabRow: { flexDirection: "row", height: 57, paddingHorizontal: 20 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#67D1DF" },
  tabText: { color: "#A4D5DC", fontSize: 17, fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
  pressed: { opacity: 0.68 },
});
