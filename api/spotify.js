import {
    getFallbackSnapshot,
    getRedisClient,
    isValidSpotifySnapshot,
    readRedisSnapshot,
    readRuntimeSnapshot,
    writeRuntimeSnapshot
} from "../lib/spotify-snapshot.js";


const RESPONSE_CACHE_CONTROL =
    "s-maxage=864000, stale-while-revalidate=86400";


function sendSnapshot(res, snapshot) {

    res.setHeader(
        "Cache-Control",
        RESPONSE_CACHE_CONTROL
    );

    return res.status(200).json({
        ...snapshot,
        cached: true
    });

}


export default async function handler(req, res) {

    try {
        const runtimeSnapshot = await readRuntimeSnapshot();

        if (runtimeSnapshot) {
            return sendSnapshot(res, runtimeSnapshot);
        }

    } catch (error) {
        console.error("Spotify Runtime Cache read error:", error);
    }


    try {
        const redisSnapshot = await readRedisSnapshot(
            getRedisClient()
        );

        if (redisSnapshot) {
            try {
                await writeRuntimeSnapshot(redisSnapshot);
            } catch (error) {
                console.error(
                    "Spotify Runtime Cache write error:",
                    error
                );
            }

            return sendSnapshot(res, redisSnapshot);
        }

    } catch (error) {
        console.error("Spotify Redis snapshot read error:", error);
    }


    const fallbackSnapshot = getFallbackSnapshot();

    if (isValidSpotifySnapshot(fallbackSnapshot)) {
        return sendSnapshot(res, fallbackSnapshot);
    }


    return res.status(503).json({
        error: "Spotify snapshot unavailable"
    });
}
