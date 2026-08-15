export type TunnelPhase = "idle" | "preparing" | "permission-required" | "starting" | "connected" | "stopping" | "error";

export type TunnelLifecycle = {
  phase: TunnelPhase;
  profileId?: string;
  detail: string;
  handshakeVerified: boolean;
};

export type TunnelEvent =
  | { type: "START_REQUESTED"; profileId: string }
  | { type: "PERMISSION_REQUIRED" }
  | { type: "PERMISSION_GRANTED" }
  | { type: "ENGINE_STARTING" }
  | { type: "HANDSHAKE_VERIFIED" }
  | { type: "STOP_REQUESTED" }
  | { type: "STOPPED" }
  | { type: "FAILED"; detail: string };

export const initialTunnelLifecycle: TunnelLifecycle = { phase: "idle", detail: "No active VPN connection.", handshakeVerified: false };

/** A connection can only become connected after an explicit native handshake verification. */
export function transitionTunnelLifecycle(current: TunnelLifecycle, event: TunnelEvent): TunnelLifecycle {
  switch (event.type) {
    case "START_REQUESTED":
      return { phase: "preparing", profileId: event.profileId, detail: "Preparing selected profile.", handshakeVerified: false };
    case "PERMISSION_REQUIRED":
      return { ...current, phase: "permission-required", detail: "Waiting for Android VPN permission." };
    case "PERMISSION_GRANTED":
      return { ...current, phase: "preparing", detail: "VPN permission granted; preparing engine." };
    case "ENGINE_STARTING":
      return { ...current, phase: "starting", detail: "Starting native tunnel engine." };
    case "HANDSHAKE_VERIFIED":
      if (current.phase !== "starting") return { ...current, phase: "error", detail: "Rejected unverified connection transition.", handshakeVerified: false };
      return { ...current, phase: "connected", detail: "Tunnel handshake verified.", handshakeVerified: true };
    case "STOP_REQUESTED":
      return { ...current, phase: "stopping", detail: "Stopping tunnel." };
    case "STOPPED":
      return { phase: "idle", detail: "No active VPN connection.", handshakeVerified: false };
    case "FAILED":
      return { ...current, phase: "error", detail: event.detail, handshakeVerified: false };
  }
}
