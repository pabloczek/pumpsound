import { resolveAvailability } from "../lib/download-storage.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const tracks = req.body?.tracks;
    if (!Array.isArray(tracks) || tracks.length > 500) {
        return res.status(400).json({ error: "Invalid release list" });
    }

    try {
        const availability = await resolveAvailability(tracks);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ availability });
    } catch (error) {
        console.error("Download availability error:", error);
        return res.status(500).json({ error: "Could not check download availability" });
    }
}
