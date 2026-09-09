import {
    hasValidBearerAuthorization,
    refreshSpotifySnapshot
} from "../lib/spotify-refresh-service.js";


export default async function handler(req, res) {

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");

        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    if (
        !hasValidBearerAuthorization(
            req,
            process.env.CRON_SECRET
        )
    ) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const result = await refreshSpotifySnapshot({
        force: false
    });

    res.setHeader("Cache-Control", "no-store");

    return res.status(result.status).json(result.body);

}
