import { resolveDownload } from "../lib/download-storage.js";
import { requestHasUnlock } from "../lib/download-unlock.js";

function contentDisposition(fileName) {
    const asciiName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
    return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!requestHasUnlock(req)) {
        return res.status(403).json({ error: "Download unlock required" });
    }

    try {
        const resolved = await resolveDownload({ youtubeVideoId: req.query?.videoId, youtubeTitle: req.query?.title });
        if (!resolved.available) return res.status(404).json({ error: "Download not available", reason: resolved.reason });

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", String(resolved.size));
        res.setHeader("Content-Disposition", contentDisposition(resolved.fileName));
        res.setHeader("Cache-Control", "private, no-store");
        resolved.stream().on("error", () => {
            if (!res.headersSent) res.status(500).json({ error: "Could not read download" });
            else res.destroy();
        }).pipe(res);
    } catch (error) {
        console.error("Download delivery error:", error);
        return res.status(500).json({ error: "Could not deliver download" });
    }
}
