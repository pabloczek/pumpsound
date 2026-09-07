export default async function handler(req, res) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Missing YOUTUBE_API_KEY"
            });
        }

        // ID kanałów współpracujących artystów
        const artistChannels = {
            majki: "UCTcqn1bL0VNWS04_2FsIRYA",
            cypis: "UCcmG5FNSGn1RrNAAQLrPsjg",
            sequento: "UC4YUa9DAmvA0lOT7Lzgu1yw",
            bekaKsh: "UCJ4drApu4cMIazTtyJa6lsA",
            cheatz: "UCnLF2KJIMoBOw1vVPONFzTA",
            diho: "UC89AruE7z06JF9s39_46mqA"
        };

        // 1. Pobieramy kanał PUMPSOUND wraz ze statystykami
        const channelParams = new URLSearchParams({
            part: "id,statistics",
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

        const channel = channelData.items[0];
        const channelId = channel.id;

        const views = Number(
            channel.statistics?.viewCount || 0
        );

        const subscribers = Number(
            channel.statistics?.subscriberCount || 0
        );

        // 2. Pobieramy statystyki wszystkich współpracujących artystów
        // Jeden request zamiast osobnego requestu dla każdego kanału.
        const artistChannelIds = Object.values(artistChannels).join(",");

        const artistParams = new URLSearchParams({
            part: "id,statistics",
            id: artistChannelIds,
            key: apiKey
        });

        const artistResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?${artistParams.toString()}`
        );

        const artistData = await artistResponse.json();

        if (!artistResponse.ok) {
            return res.status(artistResponse.status).json({
                error: "YouTube artist channels API error",
                details: artistData
            });
        }

        // Przygotowujemy dane artystów
        const artists = {};

        for (const [artistKey, artistChannelId] of Object.entries(
            artistChannels
        )) {
            const artistChannel = artistData.items?.find(
                item => item.id === artistChannelId
            );

            if (!artistChannel) {
                artists[artistKey] = {
                    views: null,
                    subscribers: null
                };

                continue;
            }

            const statistics = artistChannel.statistics || {};

            artists[artistKey] = {
                views: Number(
                    statistics.viewCount || 0
                ),

                // YouTube może nie udostępniać liczby subskrybentów.
                // W takim przypadku zwracamy null zamiast 0.
                subscribers:
                    statistics.subscriberCount !== undefined
                        ? Number(statistics.subscriberCount)
                        : null
            };
        }

        // 3. Pobieramy 50 najnowszych PUBLICZNYCH filmów PUMPSOUND
        const searchParams = new URLSearchParams({
            part: "snippet",
            channelId: channelId,
            type: "video",
            order: "date",
            maxResults: "50",
            key: apiKey
        });

        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
        );

        const searchData = await searchResponse.json();

        if (!searchResponse.ok) {
            return res.status(searchResponse.status).json({
                error: "YouTube search API error",
                details: searchData
            });
        }

        if (!searchData.items || searchData.items.length === 0) {
            res.setHeader(
                "Cache-Control",
                "s-maxage=1800, stale-while-revalidate=3600"
            );

            return res.status(200).json({
                views,
                subscribers,
                artists,
                videos: [],
                updatedAt: new Date().toISOString()
            });
        }

        // 4. Pobieramy ID znalezionych filmów
        const videoIds = searchData.items
            .map(item => item.id?.videoId)
            .filter(Boolean);

        if (videoIds.length === 0) {
            res.setHeader(
                "Cache-Control",
                "s-maxage=1800, stale-while-revalidate=3600"
            );

            return res.status(200).json({
                views,
                subscribers,
                artists,
                videos: [],
                updatedAt: new Date().toISOString()
            });
        }

        // 5. Pobieramy szczegóły filmów
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

        // 6. Pomijamy Shortsy
        const musicVideos = videoData.items
            .filter(video => {
                if (!video.contentDetails?.duration) {
                    return false;
                }

                const duration = parseDuration(
                    video.contentDetails.duration
                );

                return duration > 60;
            })
            .sort((a, b) => {
                return (
                    new Date(b.snippet.publishedAt) -
                    new Date(a.snippet.publishedAt)
                );
            })
            .slice(0, 5);

        // 7. Przygotowujemy dane dla frontendu
        const videos = musicVideos.map(video => ({
            id: video.id,

            title: video.snippet?.title || "",

            publishedAt: video.snippet?.publishedAt || "",

            thumbnail:
                video.snippet?.thumbnails?.maxres?.url ||
                video.snippet?.thumbnails?.high?.url ||
                video.snippet?.thumbnails?.medium?.url ||
                "",

            views: Number(
                video.statistics?.viewCount || 0
            ),

            url: `https://www.youtube.com/watch?v=${video.id}`
        }));

        // Cache na 30 minut
        res.setHeader(
            "Cache-Control",
            "s-maxage=1800, stale-while-revalidate=3600"
        );

        return res.status(200).json({
            views,
            subscribers,
            artists,
            videos,
            updatedAt: new Date().toISOString()
        });

    } catch (error) {

        console.error(
            "YouTube API ERROR:",
            error
        );

        return res.status(500).json({
            error: "Server error",
            message: error?.message || "Unknown error",
            name: error?.name || "Unknown error"
        });
    }
}


// Zamiana czasu ISO 8601 na sekundy
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