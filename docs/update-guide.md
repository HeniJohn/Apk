# Heni Tech VPN — Yeroo-yerootti App Update Gochuu

## Version har’aa

| Field | Value | Hiika |
|---|---:|---|
| User-visible version | `1.0.0` | Lakkoofsa Play Store fi user argatu |
| Android build version | `1` | Lakkoofsa internal Android/Play Store |
| Android package | `com.app.tunnelguardandroid` | App erga Play Store irratti maxxanfamee booda hin jijjiiramu |

Android keessatti `versionCode` build haaraa hundaaf dabalaa deema; Play Store `versionCode` duraan fayyadame akka irra deebi’amee upload hin goone dirqama. `versionName` immoo lakkoofsa useriin argu, akka `1.0.1` yookaan `1.1.0`, dha.[1]

## Update workflow

| Yeroo | Ani maal hojjedha | Ati maal hojjatta |
|---|---|---|
| Feature yookaan bug report | Code, test, fi notes update godha | Waan jijjiiramu ibsi; device test result naaf himi |
| Release qophii | `version` fi `android.versionCode` dabala; tests raawwata | Android signing key kee kuusi; hin qoodi |
| Android build | AAB signed build qopheessa | Build channel yookaan Play Console access qopheessi |
| Publish/update | Release notes qopheessa | Play Console keessatti AAB upload, test track, achiin production release godhi |
| Server change qofa | Profile/config schema qorata | Gateway kee irratti config haaromsi; app keessa profile import/edit godhi |

## Version lakkoofsa filannoo

`1.0.0 → 1.0.1` jechuun bug fix xiqqaa. `1.0.0 → 1.1.0` jechuun feature haaraa kan backward-compatible ta’e. `1.0.0 → 2.0.0` jechuun config yookaan user flow keessatti jijjiirama guddaa. Build upload hundaaf `android.versionCode` `1 → 2 → 3` jechuun dabali.

> **Native VPN engine**—Kotlin `VpnService`, sing-box binary, DNSTT adapter, Android permissions—jijjiiramni isaa Play Store AAB release haaraa barbaada. UI JavaScript qofa jijjiiramuun immoo, deployment mechanism ati filattu irratti hundaa’uun ni salphata; garuu release production dura device test dirqama.

## EAS filannoo (yeroo booda)

EAS Build fayyadamuun `android.versionCode` remote source irraa auto-increment gochuu ni danda’a. Kun upload build lakkoofsa wal fakkaataa irraa kan maddu dogoggora hir’isa; garuu Expo/EAS project/account fi signing setup barbaada.[2]

## Waan hin jijjiiramin

App erga Play Store irratti publish ta’ee booda Android package ID fi signing key hin jijjiirin. Yoo tokko isaanii bade yookaan jijjiirame, update app duraan install godhame irratti hin bu’u; app addaakkaatti ilaalama.

## References

[1]: https://developer.android.com/studio/publish/versioning "Android Developers — Version your app"
[2]: https://docs.expo.dev/build-reference/app-versions/ "Expo — App version management"
