export default async function handler(req, res) {
    try {
        const clientId = process.env.SOUNDCHARTS_CLIENT_ID;
        const clientSecret = process.env.SOUNDCHARTS_CLIENT_SECRET;
        const teamId = process.env.SOUNDCHARTS_TEAM_ID;

        if (!clientId || !clientSecret || !teamId) {
            return res.status(500).json({
                error: "Missing Soundcharts environment variables"
            });
        }

        const artists = {
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

        // Pobieramy Access Token
        const credentials = Buffer
            .from(`${clientId}:${clientSecret}`)
            .toString("base64");

        const tokenResponse = await fetch(
            "https://account.soundcharts.com/oauth/token",
            {
                method: "POST",

                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body:
                    `grant_type=client_credentials&team_id=${encodeURIComponent(teamId)}`
            }
        );

        const tokenData =
            await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(tokenResponse.status).json({
                error: "Soundcharts authentication error",
                details: tokenData
            });
        }

        const accessToken =
            tokenData.access_token;

        if (!accessToken) {
            return res.status(500).json({
                error: "Soundcharts did not return an access token"
            });
        }

        // Pobieramy dane wszystkich artystów
        const results = {};

        for (const [key, artist] of Object.entries(artists)) {

            try {
                const response = await fetch(
                    `https://customer.api.soundcharts.com/api/v2/artist/${artist.uuid}/streaming/spotify/listening?offset=0&limit=1&sort=desc`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${accessToken}`
                        }
                    }
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.items ||
                    data.items.length === 0
                ) {
                    results[key] = {
                        name: artist.name,
                        monthlyListeners: null
                    };

                    continue;
                }

                results[key] = {
                    name: artist.name,
                    monthlyListeners:
                        Number(data.items[0].value) || 0,

                    date:
                        data.items[0].date || null
                };

            } catch (error) {

                results[key] = {
                    name: artist.name,
                    monthlyListeners: null
                };
            }
        }

        // Cache na 10 dni
        res.setHeader(
            "Cache-Control",
            "s-maxage=864000, stale-while-revalidate=86400"
        );

        return res.status(200).json({
            success: true,
            updatedAt: new Date().toISOString(),
            artists: results
        });

    } catch (error) {

        console.error(
            "Soundcharts API ERROR:",
            error
        );

        return res.status(500).json({
            error: "Server error",
            message:
                error?.message ||
                "Unknown error"
        });
    }
}