export default async function handler(req, res) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Missing YOUTUBE_API_KEY"
            });
        }

        const params = new URLSearchParams({
            part: "statistics",
            forHandle: "@pumpsound",
            key: apiKey
        });

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "YouTube API error",
                details: data
            });
        }

        if (!data.items || data.items.length === 0) {
            return res.status(404).json({
                error: "PUMPSOUND YouTube channel not found"
            });
        }

        const statistics = data.items[0].statistics;

        res.setHeader(
            "Cache-Control",
            "s-maxage=1800, stale-while-revalidate=3600"
        );

        return res.status(200).json({
            views: Number(statistics.viewCount),
            subscribers: Number(statistics.subscriberCount),
            videos: Number(statistics.videoCount)
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}