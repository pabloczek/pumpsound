export default async function handler(req, res) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Missing YOUTUBE_API_KEY"
            });
        }

        // 1. Pobieramy kanał PUMPSOUND
        const channelParams = new URLSearchParams({
            part: "contentDetails",
            forHandle: "@pumpsound",
            key: apiKey
        });

        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?${channelParams.toString()}`
        );

        const channelData = await channelResponse.json();

        if (!channelResponse.ok) {
            return res.status(channelResponse.status).json({
                error: "YouTube channel API error",
                details: channelData
            });
        }

        if (!channelData.items || channelData.items.length === 0) {
            return res.status(404).json({
                error: "PUMPSOUND YouTube channel not found"
            });
        }

        const uploadsPlaylistId =
            channelData.items[0].contentDetails.relatedPlaylists.uploads;


        // 2. Pobieramy ostatnie 15 filmów
        //    i później odrzucamy Shortsy
        const playlistParams = new URLSearchParams({
            part: "snippet,contentDetails",
            playlistId: uploadsPlaylistId,
            maxResults: "15",
            key: apiKey
        });

        const playlistResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`
        );

        const playlistData = await playlistResponse.json();

        if (!playlistResponse.ok) {
            return res.status(playlistResponse.status).json({
                error: "YouTube playlist API error",
                details: playlistData
            });
        }


        // 3. Bierzemy ID filmów
        const videoIds = playlistData.items
            .map(item => item.contentDetails.videoId)
            .filter(Boolean);

        if (videoIds.length === 0) {
            return res.status(200).json({
                videos: []
            });
        }


        // 4. Pobieramy informacje o filmach:
        //    długość + wyświetlenia
        const videoParams = new URLSearchParams({
            part: "snippet,contentDetails,statistics",
            id: videoIds.join(","),
            key: apiKey
        });

        const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`
        );

        const videoData = await videoResponse.json();

        if (!videoResponse.ok) {
            return res.status(videoResponse.status).json({
                error: "YouTube videos API error",
                details: videoData
            });
        }


        // 5. Pomijamy Shortsy
        //
        // Shorts zazwyczaj mają maksymalnie 60 sekund.
        // Dzięki temu nie pokazujemy ich w MUSIC.
        const musicVideos = videoData.items
            .filter(video => {
                const duration = parseDuration(
                    video.contentDetails.duration
                );

                return duration > 60;
            })
            .slice(0, 5);


        // 6. Przygotowujemy dane dla strony
        const videos = musicVideos.map(video => ({
            id: video.id,

            title: video.snippet.title,

            publishedAt: video.snippet.publishedAt,

            thumbnail:
                video.snippet.thumbnails.maxres?.url ||
                video.snippet.thumbnails.high?.url ||
                video.snippet.thumbnails.medium?.url,

            views: Number(video.statistics?.viewCount || 0),

            url: `https://www.youtube.com/watch?v=${video.id}`
        }));


        // Cache:
        // strona nie musi pytać YouTube przy każdym odświeżeniu
        res.setHeader(
            "Cache-Control",
            "s-maxage=1800, stale-while-revalidate=3600"
        );


        return res.status(200).json({
            videos
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Zamienia format ISO 8601 YouTube,
// np. PT3M42S,
// na liczbę sekund.
function parseDuration(duration) {
    const match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );

    if (!match) {
        return 0;
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);

    return (
        hours * 3600 +
        minutes * 60 +
        seconds
    );
}