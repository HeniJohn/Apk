import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

export function AppMark({ size = 44 }: { size?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.31 }]}>
      <MaterialIcons name="security" size={size * 0.58} color="#F6FFFE" />
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {action}
    </View>
  );
}

export function ProtocolPill({ protocol }: { protocol: string }) {
  return (
    <View style={styles.protocolPill}>
      <Text style={styles.protocolText}>{protocol.toUpperCase()}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const color = variant === "danger" ? "#D7435F" : variant === "secondary" ? "#E7F2F8" : "#17C3B2";
  const textColor = variant === "secondary" ? "#173250" : "#062E2B";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: color }, disabled && styles.disabled, pressed && styles.pressed]}
    >
      {icon ? <MaterialIcons name={icon} size={19} color={textColor} /> : null}
      <Text style={[styles.buttonLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FC" },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  eyebrow: { color: "#40728A", fontSize: 12, fontWeight: "800", letterSpacing: 1.15, textTransform: "uppercase" },
  pageTitle: { color: "#102A43", fontSize: 30, fontWeight: "800", letterSpacing: -0.65 },
  pageSubtitle: { color: "#66788B", fontSize: 15, lineHeight: 22 },
  row: { flexDirection: "row", alignItems: "center" },
  muted: { color: "#66788B", fontSize: 14, lineHeight: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#D8E2EA" },
});

const styles = StyleSheet.create({
  mark: { alignItems: "center", justifyContent: "center", backgroundColor: "#0B4262", shadowColor: "#0B4262", shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  sectionTitle: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 26, marginBottom: 10 },
  sectionTitleText: { color: "#173250", fontSize: 16, fontWeight: "800" },
  protocolPill: { alignSelf: "flex-start", borderRadius: 7, backgroundColor: "#DDF8F3", paddingHorizontal: 8, paddingVertical: 4 },
  protocolText: { color: "#087A70", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  button: { minHeight: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18 },
  buttonLabel: { fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#D8E2EA", borderRadius: 22, backgroundColor: "#FFFFFF", padding: 18, shadowColor: "#19324D", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
});
