import AsyncStorage from "@react-native-async-storage/async-storage";

import { buildDiagnosticEvent } from "./diagnostics-safety";

const DIAGNOSTIC_EVENTS_KEY = "tunnelguard.diagnostics.v1";
const MAX_EVENTS = 40;
export type DiagnosticEvent = ReturnType<typeof buildDiagnosticEvent> & { id: string };

export async function getDiagnosticEvents(): Promise<DiagnosticEvent[]> {
  const value = await AsyncStorage.getItem(DIAGNOSTIC_EVENTS_KEY);
  if (!value) return [];
  try { const events = JSON.parse(value) as DiagnosticEvent[]; return Array.isArray(events) ? events : []; } catch { return []; }
}

export async function appendDiagnosticEvent(level: "info" | "warning" | "error", message: string) {
  const event: DiagnosticEvent = { id: `diagnostic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...buildDiagnosticEvent(level, message) };
  const events = await getDiagnosticEvents();
  const next = [event, ...events].slice(0, MAX_EVENTS);
  await AsyncStorage.setItem(DIAGNOSTIC_EVENTS_KEY, JSON.stringify(next));
  return next;
}
