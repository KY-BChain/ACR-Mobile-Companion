/**
 * Build-time gateway endpoint governance (Build 45, Gate 3 / G3-02).
 *
 * Exactly one origin is compiled into the app. There is no endpoint editor, no
 * runtime switch, and no fallback between origins — selection happens here, at
 * build time, and the compiled value is frozen. This is the mechanism backlog
 * §10.4 requires to keep later endpoint migration possible ("configuration or
 * build-time endpoint governance") while forbidding runtime switching.
 *
 * Gate 10 flips ACTIVE_GATEWAY_ORIGIN to BUILD45_REVIEW_ORIGIN as part of
 * creating the acr-mobile-review tunnel and rebuilding the apps with a single
 * hardcoded https:// endpoint and no cleartext exception. Until that gate, the
 * supervised LAN origin remains active so Gates 4–9 can be exercised locally.
 */

/** Build 44 supervised-LAN evaluation origin. Cleartext, local network only. */
export const LAN_EVALUATION_ORIGIN = 'http://192.168.1.94:3001' as const;

/**
 * Build 45 dedicated remote-review origin, served by the authorised
 * `acr-mobile-review` Cloudflare tunnel. TLS only. Not yet activated — the
 * tunnel is created at Gate 10.
 */
export const BUILD45_REVIEW_ORIGIN = 'https://mobile-gateway-review.acragent.com' as const;

/** The governed set. An origin outside this set must never be compiled in. */
export const GOVERNED_ORIGINS = Object.freeze([
  LAN_EVALUATION_ORIGIN,
  BUILD45_REVIEW_ORIGIN,
] as const);

export type GovernedOrigin = (typeof GOVERNED_ORIGINS)[number];

/**
 * The single compiled-in origin. Changing this is a deliberate, reviewed source
 * edit — it is not configurable at runtime and is not read from storage, the
 * environment, or any user-facing setting.
 */
export const ACTIVE_GATEWAY_ORIGIN: GovernedOrigin = LAN_EVALUATION_ORIGIN;

/** Retained name for the compiled origin. */
export const GATEWAY_ORIGIN = ACTIVE_GATEWAY_ORIGIN;

export const GATEWAY_API_BASE = `${ACTIVE_GATEWAY_ORIGIN}/m/v1` as const;
