/**
 * Build-time gateway endpoint governance (Build 45, Gate 10 / backlog §10.4).
 *
 * Exactly one origin is compiled into the app: the dedicated remote-review
 * hostname served by the authorised `acr-mobile-review` Cloudflare tunnel.
 * There is no endpoint editor, no runtime switch and no fallback between
 * origins. The Build 44 supervised-LAN cleartext origin (host 192.168.1.94,
 * port 3001) was retired at Gate 10 together with the native cleartext
 * exceptions that allowed it, so a cleartext origin could not work even if it
 * were reintroduced here.
 *
 * Changing the origin is a deliberate, reviewed source edit and a rebuild —
 * the mechanism backlog §10.4 asks for to keep later VPS/ISP migration possible
 * through build-time endpoint governance.
 */

/** Build 45 dedicated remote-review origin. TLS only; HTTP is blocked at the edge. */
export const BUILD45_REVIEW_ORIGIN = 'https://mobile-gateway-review.acragent.com' as const;

/** The governed set. An origin outside this set must never be compiled in. */
export const GOVERNED_ORIGINS = Object.freeze([BUILD45_REVIEW_ORIGIN] as const);

export type GovernedOrigin = (typeof GOVERNED_ORIGINS)[number];

/**
 * The single compiled-in origin. Not configurable at runtime and not read from
 * storage, the environment, or any user-facing setting.
 */
export const ACTIVE_GATEWAY_ORIGIN: GovernedOrigin = BUILD45_REVIEW_ORIGIN;

/** Retained name for the compiled origin. */
export const GATEWAY_ORIGIN = ACTIVE_GATEWAY_ORIGIN;

export const GATEWAY_API_BASE = `${ACTIVE_GATEWAY_ORIGIN}/m/v1` as const;
