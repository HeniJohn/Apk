package expo.modules.tunnelguardcore

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import io.nekohasekai.libbox.CommandServer
import io.nekohasekai.libbox.CommandServerHandler
import io.nekohasekai.libbox.ConnectionOwner
import io.nekohasekai.libbox.InterfaceUpdateListener
import io.nekohasekai.libbox.LocalDNSTransport
import io.nekohasekai.libbox.NetworkInterfaceIterator
import io.nekohasekai.libbox.Notification
import io.nekohasekai.libbox.OverrideOptions
import io.nekohasekai.libbox.PlatformInterface
import io.nekohasekai.libbox.StringIterator
import io.nekohasekai.libbox.SystemProxyStatus
import io.nekohasekai.libbox.TunOptions
import io.nekohasekai.libbox.WIFIState
import java.util.concurrent.Executors

/** Android VpnService host for the version-pinned, GPLv3 libbox core. */
class TunnelGuardVpnService : VpnService(), CommandServerHandler, PlatformInterface {
  private val worker = Executors.newSingleThreadExecutor()
  private var commandServer: CommandServer? = null
  private var tunDescriptor: ParcelFileDescriptor? = null
  private var activeConfig: String? = null

  companion object {
    private const val TAG = "HeniTechVpn"
    private const val CHANNEL_ID = "heni-tech-vpn"
    private const val NOTIFICATION_ID = 711
    private const val ACTION_START = "expo.modules.tunnelguardcore.START"
    private const val ACTION_STOP = "expo.modules.tunnelguardcore.STOP"
    private const val EXTRA_CONFIG = "sing_box_config"

    @Volatile private var state = "idle"
    @Volatile private var detail = "Native tunnel is idle."

    fun statusSnapshot() = mapOf("state" to state, "detail" to detail, "nativeModule" to true)

    fun start(context: Context, config: String) {
      state = "starting"
      detail = "Starting the bundled sing-box engine."
      val intent = Intent(context, TunnelGuardVpnService::class.java).setAction(ACTION_START).putExtra(EXTRA_CONFIG, config)
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      context.startService(Intent(context, TunnelGuardVpnService::class.java).setAction(ACTION_STOP))
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> stopEngine()
      ACTION_START -> {
        val config = intent.getStringExtra(EXTRA_CONFIG)
        if (config.isNullOrBlank()) {
          state = "error"
          detail = "A native engine configuration was not supplied."
          stopSelf()
        } else {
          showForegroundNotification("Connecting")
          worker.execute { startEngine(config) }
        }
      }
    }
    return START_NOT_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = if (intent?.action == SERVICE_INTERFACE) super.onBind(intent) else null

  override fun onRevoke() = stopEngine()

  override fun onDestroy() {
    stopEngine()
    worker.shutdown()
    super.onDestroy()
  }

  private fun startEngine(config: String) {
    try {
      if (VpnService.prepare(this) != null) throw IllegalStateException("Android VPN permission is not granted.")
      stopCoreOnly()
      val server = CommandServer(this, this)
      server.start()
      server.startOrReloadService(config, OverrideOptions())
      commandServer = server
      activeConfig = config
      state = "connected"
      detail = "Native sing-box service started; traffic is being routed through the configured manual profile."
      showForegroundNotification("Connected")
    } catch (error: Exception) {
      Log.e(TAG, "Native engine start failed", error)
      state = "error"
      detail = "Native engine could not start: ${error.message ?: "unknown error"}"
      stopCoreOnly()
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
    }
  }

  private fun stopEngine() {
    worker.execute {
      stopCoreOnly()
      state = "idle"
      detail = "Native tunnel stopped."
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
    }
  }

  private fun stopCoreOnly() {
    runCatching { commandServer?.closeService() }
    runCatching { commandServer?.close() }
    commandServer = null
    runCatching { tunDescriptor?.close() }
    tunDescriptor = null
    activeConfig = null
  }

  private fun showForegroundNotification(status: String) {
    val manager = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Heni Tech VPN", NotificationManager.IMPORTANCE_LOW))
    }
    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setContentTitle("Heni Tech VPN")
      .setContentText(status)
      .setOngoing(true)
      .build()
    startForeground(NOTIFICATION_ID, notification)
  }

  override fun autoDetectInterfaceControl(fd: Int) { protect(fd) }
  override fun clearDNSCache() = Unit
  override fun closeDefaultInterfaceMonitor(listener: InterfaceUpdateListener) = Unit
  override fun findConnectionOwner(ipProtocol: Int, sourceAddress: String, sourcePort: Int, destinationAddress: String, destinationPort: Int): ConnectionOwner {
    throw UnsupportedOperationException("Per-app process ownership is not enabled in this build.")
  }
  override fun getInterfaces(): NetworkInterfaceIterator = EmptyNetworkInterfaceIterator()
  override fun includeAllNetworks() = false
  override fun localDNSTransport(): LocalDNSTransport? = null

  override fun openTun(options: TunOptions): Int {
    if (VpnService.prepare(this) != null) throw IllegalStateException("Android VPN permission is not granted.")
    val builder = Builder().setSession("Heni Tech VPN").setMtu(options.mtu)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) builder.setMetered(false)
    addPrefixes(builder, options.inet4Address, true)
    addPrefixes(builder, options.inet6Address, true)
    if (options.autoRoute) {
      addPrefixes(builder, options.inet4RouteAddress, false)
      addPrefixes(builder, options.inet6RouteAddress, false)
      addApplications(builder, options.includePackage, true)
      addApplications(builder, options.excludePackage, false)
      options.dnsServerAddress.value?.takeIf { it.isNotBlank() }?.let { builder.addDnsServer(it) }
    }
    val descriptor = builder.establish() ?: throw IllegalStateException("Android did not establish the VPN interface.")
    tunDescriptor = descriptor
    return descriptor.fd
  }

  private fun addPrefixes(builder: Builder, iterator: io.nekohasekai.libbox.RoutePrefixIterator, address: Boolean) {
    while (iterator.hasNext()) {
      val prefix = iterator.next()
      if (address) builder.addAddress(prefix.address(), prefix.prefix()) else builder.addRoute(prefix.address(), prefix.prefix())
    }
  }

  private fun addApplications(builder: Builder, iterator: StringIterator, allowed: Boolean) {
    while (iterator.hasNext()) {
      val packageName = iterator.next()
      runCatching { if (allowed) builder.addAllowedApplication(packageName) else builder.addDisallowedApplication(packageName) }
        .onFailure { if (it !is PackageManager.NameNotFoundException) Log.w(TAG, "Unable to apply package routing", it) }
    }
  }

  override fun readWIFIState(): WIFIState? = null
  override fun sendNotification(notification: Notification) { Log.i(TAG, "Core notification: ${notification.title}") }
  override fun startDefaultInterfaceMonitor(listener: InterfaceUpdateListener) = Unit
  override fun systemCertificates(): StringIterator = EmptyStringIterator()
  override fun underNetworkExtension() = false
  override fun usePlatformAutoDetectInterfaceControl() = true
  override fun useProcFS() = false

  override fun getSystemProxyStatus() = SystemProxyStatus().apply { available = false; enabled = false }
  override fun serviceReload() {
    val config = activeConfig ?: return
    commandServer?.startOrReloadService(config, OverrideOptions())
  }
  override fun serviceStop() = stopEngine()
  override fun setSystemProxyEnabled(isEnabled: Boolean) = Unit
  override fun writeDebugMessage(message: String?) { if (!message.isNullOrBlank()) Log.d(TAG, message) }

  private class EmptyStringIterator : StringIterator {
    override fun hasNext() = false
    override fun len() = 0
    override fun next(): String = throw NoSuchElementException()
  }

  private class EmptyNetworkInterfaceIterator : NetworkInterfaceIterator {
    override fun hasNext() = false
    override fun next(): io.nekohasekai.libbox.NetworkInterface = throw NoSuchElementException()
  }
}
