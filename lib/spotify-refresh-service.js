import { randomUUID, timingSafeEqual } from "node:crypto";
import {
    SPOTIFY_ARTISTS,
    acquireRefreshLock,
    getRedisClient,
    isSnapshotDueForAutomaticRefresh,
    readRedisSnapshot,
    releaseRefreshLock,
    writeRedisSnapshot,
    writeRuntimeSnapshot
} from "./spotify-snapshot.js";


export function hasValidBearerAuthorization(req, secret) {

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


export async function refreshSpotifySnapshot({ force = false } = {}) {

    const redis = getRedisClient();

    if (!redis) {
        return {
            status: 503,
            body: {
                error: "Upstash Redis is not configured"
            }
        };
    }

    const lockOwner = randomUUID();
    let lockAcquired = false;

    try {
        lockAcquired = await acquireRefreshLock(
            redis,
            lockOwner
        );

        if (!lockAcquired) {
            return {
                status: 409,
                body: {
                    error: "Spotify refresh already in progress"
                }
            };
        }

        const currentSnapshot = await readRedisSnapshot(redis);

        if (
            !force &&
            !isSnapshotDueForAutomaticRefresh(currentSnapshot)
        ) {
            return {
                status: 200,
                body: {
                    success: true,
                    refreshed: false,
                    updatedAt: currentSnapshot.updatedAt
                }
            };
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

        return {
            status: 200,
            body: {
                ...snapshot,
                cached: false,
                refreshed: true
            }
        };

    } catch (error) {
        console.error("Spotify refresh error:", error);

        return {
            status: 502,
            body: {
                error: "Spotify refresh failed"
            }
        };

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
