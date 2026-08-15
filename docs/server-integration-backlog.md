# Heni Tech VPN — Server Integration Backlog

## Current decision

Heni Tech VPN server public yookaan account ofumaan hin qaba. Useriin server/VPS yeroo booda argatu; yeroo sana profile manually galchuu yookaan `tunnelguard/v1` config secret-free import gochuu danda’a. Kun traffic dhaabbata hin beekamne irraa eeguuf murtee security dha.

## User checklist when ready

| Tartiiba | Waan useriin qopheessu | Maaliif |
|---|---|---|
| 1 | VPS yookaan gateway fayyadamuuf hayyamame | VPN endpoint dhugaa qabaachuuf |
| 2 | Domain yookaan IP, port, fi protocol filatame | Profile exact qopheessuuf |
| 3 | WireGuard configuration jalqabaa | Protocol salphaa fi native VPN test ittiin jalqabuuf |
| 4 | Private key/password/UUID device keessatti qofa seensisu | Credential chat, log, yookaan export keessatti hin maxxanfamu |
| 5 | Android development build fi device test | Android `VpnService` permission fi tunnel handshake mirkaneessuuf |

> Private key, password, yookaan token gara chat, screenshot, yookaan config export hin ergin. Isaan device keystore keessatti qofa kaa’i.

## Engineering backlog

| Priority | Hojii | Daangaa xumuraa |
|---|---|---|
| P0 | Version-pinned GPLv3 sing-box Android core package | ABI `arm64-v8a` fi `armeabi-v7a`; license notice fi source release qopheeffame |
| P0 | Kotlin `VpnService` lifecycle | Permission, foreground notification, TUN interface, stop/cleanup, handshake verification |
| P1 | WireGuard end-to-end gateway test | Public IP/DNS/traffic test qofa handshake booda `Connected` ta’a |
| P1 | VLESS/VMess, SSH, Shadowsocks, Hysteria profile-to-core compiler | Protocol field validation fi error state qulqulluu |
| P2 | DNSTT/SlowDNS audited adapter | License audit, timeout, bandwidth guardrails, fi DNS-specific connectivity tests |

## Server options

WireGuard gateway jalqabaa jechuun path recommended dha. Heni Tech VPN engine production build keessa seenuun dura server, protocol, fi ABI binary version wal simuun test ta’uu qaba. VPN server yeroo hunda fi fixed public endpoint barbaadu jechuun developer sandbox yookaan mobile preview keessa akka service productionitti hin run ta’u.
