async function loadYouTubeData() {
    try {
        const response = await fetch("/api/youtube");

        if (!response.ok) {
            throw new Error("Could not load YouTube data");
        }

        const data = await response.json();

        // Aktualizacja statystyk kanału
        if (data.views !== undefined) {
            const viewsElement = document.querySelector("#youtube-views");

            if (viewsElement) {
                viewsElement.textContent = formatViews(data.views);
            }
        }

        if (data.subscribers !== undefined) {
            const subscribersElement = document.querySelector("#youtube-subscribers");

            if (subscribersElement) {
                subscribersElement.textContent = formatSubscribers(data.subscribers);
            }
        }

        // Wyświetlenie najnowszych numerów
        if (data.videos) {
            renderMusic(data.videos);
        }

    } catch (error) {
        console.error("YouTube data error:", error);

        const musicList = document.querySelector("#music-list");

        if (musicList) {
            musicList.innerHTML = `
                <div class="music-loading">
                    COULD NOT LOAD RELEASES.
                </div>
            `;
        }
    }
}


function renderMusic(videos) {
    const musicList = document.querySelector("#music-list");

    if (!musicList) {
        return;
    }

    if (!videos || videos.length === 0) {
        musicList.innerHTML = `
            <div class="music-loading">
                NO RELEASES FOUND.
            </div>
        `;

        return;
    }

    musicList.innerHTML = videos.map((video) => {

        const date = formatDate(video.publishedAt);
        const views = formatViews(video.views);

        return `
            <a
                href="${video.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="music-item"
            >

                <div class="music-thumbnail">

                    <img
                        src="${video.thumbnail}"
                        alt="${escapeHTML(video.title)}"
                        loading="lazy"
                    >

                    <div class="music-play">
                        ▶
                    </div>

                </div>


                <div class="music-info">

                    <div class="music-title">
                        ${escapeHTML(video.title)}
                    </div>

                    <div class="music-meta">

                        <span class="music-date">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="4.5"
                                    width="18"
                                    height="16"
                                    rx="2"
                                ></rect>

                                <path
                                    d="M16 2.5v4M8 2.5v4M3 9.5h18"
                                ></path>

                            </svg>

                            ${date}

                        </span>


                        <span class="music-views">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                                ></path>

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="2.5"
                                ></circle>

                            </svg>

                            ${views} VIEWS

                        </span>

                    </div>

                </div>

            </a>
        `;

    }).join("");
}


function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}


function formatViews(views) {
    if (views >= 1000000000) {
        return (
            views / 1000000000
        ).toFixed(1).replace(".0", "") + "B+";
    }

    if (views >= 1000000) {
        return (
            views / 1000000
        ).toFixed(1).replace(".0", "") + "M+";
    }

    if (views >= 1000) {
        return (
            views / 1000
        ).toFixed(1).replace(".0", "") + "K+";
    }

    return Number(views).toLocaleString("en-US");
}


function formatSubscribers(subscribers) {
    if (subscribers >= 1000000) {
        return (
            subscribers / 1000000
        ).toFixed(1).replace(".0", "") + "M+";
    }

    if (subscribers >= 1000) {
        return (
            subscribers / 1000
        ).toFixed(1).replace(".0", "") + "K+";
    }

    return Number(subscribers).toLocaleString("en-US");
}


function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


loadYouTubeData();