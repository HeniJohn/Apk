import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export type NativeEngineStatus = {
  state: "development-build-required" | "permission-required" | "core-not-bundled" | "idle" | "starting" | "connected" | "error";
  detail: string;
  nativeModule: boolean;
};

type TunnelGuardCoreNativeModule = {
  getEngineStatus(): Promise<NativeEngineStatus>;
  requestVpnPermission(): Promise<{ state: "granted" | "requested" }>;
  start(request: string): Promise<NativeEngineStatus>;
  stop(): NativeEngineStatus;
};

function loadNativeModule() {
  if (Platform.OS === "web") return null;
  try { return requireNativeModule<TunnelGuardCoreNativeModule>("TunnelGuardCore"); } catch { return null; }
}

const nativeModule = loadNativeModule();
const unavailable: NativeEngineStatus = { state: "development-build-required", detail: "Install an Android development build to use Heni Tech VPN native capabilities.", nativeModule: false };

export async function getEngineStatus(): Promise<NativeEngineStatus> { return nativeModule ? nativeModule.getEngineStatus() : unavailable; }
export async function requestVpnPermission() {
  if (!nativeModule) throw new Error(unavailable.detail);
  return nativeModule.requestVpnPermission();
}
export async function startEngine(request: string): Promise<NativeEngineStatus> {
  if (!nativeModule) return unavailable;
  return nativeModule.start(request);
}
export function stopEngine(): NativeEngineStatus { return nativeModule ? nativeModule.stop() : unavailable; }

export default { getEngineStatus, requestVpnPermission, startEngine, stopEngine };
