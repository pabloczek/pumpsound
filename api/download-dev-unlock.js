import { isDevelopmentUnlockTestEnabled, issueUnlockCookie } from "../lib/download-unlock.js";

export default function handler(req, res) {
    if (!isDevelopmentUnlockTestEnabled()) {
        return res.status(404).json({ error: "Not found" });
    }
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }
    if (!issueUnlockCookie(res)) {
        return res.status(503).json({ error: "Unlock service is not configured" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ unlocked: true });
}
