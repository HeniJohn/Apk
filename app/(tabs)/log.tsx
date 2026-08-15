import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";
import { getDiagnosticEvents, type DiagnosticEvent } from "@/lib/diagnostic-events";

export default function LogScreen() {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const refresh = useCallback(async () => setEvents(await getDiagnosticEvents()), []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return (
    <View style={styles.page}>
      <InjectorNavigation active="log" />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, events.length === 0 && styles.emptyContent]}
        ListHeaderComponent={<View style={styles.bar}><Text style={styles.barTitle}>Connection log</Text><Pressable onPress={() => void refresh()} style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}><MaterialIcons name="refresh" size={20} color="#DDFBFF" /><Text style={styles.refreshText}>Refresh</Text></Pressable></View>}
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="subject" size={38} color="#5E939C" /><Text style={styles.emptyTitle}>No log entries</Text><Text style={styles.emptyText}>Connection and preflight events will appear here after you use Start or Tools.</Text></View>}
        renderItem={({ item }) => <View style={styles.entry}><View style={[styles.dot, item.level === "error" && styles.dotError, item.level === "warning" && styles.dotWarning]} /><View style={styles.entryBody}><Text style={styles.entryMessage}>{item.message}</Text><Text style={styles.entryTime}>{new Date(item.createdAt).toLocaleString()}</Text></View></View>}
        ItemSeparatorComponent={() => <View style={styles.line} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#111111" }, content: { padding: 18, paddingBottom: 32 }, emptyContent: { flexGrow: 1 }, bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, barTitle: { color: "#F5F5F5", fontSize: 19, fontWeight: "700" }, refresh: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, backgroundColor: "#286F7C", paddingHorizontal: 10, paddingVertical: 8 }, refreshText: { color: "#DDFBFF", fontSize: 12, fontWeight: "800" }, empty: { flex: 1, minHeight: 400, justifyContent: "center", alignItems: "center", paddingHorizontal: 36 }, emptyTitle: { color: "#F5F5F5", fontSize: 18, fontWeight: "700", marginTop: 13 }, emptyText: { color: "#9FA9AA", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 7 }, entry: { flexDirection: "row", gap: 11, backgroundColor: "#262425", paddingVertical: 14, paddingHorizontal: 12 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#29B9C7", marginTop: 5 }, dotWarning: { backgroundColor: "#E2A329" }, dotError: { backgroundColor: "#E65D66" }, entryBody: { flex: 1 }, entryMessage: { color: "#E7EBEB", fontSize: 14, lineHeight: 20 }, entryTime: { color: "#849193", fontSize: 11, marginTop: 5 }, line: { height: 1, backgroundColor: "#373536" }, pressed: { opacity: 0.7 },
});
