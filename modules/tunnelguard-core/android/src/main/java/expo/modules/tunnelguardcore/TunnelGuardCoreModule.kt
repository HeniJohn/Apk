package expo.modules.tunnelguardcore

import android.net.VpnService
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TunnelGuardCoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TunnelGuardCore")

    AsyncFunction("getEngineStatus") {
      TunnelGuardVpnService.statusSnapshot()
    }

    AsyncFunction("requestVpnPermission") {
      val context = appContext.reactContext ?: throw IllegalStateException("Android context is unavailable.")
      val intent = VpnService.prepare(context)
      if (intent == null) {
        mapOf("state" to "granted")
      } else {
        val activity = appContext.currentActivity ?: throw IllegalStateException("Open TunnelGuard from an Android activity to request VPN permission.")
        activity.startActivityForResult(intent, VPN_PERMISSION_REQUEST_CODE)
        mapOf("state" to "requested")
      }
    }

    AsyncFunction("start") { config: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("Android context is unavailable.")
      if (VpnService.prepare(context) != null) {
        mapOf("state" to "permission-required", "detail" to "Approve Android VPN permission before starting Heni Tech VPN.", "nativeModule" to true)
      } else {
        TunnelGuardVpnService.start(context, config)
        TunnelGuardVpnService.statusSnapshot()
      }
    }

    Function("stop") {
      val context = appContext.reactContext
      if (context != null) TunnelGuardVpnService.stop(context)
      TunnelGuardVpnService.statusSnapshot()
    }
  }

  private companion object { const val VPN_PERMISSION_REQUEST_CODE = 6241 }
}
