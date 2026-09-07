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


/* ============================= */
/* MUSIC */
/* ============================= */

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

    musicList.innerHTML = videos.map((video, index) => {

        const date = formatDate(video.publishedAt);
        const views = formatViews(video.views);

        return `
            <a
                href="${video.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="music-item"
            >

                <div class="music-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>


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

                        <span>
                            ${date}
                        </span>

                        <span>
                            ${views} VIEWS
                        </span>

                    </div>

                </div>


                <div class="music-arrow">
                    ↗
                </div>

            </a>
        `;
    }).join("");
}


/* ============================= */
/* DATE */
/* ============================= */

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


/* ============================= */
/* VIEWS */
/* ============================= */

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


/* ============================= */
/* SUBSCRIBERS */
/* ============================= */

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


/* ============================= */
/* SECURITY */
/* ============================= */

function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ============================= */
/* START */
/* ============================= */

loadYouTubeData();