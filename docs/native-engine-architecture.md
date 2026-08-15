# Heni Tech VPN Native Engine Architecture

## Murtee

Heni Tech VPN protocolwwan baay’ee—SSH, TLS/WebSocket transports, HTTP/HTTPS proxy, SOCKS5, VMess, VLESS, Shadowsocks, Hysteria/QUIC, fi WireGuard—fayyadamuuf **sing-box** core tokkootti hirkata. DNSTT fi SlowDNS, waan core kana keessaa guutuutti hin jirreef, Android adapter/native core adda ta’een qophaa’u.

> Core binary tokko qofatu yeroo tokko keessatti active ta’a. Engine lama walfakkaataan start ta’uu yookaan state `Connected` sobaa mul’isuun hin hayyamamu.

## Layering

| Layer | Hojii | Daangaa |
|---|---|---|
  | Expo/TypeScript UI | Profile uumu, validate gochuu, settings, diagnostics, fi connection commands | Network packet hin qabu |
| Secure storage | Password, key, UUID/auth token encrypt gochuun device keystore keessatti kuusa | Secret logs/import export keessatti hin dabalamu |
| Config compiler | TunnelGuard profile gara sing-box JSON yookaan DNSTT configtti jijjiira | Protocol-specific field validation qaba |
| Kotlin `VpnService` | Android permission, foreground service, TUN file descriptor, lifecycle fi notification to’ata | Android development build qofa keessatti hojjetaa |
| Native core | sing-box yookaan DNSTT/SlowDNS adapter irraa actual tunnel run godha | ABI (`arm64-v8a`, `armeabi-v7a`) wal-simuun barbaachisa |
| State verifier | Handshake fi protected test traffic mirkaneessa, achiin booda qofa `Connected` godha | Proxy port banamuu qofa connected jechuun hin fudhatu |

## Protocol Map

| Family | TunnelGuard profile type | Core | Required fields | Status target |
|---|---|---|---|---|
| WireGuard | `wireguard` | sing-box | endpoint, peer key, client address, private key | TUN-ready |
| SSH | `ssh`, `ssh_tls`, `ssh_ws` | sing-box + transport config | host, port, user, secret, SNI/path when used | TUN-ready |
| Proxy | `http_proxy`, `https_proxy`, `socks5` | sing-box | host, port, optional auth | TUN-ready |
| V2Ray/Xray | `vmess`, `vless` | sing-box | host, port, UUID, transport/TLS fields | TUN-ready |
| Shadowsocks | `shadowsocks` | sing-box | host, port, cipher, password | TUN-ready |
| QUIC | `hysteria2` | sing-box | host, port, auth, SNI/obfs fields | TUN-ready |
| DNS tunnel | `dnstt`, `slowdns` | audited native adapter | tunnel domain, resolver, key/auth | adapter required |

## Android lifecycle

1. UI profile validate gochuu fi user Android VPN consent kennuuf request godha.
2. `VpnService` foreground service jalqaba; TUN interface create godha.
3. Native core config secure temporary file/memory irraa load godha.
4. Profile-specific handshake fi single safe request tunnel keessa mirkaneessuun state verify godha.
5. Verify ta’e qofa `Connected` state, elapsed time, fi bytes from native engine UI’tti dabsa.
6. Disconnect/error/network-loss keessatti core, TUN descriptor, wake lock, fi foreground notification tartiibaan cleanup godha.

## Expo integration

Local Expo module standard `modules/tunnelguard-core/android/src/main/java/...` structure fayyadama. Kotlin module kun JavaScript layer irraa `getEngineStatus`, `requestVpnPermission`, `start`, fi `stop` commands expose godha. Native code jijjiirraan Android development build irra deebiin build gochuu barbaada.

`VpnService`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`, fi foreground-service metadata AndroidManifest keessatti config plugin local irraa qophaa’u. Config plugin `withAndroidManifest` fayyadamuun prebuild yeroo manifest update godha. Expo Go native module kana hin load godhu; development build/prebuild environment qofa ta’a.

Local module Android Gradle library `com.android.library` fi `expo-module-gradle-plugin` fayyadama. `expo-module.config.json` keessatti Android module class fully-qualified name galchuun Expo autolinking akka argatu taasisa.

## Core packaging boundary

sing-box-for-Android project itself GPLv3 Android client dha; core bundle/code reuse gochuun TunnelGuard GPLv3 compliance fi third-party notices enforcement barbaachisa. Source build isaa ABI split (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) fayyadama. TunnelGuard initial release ARM Android ABI lama qofatti limit ta’a; build/test host keessatti Android SDK hin jirre jechuun Kotlin compile test offline hin xumuramu. Manifest plugin fi TypeScript bridge garuu prebuild fi type-check irratti validate ta’e.

## Security rules

Heni Tech VPN server mataa isaa hin bundle godhu. Profile secrets export hin ta’an; export filename/metadata qofa qaba. Log entry tokko username, password, private key, full URL path, yookaan raw config hin galchu. Engine binaries pinned-version, checksum, release provenance, fi license audit booda qofa build’tti dabalamu.

## License

sing-box GPLv3 dha. Core sana Heni Tech VPN binary keessatti bundling/embedding gochuun source code release, GPLv3 license text, third-party notices, fi modified-source obligations qulqullinaan raawwachuu barbaada. DNSTT/SlowDNS adapter filatamu immoo license isaa addaan audit godhamee, app release license waliin compatible ta’uu qaba.
