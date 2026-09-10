const CACHE_CONTROL = "s-maxage=1800, stale-while-revalidate=3600";
const MAX_RESULTS_PER_PAGE = 50;

export default async function handler(req, res) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "Missing YOUTUBE_API_KEY" });

        const channel = await youtubeRequest("channels", {
            part: "contentDetails",
            forHandle: "@pumpsound",
            key: apiKey
        });

        const uploadsPlaylistId = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
        if (!uploadsPlaylistId) return res.status(404).json({ error: "PUMPSOUND uploads playlist not found" });

        const playlistItems = [];
        let pageToken;
        do {
            const page = await youtubeRequest("playlistItems", {
                part: "contentDetails,snippet",
                playlistId: uploadsPlaylistId,
                maxResults: String(MAX_RESULTS_PER_PAGE),
                pageToken,
                key: apiKey
            });
            playlistItems.push(...(page.items || []));
            pageToken = page.nextPageToken;
        } while (pageToken);

        const videoIds = [...new Set(playlistItems.map((item) => item.contentDetails?.videoId).filter(Boolean))];
        const videosById = new Map();

        for (const ids of chunks(videoIds, MAX_RESULTS_PER_PAGE)) {
            const response = await youtubeRequest("videos", {
                part: "snippet,contentDetails,statistics",
                id: ids.join(","),
                key: apiKey
            });
            for (const video of response.items || []) videosById.set(video.id, video);
        }

        const videos = playlistItems
            .map((item) => videosById.get(item.contentDetails?.videoId))
            .filter(Boolean)
            .map((video) => ({
                id: video.id,
                title: video.snippet?.title || "",
                publishedAt: video.snippet?.publishedAt || "",
                thumbnail: video.snippet?.thumbnails?.maxres?.url || video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || "",
                viewCount: Number(video.statistics?.viewCount || 0),
                duration: formatDuration(video.contentDetails?.duration),
                url: `https://www.youtube.com/watch?v=${video.id}`
            }))
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        res.setHeader("Cache-Control", CACHE_CONTROL);
        return res.status(200).json({ videos, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error("YouTube catalog API error:", error);
        return res.status(error.status || 500).json({ error: error.message || "Could not load YouTube catalogue" });
    }
}

async function youtubeRequest(resource, params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null) query.set(key, value);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${resource}?${query.toString()}`);
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.error?.message || `YouTube ${resource} API error`);
        error.status = response.status;
        throw error;
    }
    return data;
}

function chunks(items, size) {
    const result = [];
    for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
    return result;
}

function formatDuration(isoDuration) {
    const match = String(isoDuration || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;
}
