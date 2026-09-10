import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const configPath = path.join(process.cwd(), "data", "downloads.json");
const R2_LIST_CACHE_TTL_MS = 60 * 1000;
let r2ObjectListCache = null;
let r2ObjectListPromise = null;
let r2ClientPromise = null;

export function normalizeReleaseName(value) {
    return String(value || "")
        .replace(/\.mp3$/i, "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[–—−]/g, "-")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function isProduction() {
    return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

function isLocalDevelopment() {
    return process.env.VERCEL_ENV === "development" || (!process.env.VERCEL && !isProduction());
}

function getPrivateDownloadsDirectory() {
    const directory = process.env.DOWNLOADS_LOCAL_DIR;
    return directory ? path.resolve(directory) : null;
}

function getR2Configuration() {
    const { R2_ACCOUNT_ID: accountId, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET_NAME: bucket } = process.env;
    if (![accountId, accessKeyId, secretAccessKey, bucket].every((value) => typeof value === "string" && value.length > 0)) return null;
    return { accountId, accessKeyId, secretAccessKey, bucket };
}

function getStorage() {
    const localDirectory = getPrivateDownloadsDirectory();
    if (isLocalDevelopment() && localDirectory) return { type: "local", directory: localDirectory };

    const r2 = getR2Configuration();
    if (isProduction() && r2) return { type: "r2", ...r2 };
    return null;
}

async function getR2Client(config) {
    if (!r2ClientPromise) {
        r2ClientPromise = import("@aws-sdk/client-s3").then(({ GetObjectCommand, ListObjectsV2Command, S3Client }) => ({
            GetObjectCommand,
            ListObjectsV2Command,
            client: new S3Client({
                region: "auto",
                endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
                credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
            })
        }));
    }
    return r2ClientPromise;
}

async function readConfig() {
    const config = JSON.parse(await readFile(configPath, "utf8"));
    return Array.isArray(config.downloads) ? config.downloads : [];
}

function findConfigEntry(entries, youtubeVideoId) {
    return entries.find((entry) => entry.youtubeVideoId === youtubeVideoId) || {};
}

function safeFileName(value) {
    if (!value || path.basename(value) !== value || !value.toLowerCase().endsWith(".mp3")) return null;
    return value;
}

function getExpectedNormalizedName(entry, youtubeTitle) {
    return normalizeReleaseName(safeFileName(entry.fileNameOverride) || youtubeTitle);
}

function matchSingleMp3Key(keys, expectedName) {
    const matches = keys
        .filter((key) => key.toLowerCase().endsWith(".mp3"))
        .filter((key) => normalizeReleaseName(path.posix.basename(key)) === expectedName);
    return matches.length === 1 ? matches[0] : null;
}

async function listLocalMp3Keys(directory) {
    const items = await readdir(directory, { withFileTypes: true });
    return items.filter((item) => item.isFile()).map((item) => item.name);
}

async function listR2Mp3Keys(storage) {
    const now = Date.now();
    if (r2ObjectListCache && r2ObjectListCache.expiresAt > now) return r2ObjectListCache.keys;
    if (r2ObjectListPromise) return r2ObjectListPromise;

    r2ObjectListPromise = (async () => {
        const keys = [];
        let continuationToken;
        const { client, ListObjectsV2Command } = await getR2Client(storage);
        do {
            const page = await client.send(new ListObjectsV2Command({ Bucket: storage.bucket, ContinuationToken: continuationToken }));
            for (const object of page.Contents || []) if (object.Key) keys.push(object.Key);
            continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
        } while (continuationToken);
        r2ObjectListCache = { keys, expiresAt: Date.now() + R2_LIST_CACHE_TTL_MS };
        return keys;
    })();

    try { return await r2ObjectListPromise; }
    finally { r2ObjectListPromise = null; }
}

async function findObject(storage, entry, youtubeTitle) {
    const expectedName = getExpectedNormalizedName(entry, youtubeTitle);
    if (!expectedName) return null;

    try {
        const keys = storage.type === "local" ? await listLocalMp3Keys(storage.directory) : await listR2Mp3Keys(storage);
        return matchSingleMp3Key(keys, expectedName);
    } catch (error) {
        if (error?.code === "ENOENT" || error?.name === "NoSuchBucket") return null;
        throw error;
    }
}

export async function resolveDownload({ youtubeVideoId, youtubeTitle, includeStream = true }) {
    if (!youtubeVideoId || !youtubeTitle || youtubeVideoId.length > 128 || youtubeTitle.length > 300) {
        return { available: false, reason: "invalid-release" };
    }

    const storage = getStorage();
    if (!storage) return { available: false, reason: "storage-unconfigured" };

    const entry = findConfigEntry(await readConfig(), youtubeVideoId);
    const objectKey = await findObject(storage, entry, youtubeTitle);
    if (!objectKey) return { available: false, reason: "file-not-found" };
    const fileName = path.posix.basename(objectKey);

    if (!includeStream) return { available: true, entry, fileName, objectKey };

    if (storage.type === "local") {
        const filePath = path.join(storage.directory, objectKey);
        const info = await stat(filePath);
        if (!info.isFile()) return { available: false, reason: "file-not-found" };
        return { available: true, entry, fileName, objectKey, size: info.size, stream: () => createReadStream(filePath) };
    }

    try {
        const { client, GetObjectCommand } = await getR2Client(storage);
        const response = await client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: objectKey }));
        if (!response.Body) return { available: false, reason: "file-not-found" };
        return { available: true, entry, fileName, objectKey, size: response.ContentLength, stream: () => response.Body };
    } catch (error) {
        if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) return { available: false, reason: "file-not-found" };
        throw error;
    }
}

export async function resolveAvailability(tracks) {
    const uniqueTracks = new Map();
    for (const track of Array.isArray(tracks) ? tracks : []) {
        if (track?.youtubeVideoId && track?.youtubeTitle) uniqueTracks.set(track.youtubeVideoId, track);
    }

    const results = {};
    await Promise.all([...uniqueTracks.values()].map(async (track) => {
        const resolved = await resolveDownload({ ...track, includeStream: false });
        results[track.youtubeVideoId] = { available: resolved.available };
    }));
    return results;
}
