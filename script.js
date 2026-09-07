async function loadYouTubeData() {
    try {
        const response = await fetch("/api/youtube");

        if (!response.ok) {
            throw new Error("Could not load YouTube data");
        }

        const data = await response.json();

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

        if (Array.isArray(data.videos)) {
            const latestVideos = [...data.videos]
                .sort((a, b) => {
                    return new Date(b.publishedAt) - new Date(a.publishedAt);
                })
                .slice(0, 4);

            renderMusic(latestVideos);
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
        const parsedTitle = parseMusicTitle(video.title);

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

                    <div class="music-play" aria-hidden="true"></div>

                </div>

                <div class="music-info">

                    <div class="music-copy">

                        <div class="music-artist">
                            ${escapeHTML(parsedTitle.artist)}
                        </div>

                        <div class="music-title">
                            ${escapeHTML(parsedTitle.title.toUpperCase())}
                        </div>

                        ${parsedTitle.remix ? `
                            <div class="music-remix">
                                ${escapeHTML(parsedTitle.remix.toUpperCase())}
                            </div>
                        ` : ""}

                    </div>

                    <div class="music-meta">

                        <span class="music-date">

                            <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="17"
                                    rx="2"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                />

                                <path
                                    d="M16 2V6"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                />

                                <path
                                    d="M8 2V6"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                />

                                <path
                                    d="M3 10H21"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                />
                            </svg>

                            ${date}

                        </span>

                        <span class="music-views">

                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2.5 12C2.5 12 6 5.5 12 5.5C18 5.5 21.5 12 21.5 12C21.5 12 18 18.5 12 18.5C6 18.5 2.5 12 2.5 12Z"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                />

                                <circle
                                    cx="12"
                                    cy="12"
                                    r="2.8"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                />
                            </svg>

                            ${views}

                        </span>

                    </div>

                </div>

            </a>
        `;
    }).join("");
}


function parseMusicTitle(fullTitle) {
    const title = String(fullTitle || "").trim();

    let artist = "";
    let mainTitle = title;
    let remix = "";

    const remixMatch = mainTitle.match(
        /\s*(\(PUMPSOUND\s+REMIX\))\s*$/i
    );

    if (remixMatch) {
        remix = remixMatch[1];

        mainTitle = mainTitle
            .slice(0, remixMatch.index)
            .trim();
    }

    const separatorIndex = mainTitle.indexOf(" - ");

    if (separatorIndex !== -1) {
        artist = mainTitle
            .slice(0, separatorIndex)
            .trim();

        mainTitle = mainTitle
            .slice(separatorIndex + 3)
            .trim();
    }

    return {
        artist,
        title: mainTitle,
        remix
    };
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
    const numericViews = Number(views) || 0;

    if (numericViews >= 1000000000) {
        return (
            numericViews / 1000000000
        ).toFixed(1).replace(".0", "") + "B+";
    }

    if (numericViews >= 1000000) {
        return (
            numericViews / 1000000
        ).toFixed(1).replace(".0", "") + "M+";
    }

    if (numericViews >= 1000) {
        return (
            numericViews / 1000
        ).toFixed(1).replace(".0", "") + "K+";
    }

    return numericViews.toLocaleString("en-US");
}


function formatSubscribers(subscribers) {
    const numericSubscribers = Number(subscribers) || 0;

    if (numericSubscribers >= 1000000) {
        return (
            numericSubscribers / 1000000
        ).toFixed(1).replace(".0", "") + "M+";
    }

    if (numericSubscribers >= 1000) {
        return (
            numericSubscribers / 1000
        ).toFixed(1).replace(".0", "") + "K+";
    }

    return numericSubscribers.toLocaleString("en-US");
}


function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


loadYouTubeData();