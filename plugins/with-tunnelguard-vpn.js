const { withAndroidManifest, withProjectBuildGradle, withSettingsGradle } = require("expo/config-plugins");

const serviceName = "expo.modules.tunnelguardcore.TunnelGuardVpnService";
const permissions = [
  "android.permission.BIND_VPN_SERVICE",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
  "android.permission.POST_NOTIFICATIONS",
];

module.exports = function withTunnelGuardVpn(config) {
  config = withAndroidManifest(config, (config) => {
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

  config = withProjectBuildGradle(config, (config) => {
    const marker = "// Heni Tech VPN verified native core repository";
    if (!config.modResults.contents.includes(marker)) {
      const repository = `
    ${marker}
    ivy {
      url "https://github.com/HeniJohn/Apk/releases/download/native-core-v1.13.18/"
      patternLayout { artifact "[artifact].[ext]" }
      metadataSources { artifact() }
      content { includeModule "com.henitech.vpn", "libbox" }
    }`;
      config.modResults.contents = config.modResults.contents.replace(
        "    maven { url 'https://www.jitpack.io' }",
        `    maven { url 'https://www.jitpack.io' }${repository}`,
      );
    }
    return config;
  });

  return withSettingsGradle(config, (config) => {
    const marker = "// Heni Tech VPN verified native core repository";
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `

${marker}
dependencyResolutionManagement {
  repositories {
    ivy {
      url = uri("https://github.com/HeniJohn/Apk/releases/download/native-core-v1.13.18/")
      patternLayout { artifact("[artifact].[ext]") }
      metadataSources { artifact() }
      content { includeModule("com.henitech.vpn", "libbox") }
    }
  }
}
`;
    }
    return config;
  });
};
