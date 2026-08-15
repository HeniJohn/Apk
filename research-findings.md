# Research Findings — TunnelGuard

## Public reference-app scope

Fuulli Google Play `HTTP Injector (SSH/V2ray) VPN` jedhu akka appichi SSH, proxy, SSL/TLS, DNS tunnel, Shadowsocks, V2Ray/Xray, Hysteria, fi WireGuard technologies walitti qabu ibsa. Akkasumas config import, profile control, DNS changer, app filter, diagnostics akka host checker, fi configuration export/provider mode tarreessa. Kun feature ummataaf ibsame qofa; implementation yookaan source code isaa hin argamne, hin kopi’amne.[1]

## Android-native constraint

Android VPN client dhugaa `VpnService` irraa dhaaluu qaba. User jalqabaaf system permission dialog keessa seena; service active ta’e notification hin cufamne fi status bar VPN indicator qabaachuu qaba. Service tokko qofatu user/profile tokko keessatti yeroo tokko active ta’uu danda’a. Local TUN interface irraa packets dubbisuun, gateway tti encryptionin erguun, response decrypt godhee interface tti deebisuun native engine VPN keessatti barbaachisa. `VpnService.prepare()` permission gaafata; tunnel socket loop hin uumuuf `VpnService.protect()` fayyadama.[2]

## Murtee phase jalqabaa

TunnelGuard jalqaba interface qulqulluu, profile kuusaa naannoo, config import/validation, connection-state, fi diagnostics privacy-safe ijaara. Tunneling engine guutuu UI Expo keessa qofa hin milkaa’u; Android native module/Kotlin fi development build barbaada. Protocol tokko filachuun dura gateway/server useriin qabu, protocol filatame, fi qaama native engine murteessuun barbaachisaa dha.

## Expo integration

Expo Go keessatti native libraries SDK keessaa qofa fayyadamuun ni danda’ama. `VpnService` wrapper Kotlin mataa isaa ykn library native qaama sadaffaa itti dabaluuf development build barbaachisa. Expo Modules API local module qopheessuuf karaa qophaa’e dha; Kotlin code fi JavaScript/TypeScript API walitti hidha. CNG fayyadamaa taanaan Android manifest configuration config plugin keessatti ibsamuu qaba, prebuild irraa booda `android/` folder qofa harkaan jijjiiruun immoo persistent miti.[3]

## Multi-protocol architecture findings

WireGuard Android dabalatee cross-platform implementation qaba; peer public-key fi endpoint settings sirriitti wal-simuun protocol kanaaf profile model ifa ta’e barbaachisa.[4] Project X (Xray) documentation keessatti VMess, VLESS, Shadowsocks, WebSocket, TLS, Hysteria, fi WireGuard protocol/transport/security layers adda baasee ibsa. Fakkeenyaaf, WebSocket yookaan Hysteria transport server fi client lamaan keessatti compatible ta’uu qabu; Hysteria transport TLS barbaada.[5]

Kana jechuun “protocol hunda” jechuun toggle tokko qofa miti. Profile schema protocol-specific ta’uu, validation server-side settings waliin wal simuu, fi Android native engine tokko yookaan engine walitti makame irraa state sirrii fudhachuu qaba. TunnelGuard engine support hin jirre keessatti `Connected` jechuun hin agarsiisu.

## DNS tunnel fi Hysteria findings

DNSTT Android app public source tokko Android full-device VPN mode, Android background proxy mode, fi DNS tunnel bandwidth daangeffamaa ta’uu isaa agarsiisa. Source history isaa connection dhugaa verify gochuu, concurrent SOCKS handshakes daangeessuu, fi service cleanup sirriitti to’achuuf barbaachisummaa ibsa.[6] Hysteria 2 immoo MIT license jalatti, QUIC irratti hundaa’e, SOCKS5/HTTP/TCP-UDP forwarding/TUN modes qaba; Android wrapper/packaging fi service lifecycle mataa isaa barbaada.[7]

Kanaaf DNS tunnel fi Hysteria raw UI setting irraa olitti qoodamuu qabu: binary/native core, Android ABI packaging, VPN lifecycle, timeouts, resource limits, fi connection verification tests barbaadu. Engine profiles walitti makuun osoo connection sirrii hin mirkaneessin state `Connected` hin qabaatu.

## Unified-core candidate

sing-box official outbound documentation WireGuard, Shadowsocks, VMess, VLESS, Hysteria/Hysteria2, SSH, DNS, fi transport-related protocols hedduu tarreessa.[8] Android client isaa local/remote config run gochuu fi Android TUN transparent-proxy implementation akka qabu ibsa.[9] Kanaaf TunnelGuard keessatti Xray, Shadowsocks, Hysteria, WireGuard, fi SSH module addaddaa walitti hidhuu irra, multi-protocol core tokko akka candidate isa jalqabaa qorachuun code complexity fi service lifecycle duplication xiqqeessa.

Garuu sing-box DNS outbound jechuun DNSTT/SlowDNS tunnel guutuu miti; DNSTT/SlowDNS support engine/qindaa’ina adda ta’e akka `dnstt` subtype yookaan custom core barbaada. Akkasumas SSH over TLS/WebSocket payload-style flows, config encryption, fi HTTP Injector-compatible proprietary file format copy gochuun haala sirrii miti; TunnelGuard schema mataa isaa ni fayyadama.

## License decision point

sing-box source license GPLv3 dha; core kana app keessatti embed yookaan derivative gochuun release/open-source obligations isaa ilaallachuun murteessuu qaba.[10] libXray immoo MIT License akka ta’e ibsa, Android API 21+ wrapper fi lifecycle/build code qaba.[11] Kanaaf architecture murteessuun dura appichi source-open GPL-compatible ta’uu qaba moo license permissive qabuun qoodamuu qaba jechuun murtee business/seeraa barbaada.

Initial recommendation: user appichi GPL-compatible/open-source ta’uu fudhatee, protocolwwan non-DNS hedduuf sing-box core tokko; DNSTT/SlowDNS immoo license audit fi native packaging erga xumuramee booda adapter adda ta’e. Yoo appichi closed-source ta’uu qaba ta’e, component-by-component permissive-license architecture filachuun barbaachisaa dha.

## Native engine package constraints (2026-08-15)

sing-box official build guide keessatti Android core self-build Go toolchain barbaada. QUIC/Hysteria support `with_quic`, WireGuard outbound `with_wireguard` build tag waliin wal qabata; Android `with_naive_outbound` support immoo CGO fi Android NDK barbaachisa. Downstream packager build tag fi linker flags official repository keessaa `release/DEFAULT_BUILD_TAGS` fi `release/LDFLAGS` fayyadamuun akka qabu qajeelfamni jedhu; tags arbitrary jijjiiruun hin gorfamu.[12]

Kanaaf Heni Tech VPN APK real engine qabsiisuun source/build provenance, ABI-specific artifacts, Android NDK toolchain, GPLv3 source/notices, fi device-server handshake validation barbaachisa. Server hin jirre keessatti UI/profile behaviour ni test ta’a; tunneling connection garuu sirriitti verify gochuun hin danda’amu. Random binary yookaan unverified remote artifact download godhanii app keessa dabaluu hin qabu.

sing-box-for-Android official app source Kotlin Android client experimental ta’ee GPLv3 jalatti release ta’e; repository isaatiin fork/derivative original app name yookaan association imply gochuu hin hayyamu jechuun notice qaba.[13] Kanaaf Heni Tech VPN source/branding mataa isaa qabaachuun, required GPLv3 notices/source obligations release waliin dhiyeessuun, fi core integration code independently qopheessuun barbaachisa; original app source/UI copy gochuun sirrii miti.

Official sing-box-for-Android Gradle config ABI splits keessatti `armeabi-v7a`, `arm64-v8a`, `x86`, fi `x86_64` include godha, universal APK support qaba. Heni Tech VPN initial scope physical phone Android ARM ABI lamaan irratti focus gochuu danda’a; release workflow binary artifacts isaan waliin test gochuu qaba.[14]

F-Droid reproducible build metadata sing-box Android `libbox.aar` build flow ifa godha: Android SDK platform/build tools/command-line tools fi target NDK install gochuun, Go toolchain qopheessuun, source root keessatti `make lib_install` itti aansuun `make lib_android` run godha; artifact `libbox.aar` clients/android/app/libs keessa kaa’a.[15] Official SFA Gradle file immoo `libs/libbox.aar` local dependency ta’uu fi NDK version pin akka qabu ibsa.[16] Kana jechuun CI artifact bu’aa build source version/checksum/note waliin pin godhuu, haala random prebuilt binary hin fudhanne, Heni Tech VPN Android modulettis AAR interface/API compatibility qopheessuun barbaachisa.

## References

[1]: https://play.google.com/store/apps/details?id=com.evozi.injector "HTTP Injector (SSH/V2ray) VPN — Google Play"
[2]: https://developer.android.com/develop/connectivity/vpn "Android Developers — VPN"
[3]: https://docs.expo.dev/workflow/customizing/ "Expo — Add custom native code"
[4]: https://www.wireguard.com/ "WireGuard — fast, modern, secure VPN tunnel"
[5]: https://xtls.github.io/en/config/transport.html "Project X — Transport Configuration"
[6]: https://github.com/dnstt-xyz/dnstt_xyz_app "dnstt-xyz — Multi-platform DNSTT client"
[7]: https://github.com/apernet/hysteria "apernet/hysteria — Hysteria 2"
[8]: https://sing-box.sagernet.org/configuration/outbound/ "sing-box — Outbound"
[9]: https://sing-box.sagernet.org/clients/android/ "sing-box for Android"
[10]: https://github.com/SagerNet/sing-box "SagerNet/sing-box — GPLv3 license"
[11]: https://github.com/XTLS/libXray "XTLS/libXray — MIT license"
[12]: https://sing-box.sagernet.org/installation/build-from-source/ "sing-box — Build from source"
[13]: https://github.com/SagerNet/sing-box-for-android "SagerNet — sing-box for Android source and license"
[14]: https://raw.githubusercontent.com/SagerNet/sing-box-for-android/dev/app/build.gradle.kts "sing-box-for-Android — Android Gradle configuration"
[15]: https://gitlab.com/fdroid/fdroiddata/-/raw/master/metadata/io.nekohasekai.sfa.yml "F-Droid — sing-box Android reproducible build metadata"
[16]: https://raw.githubusercontent.com/SagerNet/sing-box-for-android/dev/app/build.gradle.kts "sing-box-for-Android — libbox AAR dependency"
