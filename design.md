# Heni Tech VPN — Mobile Interface Design

## Kaayyoo

Heni Tech VPN jechuun **Android VPN/tunnel client** kan namni config server isaa seensisee ykn galmee config ofii import godhee tajaajila wal-qunnamtii dhuunfaa to’atu dha. Appichi maqaa, mallattoo, interface, fi koodii mataa isaa qabaata; app biroo irraa screenshot, asset, yookaan koodii hin kopi’u. Dizaayiniin isaa screen portrait 9:16, quba harka tokkoon fayyadamuuf salphaa, fi iOS HIG-like clarity irratti hundaa’a.

> App kun abbootii serverii irraa kennamu qofa fayyadama. Tajaajila VPN bane-bane yookaan proxy dhaabbataa ofumaan hin waadaa galu.

## Brand fi halluu

Mallattoon brandii bifa **gaachana keessa daandii tunnel aqua** qabaata. Halluun guddaan midnight blue `#071A2F`; aqua `#17C3B2` jechuun connection guutuu; sky blue `#2F80ED` jechuun action; mist `#F5F8FC` jechuun background ifaa; ink `#132238` jechuun barreeffama; coral `#E85D75` jechuun error/disconnect ta’a. Contrast ifaa fi dark mode keessatti dubbifamuu qaba.

## Screen List

| Screen | Qabiyyee fi hojii | Murtee layout |
|---|---|---|
| Dashboard | Haala connection, server filatame, data session, fi button Connect/Disconnect | Action guddaan harka jalaatti; status card ifa ta’e screen gidduutti |
| Servers | Tarree profile/server, latency, protocol, fi server haaraa dabalu | FlatList; search fi filter protocol gubbaatti |
| Add / Import Profile | Maqaa profile, protocol, host, port, credentials, fi config import | Form sectioned; validation inline; save button bottom sticky |
| Profile Detail | Setting profile tokkoo, DNS, app filter, fi delete/export | Grouped settings; danger zone adda baafame |
| Diagnostics | IP status, DNS state, connection log, host checker | Read-only data cards fi copy/share action |
| Settings | Theme, auto-connect, kill-switch preference, privacy, fi app info | Grouped list; togglewwan gurguddoo |
| Connection Permission Sheet | Sababa VPN permission, waan appichi argu, fi ittin fayyadamu | Bottom sheet; button ‘Allow VPN’ tokko sirriitti ibsame |

## User Flow Ijoo

| Hojii | Tartiiba fayyadamaa |
|---|---|
| Profile haaraa uumu | Servers → Add profile → protocol filuu → host/port galchuu → validate → Save → Dashboard |
| Config import gochuu | Servers → Import config → file filuu → field hubachuu → Save → Dashboard |
| Walqunnamtii jalqabu | Dashboard → server tile tuquu → Connect → Android VPN permission → Connected state |
| Rakkoo qorachuu | Dashboard → Diagnostics → log/IP/DNS ilaalu → copy yookaan share diagnostic summary |
| Profile haaromsuu | Servers → profile filuu → Edit → Save → connection haaraa jalqabu |

## Qajeelfama UX

Primary action tokko qofa screen tokkoon mul’ata. Button Connect yeroo disconnected ta’e aqua, yeroo connected ta’e coral Disconnect ta’a. Appichi connection mode keessatti auto-refresh hint qabu; state sirriin native service irraa gara interface tti dabra. Password fi private key hin maxxanfamu, hin log-gamu, storage dhoksaa device keessatti qofa kaa’amu.

## Data Models (jalqabaa)

| Model | Fields ijoo |
|---|---|
| `TunnelProfile` | `id`, `name`, `protocol`, `host`, `port`, `username`, `secretRef`, `dnsMode`, `createdAt`, `updatedAt` |
| `ConnectionState` | `status`, `profileId`, `startedAt`, `downBytes`, `upBytes`, `publicIp`, `lastError` |
| `DiagnosticEvent` | `id`, `createdAt`, `level`, `message`, `profileId` |
| `AppPreferences` | `theme`, `autoConnectProfileId`, `killSwitchEnabled`, `selectedApps`, `dnsMode` |

## Daangaa Teeknikaa

Interface Expo/React Native keessatti ijaarama. **Engine VPN dhugaa** garuu Android `VpnService` fi native module barbaada; kanaaf Expo Go qofaan hin hojjetu, Android development build/native layer keessatti qophaa’a. Phase jalqabaa keessatti interface, profile management, import validation, fi diagnostics state ijaarama; tunneling protocol tokko tokkoon native engine erga server/protocol filatamee booda itti dabala.
