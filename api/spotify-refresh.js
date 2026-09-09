import { randomUUID, timingSafeEqual } from "node:crypto";
import {
    SPOTIFY_ARTISTS,
    acquireRefreshLock,
    getRedisClient,
    releaseRefreshLock,
    writeRedisSnapshot,
    writeRuntimeSnapshot
} from "../lib/spotify-snapshot.js";


function hasValidRefreshAuthorization(req) {

    const secret = process.env.SPOTIFY_REFRESH_SECRET;
    const authorization = req.headers.authorization;

    if (!secret || typeof authorization !== "string") {
        return false;
    }

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(authorization);

    return expected.length === received.length &&
        timingSafeEqual(expected, received);

}


async function getSoundchartsAccessToken() {

    const clientId = process.env.SOUNDCHARTS_CLIENT_ID;
    const clientSecret = process.env.SOUNDCHARTS_CLIENT_SECRET;
    const teamId = process.env.SOUNDCHARTS_TEAM_ID;

    if (!clientId || !clientSecret || !teamId) {
        throw new Error("Missing Soundcharts environment variables");
    }

    const credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString("base64");

    const response = await fetch(
        "https://account.soundcharts.com/oauth/token",
        {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:
                `grant_type=client_credentials&team_id=${encodeURIComponent(teamId)}`
        }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error("Soundcharts authentication failed");
    }

    return data.access_token;

}


async function fetchSpotifyListeners(artist, accessToken) {

    const response = await fetch(
        `https://customer.api.soundcharts.com/api/v2/artist/${artist.uuid}/streaming/spotify/listening?offset=0&limit=1&sort=desc`,
        {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    const data = await response.json();
    const latestItem = data.items?.[0];
    const monthlyListeners = Number(latestItem?.value);

    if (
        !response.ok ||
        !latestItem ||
        !Number.isFinite(monthlyListeners)
    ) {
        throw new Error(
            `Soundcharts Spotify data unavailable for ${artist.name}`
        );
    }

    return {
        name: artist.name,
        monthlyListeners,
        date: latestItem.date || null
    };

}


export default async function handler(req, res) {

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    if (!hasValidRefreshAuthorization(req)) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const redis = getRedisClient();

    if (!redis) {
        return res.status(503).json({
            error: "Upstash Redis is not configured"
        });
    }

    const lockOwner = randomUUID();
    let lockAcquired = false;

    try {
        lockAcquired = await acquireRefreshLock(
            redis,
            lockOwner
        );

        if (!lockAcquired) {
            return res.status(409).json({
                error: "Spotify refresh already in progress"
            });
        }

        const accessToken = await getSoundchartsAccessToken();
        const artists = {};

        for (
            const [key, artist]
            of Object.entries(SPOTIFY_ARTISTS)
        ) {
            artists[key] = await fetchSpotifyListeners(
                artist,
                accessToken
            );
        }

        const snapshot = {
            success: true,
            updatedAt: new Date().toISOString(),
            artists
        };

        await writeRedisSnapshot(redis, snapshot);

        try {
            await writeRuntimeSnapshot(snapshot);
        } catch (error) {
            console.error("Spotify Runtime Cache write error:", error);
        }

        res.setHeader("Cache-Control", "no-store");

        return res.status(200).json({
            ...snapshot,
            cached: false
        });

    } catch (error) {
        console.error("Spotify refresh error:", error);

        return res.status(502).json({
            error: "Spotify refresh failed"
        });

    } finally {
        if (lockAcquired) {
            try {
                await releaseRefreshLock(redis, lockOwner);
            } catch (error) {
                console.error("Spotify refresh lock release error:", error);
            }
        }
    }
}
