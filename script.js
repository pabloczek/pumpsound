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

        // Wyświetlenie 4 najnowszych utworów
        if (data.videos) {
            renderMusic(data.videos.slice(0, 4));
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

                    <div class="music-play" aria-hidden="true">
                        <svg
                            class="music-youtube-icon"
                            width="30"
                            height="22"
                            viewBox="0 0 24 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M23.5 3.1C23.2 1.9 22.3 1 21.1 0.7C18.9 0 12 0 12 0C12 0 5.1 0 2.9 0.7C1.7 1 0.8 1.9 0.5 3.1C0 5.3 0 9 0 9C0 9 0 12.7 0.5 14.9C0.8 16.1 1.7 17 2.9 17.3C5.1 18 12 18 12 18C12 18 18.9 18 21.1 17.3C22.3 17 23.2 16.1 23.5 14.9C24 12.7 24 9 24 9C24 9 24 5.3 23.5 3.1Z"
                                fill="currentColor"
                            />

                            <path
                                d="M9.6 5.2L15.8 9L9.6 12.8V5.2Z"
                                fill="#0a0a0a"
                            />
                        </svg>
                    </div>

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