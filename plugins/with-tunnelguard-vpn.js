const { withAndroidManifest } = require("expo/config-plugins");

const serviceName = "expo.modules.tunnelguardcore.TunnelGuardVpnService";
const permissions = [
  "android.permission.BIND_VPN_SERVICE",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
  "android.permission.POST_NOTIFICATIONS",
];

module.exports = function withTunnelGuardVpn(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest["uses-permission"] = manifest["uses-permission"] || [];
    for (const permission of permissions) {
      if (!manifest["uses-permission"].some((entry) => entry.$?.["android:name"] === permission)) {
        manifest["uses-permission"].push({ $: { "android:name": permission } });
      }
    }
    const application = manifest.application?.[0];
    if (!application) return config;
    application.service = application.service || [];
    if (!application.service.some((service) => service.$?.["android:name"] === serviceName)) {
      application.service.push({
        $: { "android:name": serviceName, "android:permission": "android.permission.BIND_VPN_SERVICE", "android:exported": "false", "android:foregroundServiceType": "dataSync" },
        "intent-filter": [{ action: [{ $: { "android:name": "android.net.VpnService" } }] }],
      });
    }
    return config;
  });
};
