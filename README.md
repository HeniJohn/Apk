# Heni Tech VPN

Heni Tech VPN jechuun **Android multi-protocol VPN/tunnel client** GPLv3-compatible open-source ta’ee ijaaramu dha. Inni app reference irraa koodii, maqaa, yookaan assets hin kopi’u; interface fi schema config mataa isaa qaba.

## What works in this build

| Area | Status |
|---|---|
| Multi-protocol profile editor | Ready |
| Local profile persistence | Ready |
| Device-keystore credential storage | Ready |
| Secret-free config import | Ready for `tunnelguard/v1` JSON |
| Diagnostics, local readiness, and engine status | Ready |
| Android `VpnService` manifest + Expo Kotlin bridge | Generated and prebuild-validated |
| Actual sing-box / DNSTT native binary | Not yet bundled |
| Real VPN connection | Deliberately blocked until core packaging and handshake verification are complete |

## Protocol Catalogue

The profile editor supports protocol-specific fields for **WireGuard**, **SSH**, **SSH + TLS**, **SSH + WebSocket**, **HTTP/HTTPS proxy**, **SOCKS5**, **VMess**, **VLESS**, **Shadowsocks**, **Hysteria 2**, **DNSTT**, and **SlowDNS**. TLS, WebSocket, and gRPC are represented as transport/security settings, rather than disconnected toggle switches.

## Native architecture

The standard protocol family is designed around **sing-box**. DNSTT and SlowDNS require a separately audited Android adapter. Heni Tech VPN refuses to display a connected VPN state merely because a local proxy port is open; a native engine must complete a protocol handshake and a protected connectivity verification first.

Read [`docs/native-engine-architecture.md`](docs/native-engine-architecture.md) for lifecycle, profile-to-engine mapping, ABI strategy, and security constraints. Read [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) before adding or distributing native core binaries.

Read [`docs/server-integration-backlog.md`](docs/server-integration-backlog.md) when a VPS/gateway is ready, and [`docs/update-guide.md`](docs/update-guide.md) for release versioning and future app updates.

## Development

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
```

The JavaScript interface can be viewed in the development server. `VpnService` requires an Android **development build**, not Expo Go. To generate Android files and apply the service manifest plugin:

```bash
pnpm exec expo prebuild --platform android --no-install
```

The sandbox does not include a configured Android SDK, so Gradle cannot produce an APK here. Build on a workstation or CI runner with Android SDK configured, then validate every protocol using gateways you control.

## When you obtain a server later

Start with a **WireGuard** gateway. In Heni Tech VPN, open **Servers → Add server later**, select WireGuard, and enter only the endpoint, client tunnel address, peer public key, and private key supplied by the gateway administrator. The application does not use unknown public servers and should never be configured with credentials you are not authorized to use.

For the authorized SSH endpoint supplied during this project, a secret-free import template is available at [`examples/heni-ssh-profile.template.json`](examples/heni-ssh-profile.template.json). Import it from **Profiles**, then edit the saved profile on the device to enter the password into the device keystore. The password is intentionally excluded from the template and must never be committed or shared.

## Security boundaries

Heni Tech VPN does not bundle public servers. Passwords, private keys, UUID auth material, and raw config secrets are excluded from exports and diagnostics. Add only servers and credentials you are authorized to operate or access.
