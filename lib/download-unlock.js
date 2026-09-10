import crypto from "node:crypto";

export const DOWNLOAD_UNLOCK_COOKIE = "pumpsound_download_unlock";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
    const secret = process.env.DOWNLOAD_UNLOCK_SECRET;
    return typeof secret === "string" && secret.length >= 32 ? secret : null;
}

function base64url(value) {
    return Buffer.from(value).toString("base64url");
}

function sign(payloadPart, secret) {
    return crypto.createHmac("sha256", secret).update(payloadPart).digest("base64url");
}

function parseCookies(header = "") {
    return header.split(";").reduce((cookies, pair) => {
        const index = pair.indexOf("=");
        if (index > 0) cookies[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
        return cookies;
    }, {});
}

function isProduction() {
    return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function createUnlockToken(now = Math.floor(Date.now() / 1000)) {
    const secret = getSecret();
    if (!secret) return null;

    const payloadPart = base64url(JSON.stringify({
        v: 1,
        exp: now + MAX_AGE_SECONDS,
        nonce: crypto.randomBytes(16).toString("base64url")
    }));
    return `${payloadPart}.${sign(payloadPart, secret)}`;
}

export function verifyUnlockToken(token, now = Math.floor(Date.now() / 1000)) {
    const secret = getSecret();
    if (!secret || typeof token !== "string") return false;

    const [payloadPart, signature] = token.split(".");
    if (!payloadPart || !signature || token.split(".").length !== 2) return false;

    const expected = sign(payloadPart, secret);
    const givenBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (givenBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(givenBuffer, expectedBuffer)) return false;

    try {
        const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
        return payload?.v === 1 && Number.isInteger(payload.exp) && payload.exp > now;
    } catch {
        return false;
    }
}

export function requestHasUnlock(req) {
    return verifyUnlockToken(parseCookies(req.headers?.cookie)[DOWNLOAD_UNLOCK_COOKIE]);
}

export function issueUnlockCookie(res) {
    const token = createUnlockToken();
    if (!token) return false;

    const secure = isProduction() ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${DOWNLOAD_UNLOCK_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}${secure}`);
    return true;
}

export function isDevelopmentUnlockTestEnabled() {
    return !isProduction() && process.env.DOWNLOAD_UNLOCK_DEV_MODE === "true";
}
