import { getCache } from "@vercel/functions";
import { Redis } from "@upstash/redis";
import fallbackSnapshot from "../data/spotify-stats.json" with { type: "json" };

export const SPOTIFY_SNAPSHOT_KEY =
    "pumpsound:spotify:snapshot";

export const SPOTIFY_REFRESH_LOCK_KEY =
    "pumpsound:spotify:refresh-lock";

export const SPOTIFY_RUNTIME_CACHE_KEY =
    "pumpsound-spotify-stats";

export const SPOTIFY_RUNTIME_CACHE_TTL =
    864000;

export const SPOTIFY_REFRESH_LOCK_TTL =
    180;

export const SPOTIFY_ARTISTS = {
    majki: {
        name: "MAJKI",
        uuid: "0424e04c-06fb-4f6c-a411-f8ba724c8326"
    },
    cypis: {
        name: "CYPIS",
        uuid: "11e81bba-b4d4-96f2-bfd3-a0369fe50396"
    },
    sequento: {
        name: "SEQUENTO",
        uuid: "ceb62d1e-ebdf-4f11-ab3d-6798da0c23e5"
    },
    bekaKsh: {
        name: "BEKA KSH",
        uuid: "11e83fec-7e3d-385a-a046-aa1c026db3d8"
    },
    cheatz: {
        name: "CHEATZ",
        uuid: "790d3a0c-4283-11e9-a326-549f35141000"
    },
    diho: {
        name: "DIHO",
        uuid: "11e81bba-e5d3-8e02-aa76-a0369fe50396"
    },
    pumpsound: {
        name: "PUMPSOUND",
        uuid: "72795b33-2138-430d-9273-95528aaf2d88"
    }
};


export function getRedisClient() {

    const url = process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

    if (!url || !token) {
        return null;
    }

    return new Redis({ url, token });

}


export function isValidSpotifySnapshot(snapshot) {

    if (
        !snapshot ||
        snapshot.success !== true ||
        !snapshot.artists ||
        typeof snapshot.artists !== "object"
    ) {
        return false;
    }

    return Object.entries(SPOTIFY_ARTISTS).every(
        ([key, artist]) => {

            const snapshotArtist = snapshot.artists[key];

            return Boolean(
                snapshotArtist &&
                snapshotArtist.name === artist.name &&
                (
                    snapshotArtist.monthlyListeners === null ||
                    Number.isFinite(
                        snapshotArtist.monthlyListeners
                    )
                )
            );

        }
    );

}


export function getFallbackSnapshot() {

    return JSON.parse(
        JSON.stringify(fallbackSnapshot)
    );

}


export async function readRuntimeSnapshot() {

    const snapshot = await getCache().get(
        SPOTIFY_RUNTIME_CACHE_KEY
    );

    return isValidSpotifySnapshot(snapshot)
        ? snapshot
        : null;

}


export async function writeRuntimeSnapshot(snapshot) {

    if (!isValidSpotifySnapshot(snapshot)) {
        throw new Error("Invalid Spotify snapshot");
    }

    await getCache().set(
        SPOTIFY_RUNTIME_CACHE_KEY,
        snapshot,
        {
            ttl: SPOTIFY_RUNTIME_CACHE_TTL,
            tags: ["pumpsound-spotify"],
            name: "PUMPSOUND Spotify stats"
        }
    );

}


export async function readRedisSnapshot(redis) {

    if (!redis) {
        return null;
    }

    const snapshot = await redis.get(
        SPOTIFY_SNAPSHOT_KEY
    );

    return isValidSpotifySnapshot(snapshot)
        ? snapshot
        : null;

}


export async function writeRedisSnapshot(redis, snapshot) {

    if (!redis) {
        throw new Error("Upstash Redis is not configured");
    }

    if (!isValidSpotifySnapshot(snapshot)) {
        throw new Error("Invalid Spotify snapshot");
    }

    await redis.set(
        SPOTIFY_SNAPSHOT_KEY,
        snapshot
    );

}


export async function acquireRefreshLock(redis, owner) {

    const result = await redis.set(
        SPOTIFY_REFRESH_LOCK_KEY,
        owner,
        {
            nx: true,
            ex: SPOTIFY_REFRESH_LOCK_TTL
        }
    );

    return result === "OK";

}


export async function releaseRefreshLock(redis, owner) {

    return redis.eval(
        "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0",
        [SPOTIFY_REFRESH_LOCK_KEY],
        [owner]
    );

}
