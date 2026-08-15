import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { stringifyProfileExport } from "./profile-export";
import { TunnelProfile } from "./tunnel-store";

export async function shareProfileExport(profiles: TunnelProfile[]) {
  if (Platform.OS === "web") throw new Error("Export files are available from the Android development build, not the web preview.");
  const file = new File(Paths.cache, `tunnelguard-profiles-${Date.now()}.json`);
  file.create({ overwrite: true, intermediates: true });
  file.write(stringifyProfileExport(profiles));
  if (!(await Sharing.isAvailableAsync())) throw new Error("The system share sheet is unavailable on this device.");
  await Sharing.shareAsync(file.uri, { dialogTitle: "Export TunnelGuard profiles", mimeType: "application/json" });
}
