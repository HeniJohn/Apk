# Heni Tech VPN — Cloud Native Core Build

## Goal

This workflow builds a **version-pinned GPLv3 `libbox.aar` artifact** from source for Heni Tech VPN. The artifact is the Android-native protocol core used to support user-provided manual configurations; it does not include, distribute, or hardcode any public server.

## How to run it

Push this source project to a repository that supports cloud workflows. Open the repository’s **Actions** area, select **Build Heni Tech VPN native core**, choose **Run workflow**, and retain the default pinned sing-box tag only after reviewing the upstream release notes. The workflow uploads three artifacts: `libbox.aar`, its SHA-256 checksum, and the exact source commit.

| Requirement | Workflow value |
|---|---|
| Java | 17 |
| Go | 1.24.2 |
| Android platform | 35 |
| Android NDK | 28.0.13004108 |
| First Android ABIs | ARM `armeabi-v7a` and `arm64-v8a` inside the AAR |

## Before integrating an artifact

Verify that the downloaded SHA-256 equals `libbox.aar.sha256`, record the `native-core-commit.txt` value, and add the corresponding GPLv3 source/notices to the app release. Do **not** replace the artifact with an unverified file. The native bridge must be updated against the exact AAR API and then tested on a physical Android device against separately authorized user-provided server profiles.

> Building an AAR does not itself make a VPN connection. Android `VpnService` lifecycle, manual profile-to-core JSON compilation, and one successful handshake test remain required before the app may show `Connected`.
