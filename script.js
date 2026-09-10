const translations = {
    en: {
        "nav.music": "MUSIC",
        "nav.videos": "VIDEOS",
        "nav.download": "DOWNLOAD",
        "nav.about": "ABOUT",
        "nav.contact": "CONTACT",

        "hero.kicker": "MUSIC PRODUCER FROM POLAND",
        "hero.subtitle": "POLISH SOUND. GLOBAL REACH.",
        "hero.listen": "LISTEN",
        "hero.scroll": "SCROLL TO EXPLORE",
        "hero.scrollAria": "Scroll to explore",

        "player.press": "PRESS",
        "player.toPlay": "TO PLAY",
        "player.toPause": "TO PAUSE",
        "player.tapToPlay": "TAP TO PLAY",
        "player.tapToPause": "TAP TO PAUSE",
        "player.nowPlaying": "NOW PLAYING",
        "player.queue": "QUEUE",
        "player.play": "Play",
        "player.pause": "Pause",
        "player.unavailable": "UNAVAILABLE",

        "sections.music": "MUSIC",
        "sections.visuals": "VISUALS",
        "sections.about": "ABOUT",
        "sections.contact": "CONTACT",

        "music.heading": "LATEST<br>RELEASES.",
        "music.description": "THE LATEST MUSIC FROM PUMPSOUND,\nAUTOMATICALLY UPDATED FROM YOUTUBE.",
        "music.loading": "LOADING RELEASES...",
        "music.noReleases": "NO RELEASES FOUND.",
        "music.loadError": "COULD NOT LOAD RELEASES.",

        "visuals.latest": "LATEST VISUAL",

        "about.kicker": "THE PROJECT",
        "about.heading": "MUSIC<br>WITHOUT<br>LIMITS.",
        "about.bio": "PUMPSOUND is a music producer and artist creating modern club sounds that combine high energy, polished production and a strong sense of current trends.",
        "about.collaborations": "SELECTED COLLABORATIONS",
        "about.artists": "06 ARTISTS",

        "stats.views": "TOTAL YOUTUBE VIEWS",
        "stats.subscribers": "YOUTUBE SUBSCRIBERS",
        "stats.spotify": "MONTHLY SPOTIFY LISTENERS",
        "stats.videos": "YOUTUBE VIDEOS",

        "contact.heading": "LET'S WORK<br>TOGETHER.",

        "footer.copyright": "© 2026 PUMPSOUND",
        "footer.poland": "POLAND"
    },

    pl: {
        "nav.music": "MUZYKA",
        "nav.videos": "WIDEO",
        "nav.download": "DOWNLOAD",
        "nav.about": "O MNIE",
        "nav.contact": "KONTAKT",

        "hero.kicker": "PRODUCENT MUZYCZNY Z POLSKI",
        "hero.subtitle": "POLSKIE BRZMIENIE. GLOBALNY ZASIĘG.",
        "hero.listen": "SŁUCHAJ",
        "hero.scroll": "PRZEJDŹ DALEJ",
        "hero.scrollAria": "Przewiń dalej",

        "player.press": "NACIŚNIJ",
        "player.toPlay": "ABY ODTWARZAĆ",
        "player.toPause": "ABY ZATRZYMAĆ",
        "player.tapToPlay": "DOTKNIJ, ABY ODTWARZAĆ",
        "player.tapToPause": "DOTKNIJ, ABY ZATRZYMAĆ",
        "player.nowPlaying": "TERAZ GRA",
        "player.queue": "KOLEJKA",
        "player.play": "Odtwórz",
        "player.pause": "Zatrzymaj",
        "player.unavailable": "NIEDOSTĘPNE",

        "sections.music": "MUZYKA",
        "sections.visuals": "WIDEO",
        "sections.about": "O MNIE",
        "sections.contact": "KONTAKT",

        "music.heading": "NAJNOWSZE<br>UTWORY.",
        "music.description": "NAJNOWSZA MUZYKA PUMPSOUND,\nAUTOMATYCZNIE AKTUALIZOWANA Z YOUTUBE.",
        "music.loading": "ŁADOWANIE UTWORÓW...",
        "music.noReleases": "NIE ZNALEZIONO UTWORÓW.",
        "music.loadError": "NIE UDAŁO SIĘ ZAŁADOWAĆ UTWORÓW.",

        "visuals.latest": "NAJNOWSZE WIDEO",

        "about.kicker": "PROJEKT",
        "about.heading": "MUZYKA<br>BEZ<br>OGRANICZEŃ.",
        "about.bio": "PUMPSOUND to producent muzyczny i artysta tworzący nowoczesne klubowe brzmienia, łączące wysoką energię, dopracowaną produkcję i wyczucie aktualnych trendów.",
        "about.collaborations": "WYBRANE WSPÓŁPRACE",
        "about.artists": "06 ARTYSTÓW",

        "stats.views": "ŁĄCZNE WYŚWIETLENIA YOUTUBE",
        "stats.subscribers": "SUBSKRYPCJE YOUTUBE",
        "stats.spotify": "MIESIĘCZNYCH SŁUCHACZY SPOTIFY",
        "stats.videos": "FILMY NA YOUTUBE",

        "contact.heading": "DZIAŁAJMY<br>RAZEM.",

        "footer.copyright": "© 2026 PUMPSOUND",
        "footer.poland": "POLSKA"
    }
};


let currentLanguage = getInitialLanguage();

let collaborationStatsData = {
    spotify: {},
    youtube: {}
};


const aboutStatsData = {
    youtubeViews: {
        selector: "#youtube-views",
        formatter: formatViews,
        value: null
    },
    youtubeSubscribers: {
        selector: "#youtube-subscribers",
        formatter: formatSubscribers,
        value: null
    },
    spotifyListeners: {
        selector: "#spotify-listeners",
        formatter: formatListeners,
        value: null
    },
    youtubeVideos: {
        selector: "#youtube-videos",
        formatter: formatViews,
        value: null
    }
};

let aboutStatsVisible = false;

const animatedAboutStats = new Set();

const ABOUT_STATS_ANIMATION_DURATION = 2200;


function getInitialLanguage() {

    const savedLanguage = localStorage.getItem(
        "pumpsound-language"
    );

    if (
        savedLanguage === "en" ||
        savedLanguage === "pl"
    ) {
        return savedLanguage;
    }

    return navigator.language?.toLowerCase().startsWith("pl")
        ? "pl"
        : "en";
}


function setupAboutStatsAnimation() {

    const aboutStats =
        document.querySelector(
            ".about-stats"
        );


    if (!aboutStats) {
        return;
    }


    const revealAboutStats = () => {

        aboutStatsVisible = true;

        Object.keys(aboutStatsData).forEach(
            animateAboutStat
        );

    };


    if (!("IntersectionObserver" in window)) {

        revealAboutStats();

        return;
    }


    const observer = new IntersectionObserver(
        (entries) => {

            if (!entries[0].isIntersecting) {
                return;
            }


            observer.disconnect();

            revealAboutStats();

        },
        {
            threshold: 0.2
        }
    );


    observer.observe(
        aboutStats
    );

}


function setAboutStatValue(key, value) {

    const stat = aboutStatsData[key];

    const numericValue = Number(value);


    if (
        !stat ||
        !Number.isFinite(numericValue)
    ) {
        return;
    }


    stat.value = numericValue;


    if (aboutStatsVisible) {
        animateAboutStat(key);
    }

}


function animateAboutStat(key) {

    const stat = aboutStatsData[key];


    if (
        !stat ||
        stat.value === null ||
        animatedAboutStats.has(key)
    ) {
        return;
    }


    const element =
        document.querySelector(
            stat.selector
        );


    if (!element) {
        return;
    }


    animatedAboutStats.add(key);


    const renderValue = (value) => {

        element.textContent =
            stat.formatter(value);

    };


    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        renderValue(stat.value);

        return;
    }


    const startTime = performance.now();


    const update = (currentTime) => {

        const progress = Math.min(
            (currentTime - startTime) /
                ABOUT_STATS_ANIMATION_DURATION,
            1
        );

        const easedProgress =
            1 - Math.pow(1 - progress, 4);


        renderValue(
            Math.round(
                stat.value * easedProgress
            )
        );


        if (progress < 1) {
            requestAnimationFrame(update);
        }

    };


    renderValue(0);

    requestAnimationFrame(update);

}


function applyLanguage(language, animate = false) {

    if (!translations[language]) {
        return;
    }

    currentLanguage = language;

    localStorage.setItem(
        "pumpsound-language",
        language
    );

    document.documentElement.lang = language;


    document.querySelectorAll("[data-i18n]").forEach((element) => {

        const key = element.dataset.i18n;
        const translation = translations[language][key];

        if (translation !== undefined) {
            element.innerHTML = translation;
        }

    });


    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {

        const key = element.dataset.i18nAria;
        const translation = translations[language][key];

        if (translation !== undefined) {
            element.setAttribute(
                "aria-label",
                translation
            );
        }

    });


    document.querySelectorAll(".language-button").forEach((button) => {

        const isActive =
            button.dataset.language === language;

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );

    });


    document
        .querySelectorAll(
            ".collaboration-stat-label"
        )
        .forEach((label) => {

            label.textContent =
                language === "pl"
                    ? "MIESIĘCZNYCH SŁUCHACZY SPOTIFY"
                    : "MONTHLY SPOTIFY LISTENERS";

        });


    updateCollaborationStatsLanguage();

    if (typeof updatePlayerText === "function") {
        updatePlayerText();
    }


    const languageSwitcher =
        document.querySelector(
            ".language-switcher"
        );


    if (languageSwitcher) {

        languageSwitcher.dataset.active =
            language;


        if (animate) {

            languageSwitcher.classList.remove(
                "is-changing"
            );


            requestAnimationFrame(() => {

                languageSwitcher.classList.add(
                    "is-changing"
                );

            });


            window.setTimeout(() => {

                languageSwitcher.classList.remove(
                    "is-changing"
                );

            }, 350);

        }

    }

}


function setupLanguageSwitcher() {

    document.querySelectorAll(
        ".language-button"
    ).forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.dataset.language ===
                    currentLanguage
                ) {
                    return;
                }

                applyLanguage(
                    button.dataset.language,
                    true
                );

            }
        );

    });


    applyLanguage(
        currentLanguage
    );

}


function setupCollaborationStats() {

    const collaborations =
        document.querySelectorAll(
            ".collaboration"
        );

    const artistKeys = [
        "majki",
        "cypis",
        "sequento",
        "diho",
        "cheatz",
        "bekaKsh"
    ];

    collaborations.forEach((collaboration, index) => {

        const key =
            artistKeys[index];

        if (!key) {
            return;
        }

        collaboration.dataset.artistKey =
            key;

    });

}


async function loadSpotifyData() {

    try {

        const response =
            await fetch(
                "/api/spotify"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load Spotify data"
            );

        }


        const data =
            await response.json();


        if (
            !data.artists ||
            typeof data.artists !== "object"
        ) {
            return;
        }


        collaborationStatsData.spotify =
            data.artists;


        const pumpsoundListeners =
            data.artists.pumpsound?.monthlyListeners;


        if (
            pumpsoundListeners !== null &&
            pumpsoundListeners !== undefined
        ) {
            setAboutStatValue(
                "spotifyListeners",
                pumpsoundListeners
            );
        }


        renderCollaborationStats();


    } catch (error) {

        console.error(
            "Spotify data error:",
            error
        );

    }

}


function renderCollaborationStats() {

    document
        .querySelectorAll(
            ".collaboration[data-artist-key]"
        )
        .forEach((collaboration) => {

            const artistKey =
                collaboration.dataset.artistKey;

            const spotifyArtist =
                collaborationStatsData.spotify[
                    artistKey
                ];

            const youtubeArtist =
                collaborationStatsData.youtube[
                    artistKey
                ];


            const overlay =
                collaboration.querySelector(
                    ".collaboration-overlay span"
                );


            if (!overlay) {
                return;
            }


            const hasSpotify =
                spotifyArtist &&
                spotifyArtist.monthlyListeners !== null &&
                spotifyArtist.monthlyListeners !== undefined;


            const hasYoutube =
                youtubeArtist &&
                (
                    youtubeArtist.subscribers !== null ||
                    youtubeArtist.views !== null
                );


            if (!hasSpotify && !hasYoutube) {
                return;
            }


            const youtubeSubscribers =
                youtubeArtist?.subscribers !== null &&
                youtubeArtist?.subscribers !== undefined
                    ? formatSubscribers(
                        youtubeArtist.subscribers
                    )
                    : "—";


            const youtubeViews =
                youtubeArtist?.views !== null &&
                youtubeArtist?.views !== undefined
                    ? formatViews(
                        youtubeArtist.views
                    )
                    : "—";


            const spotifyListeners =
                hasSpotify
                    ? formatListeners(
                        spotifyArtist.monthlyListeners
                    )
                    : "—";


            overlay.innerHTML = `
                <span class="collaboration-stat-item">
                    <span class="collaboration-stat-value">
                        ${spotifyListeners}
                    </span>
                    <span class="collaboration-stat-label">
                        ${currentLanguage === "pl"
                            ? "MIESIĘCZNYCH SŁUCHACZY SPOTIFY"
                            : "MONTHLY SPOTIFY LISTENERS"
                        }
                    </span>
                </span>

                <span class="collaboration-stat-item">
                    <span class="collaboration-stat-value">
                        ${youtubeSubscribers}
                    </span>
                    <span class="collaboration-stat-label">
                        ${currentLanguage === "pl"
                            ? "SUBSKRYPCJI YOUTUBE"
                            : "YOUTUBE SUBSCRIBERS"
                        }
                    </span>
                </span>

                <span class="collaboration-stat-item">
                    <span class="collaboration-stat-value">
                        ${youtubeViews}
                    </span>
                    <span class="collaboration-stat-label">
                        ${currentLanguage === "pl"
                            ? "WYŚWIETLEŃ YOUTUBE"
                            : "YOUTUBE VIEWS"
                        }
                    </span>
                </span>
            `;


            overlay.classList.add(
                "collaboration-stats"
            );

        });

}


function updateCollaborationStatsLanguage() {

    renderCollaborationStats();

}


function formatListeners(listeners) {

    const numericListeners =
        Number(listeners) || 0;


    if (
        numericListeners >=
        1000000000
    ) {

        return (
            numericListeners /
            1000000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "B";

    }


    if (
        numericListeners >=
        1000000
    ) {

        return (
            numericListeners /
            1000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "M";

    }


    if (
        numericListeners >=
        1000
    ) {

        return (
            numericListeners /
            1000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "K";

    }


    return numericListeners.toLocaleString(
        "en-US"
    );

}


function setupCollaborationStatsStyles() {

    if (
        document.querySelector(
            "#pumpsound-collaboration-stats-styles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "pumpsound-collaboration-stats-styles";


    style.textContent = `
        .collaboration-overlay span.collaboration-stats {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 7px;
            line-height: 1;
            text-align: center;
        }

        .collaboration-overlay
        .collaboration-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
        }

        .collaboration-overlay
        .collaboration-stat-value {
            font-size: clamp(18px, 1.55vw, 25px);
            font-weight: 600;
            letter-spacing: -0.3px;
            text-shadow: 0 2px 12px rgba(0,0,0,0.45);
        }

        .collaboration-overlay
        .collaboration-stat-label {
            font-size: 6px;
            font-weight: 400;
            letter-spacing: 1.2px;
            opacity: 0.8;
            white-space: nowrap;
            text-shadow: 0 1px 8px rgba(0,0,0,0.45);
        }

        @media (max-width: 768px) {
            .collaboration-overlay span.collaboration-stats {
                gap: 5px;
            }

            .collaboration-overlay
            .collaboration-stat-value {
                font-size: 14px;
            }

            .collaboration-overlay
            .collaboration-stat-label {
                font-size: 4.5px;
                letter-spacing: 1px;
            }
        }
    `;


    document.head.appendChild(
        style
    );

}


async function loadYouTubeData() {

    try {

        const response =
            await fetch(
                "/api/youtube"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load YouTube data"
            );

        }


        const data =
            await response.json();


        if (
            data.artists &&
            typeof data.artists === "object"
        ) {
            collaborationStatsData.youtube =
                data.artists;

            renderCollaborationStats();
        }


        if (data.views !== undefined) {

            setAboutStatValue(
                "youtubeViews",
                data.views
            );

        }


        if (data.subscribers !== undefined) {

            setAboutStatValue(
                "youtubeSubscribers",
                data.subscribers
            );

        }


        if (data.videoCount !== undefined) {

            setAboutStatValue(
                "youtubeVideos",
                data.videoCount
            );

        }


        if (Array.isArray(data.videos)) {

            const latestVideos =
                [...data.videos]
                    .sort((a, b) => {

                        return new Date(
                            b.publishedAt
                        ) -
                        new Date(
                            a.publishedAt
                        );

                    })
                    .slice(0, 4);


            renderMusic(
                latestVideos
            );

        }

    } catch (error) {

        console.error(
            "YouTube data error:",
            error
        );


        const musicList =
            document.querySelector(
                "#music-list"
            );


        if (musicList) {

            musicList.innerHTML = `
                <div class="music-loading">
                    ${escapeHTML(
                        translations[
                            currentLanguage
                        ][
                            "music.loadError"
                        ]
                    )}
                </div>
            `;

        }

    }

}


function renderMusic(videos) {

    const musicList =
        document.querySelector(
            "#music-list"
        );


    if (!musicList) {
        return;
    }


    if (
        !videos ||
        videos.length === 0
    ) {

        musicList.innerHTML = `
            <div class="music-loading">
                ${escapeHTML(
                    translations[
                        currentLanguage
                    ][
                        "music.noReleases"
                    ]
                )}
            </div>
        `;

        return;
    }


    musicList.innerHTML =
        videos.map((video) => {

            const date =
                formatDate(
                    video.publishedAt
                );


            const views =
                formatViews(
                    video.views
                );


            const parsedTitle =
                parseMusicTitle(
                    video.title
                );


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
                            alt="${escapeHTML(
                                video.title
                            )}"
                            loading="lazy"
                        >

                        <div
                            class="music-play"
                            aria-hidden="true"
                        >

                            <svg
                                class="music-youtube-icon"
                                viewBox="0 0 68 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >

                                <path
                                    fill="#fff"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M66.5 7.5C65.8 4.7 63.3 2.5 60.4 1.8C55.1 0.5 34 0.5 34 0.5C34 0.5 12.9 0.5 7.6 1.8C4.7 2.5 2.2 4.7 1.5 7.5C0.2 12.8 0.2 24 0.2 24C0.2 24 0.2 35.2 1.5 40.5C2.2 43.3 4.7 45.5 7.6 46.2C12.9 47.5 34 47.5 34 47.5C34 47.5 55.1 47.5 60.4 46.2C63.3 45.5 65.8 43.3 66.5 40.5C67.8 35.2 67.8 24 67.8 24C67.8 24 67.8 12.8 66.5 7.5ZM27 34.5V13.5L45 24L27 34.5Z"
                                />

                            </svg>

                        </div>

                    </div>


                    <div class="music-info">

                        <div class="music-copy">

                            <div class="music-artist">
                                ${escapeHTML(
                                    parsedTitle.artist
                                )}
                            </div>

                            <div class="music-title">
                                ${escapeHTML(
                                    parsedTitle.title
                                        .toUpperCase()
                                )}
                            </div>

                            ${
                                parsedTitle.remix
                                    ? `
                                    <div class="music-remix">
                                        ${escapeHTML(
                                            parsedTitle.remix
                                                .toUpperCase()
                                        )}
                                    </div>
                                `
                                    : ""
                            }

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

    const title =
        String(
            fullTitle || ""
        ).trim();


    let artist = "";
    let mainTitle = title;
    let remix = "";


    const remixMatch =
        mainTitle.match(
            /\s*(\(*PUMPSOUND\s+REMIX\)*)\s*$/i
        );


    if (remixMatch) {

        remix =
            remixMatch[1];


        mainTitle =
            mainTitle
                .slice(
                    0,
                    remixMatch.index
                )
                .trim();

    }


    const separatorIndex =
        mainTitle.indexOf(
            " - "
        );


    if (separatorIndex !== -1) {

        artist =
            mainTitle
                .slice(
                    0,
                    separatorIndex
                )
                .trim();


        mainTitle =
            mainTitle
                .slice(
                    separatorIndex + 3
                )
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


    const date =
        new Date(
            dateString
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        date.getFullYear();


    return `${day}.${month}.${year}`;

}


function formatViews(views, showPlus = false) {

    const numericViews =
        Number(views) || 0;

    const suffix =
        showPlus ? "+" : "";


    if (
        numericViews >=
        1000000000
    ) {

        return (
            numericViews /
            1000000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "B" + suffix;

    }


    if (
        numericViews >=
        1000000
    ) {

        return (
            numericViews /
            1000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "M" + suffix;

    }


    if (
        numericViews >=
        1000
    ) {

        return (
            numericViews /
            1000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "K" + suffix;

    }


    return (
        numericViews.toLocaleString(
            "en-US"
        ) + suffix
    );

}


function formatSubscribers(subscribers) {

    const numericSubscribers =
        Number(subscribers) || 0;


    if (
        numericSubscribers >=
        1000000
    ) {

        return (
            numericSubscribers /
            1000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "M";

    }


    if (
        numericSubscribers >=
        1000
    ) {

        return (
            numericSubscribers /
            1000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) + "K";

    }


    return numericSubscribers.toLocaleString(
        "en-US"
    );

}


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* PUMPSOUND PLAYER */

// DISABLED PLAYER: preserved intact for later re-enable. This block is not run.
if (false) {

const tracks = [
    {
        artist: "PUMPSOUND",
        title: "ALL GOOD THINGS RMX",
        src: "audio/all-good-things-rmx.mp3",
        cover: null
    }
];

let currentTrackIndex = 0;
let shuffleEnabled = readPlayerSetting("shuffle", false);
let repeatMode = readPlayerSetting("repeat", "off");
let previousVolume = readPlayerSetting("volume", 0.8);
let trackUnavailable = false;

const playerAudio = new Audio();
playerAudio.preload = "metadata";
playerAudio.volume = Math.min(1, Math.max(0, previousVolume));
playerAudio.muted = readPlayerSetting("muted", false);


function readPlayerSetting(key, fallback) {

    try {
        const value = localStorage.getItem(`pumpsound-player-${key}`);

        return value === null
            ? fallback
            : JSON.parse(value);
    } catch {
        return fallback;
    }

}


function savePlayerSetting(key, value) {

    try {
        localStorage.setItem(
            `pumpsound-player-${key}`,
            JSON.stringify(value)
        );
    } catch {
        // Storage is optional for the player.
    }

}


function getCurrentTrack() {
    return tracks[currentTrackIndex];
}


function formatPlayerTime(time) {

    if (!Number.isFinite(time) || time < 0) {
        return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;

}


function setPlayerText(selector, value) {
    document.querySelectorAll(selector).forEach((element) => {
        element.textContent = value;
    });
}


function updatePlayerText() {

    const dictionary = translations[currentLanguage] || translations.en;
    const isPlaying = !playerAudio.paused;
    const unavailable = trackUnavailable;
    const action = isPlaying
        ? dictionary["player.toPause"]
        : dictionary["player.toPlay"];

    setPlayerText("[data-player-hero-prefix]", dictionary["player.press"]);
    setPlayerText("[data-player-hero-action]", action);
    setPlayerText(
        "[data-player-hero-mobile]",
        isPlaying
            ? dictionary["player.tapToPause"]
            : dictionary["player.tapToPlay"]
    );
    setPlayerText("[data-player-now-playing]", unavailable
        ? dictionary["player.unavailable"]
        : dictionary["player.nowPlaying"]);
    setPlayerText("[data-player-queue-title]", dictionary["player.queue"]);

    document.querySelectorAll(".player-play-toggle").forEach((button) => {
        button.textContent = isPlaying ? "Ⅱ" : "▶";
        button.setAttribute(
            "aria-label",
            isPlaying ? dictionary["player.pause"] : dictionary["player.play"]
        );
        button.disabled = unavailable;
    });

    const heroTrigger = document.querySelector(".hero-player-trigger");

    if (heroTrigger) {
        heroTrigger.setAttribute(
            "aria-label",
            isPlaying ? dictionary["player.pause"] : dictionary["player.play"]
        );
        heroTrigger.disabled = unavailable;
    }

}


function updateMediaSession() {

    if (!("mediaSession" in navigator)) {
        return;
    }

    const track = getCurrentTrack();
    const artwork = track.cover
        ? [{ src: track.cover, sizes: "512x512", type: "image/jpeg" }]
        : [];

    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            artwork
        });
    } catch {
        // Media Session artwork is optional.
    }

}


function updatePlayerUI() {

    const track = getCurrentTrack();
    const duration = Number.isFinite(playerAudio.duration)
        ? playerAudio.duration
        : 0;
    const currentTime = Number.isFinite(playerAudio.currentTime)
        ? playerAudio.currentTime
        : 0;
    const progress = duration > 0
        ? (currentTime / duration) * 100
        : 0;

    setPlayerText(".player-artist", track.artist);
    setPlayerText(".player-title", track.title);
    setPlayerText(".player-mobile-artist", track.artist);
    setPlayerText(".player-mobile-title", track.title);
    setPlayerText(".player-current-time", formatPlayerTime(currentTime));
    setPlayerText(".player-duration", formatPlayerTime(duration));

    document.querySelectorAll(".player-progress").forEach((input) => {
        input.value = String(progress);
        input.disabled = !duration || trackUnavailable;
    });

    document.querySelectorAll(".player-volume").forEach((input) => {
        input.value = String(playerAudio.volume);
    });

    document.querySelectorAll(".player-mute").forEach((button) => {
        button.classList.toggle("is-active", playerAudio.muted);
        button.setAttribute("aria-label", playerAudio.muted ? "Unmute" : "Mute");
    });

    document.querySelectorAll(".player-shuffle").forEach((button) => {
        button.classList.toggle("is-active", shuffleEnabled);
        button.setAttribute("aria-pressed", String(shuffleEnabled));
    });

    document.querySelectorAll(".player-repeat").forEach((button) => {
        button.classList.toggle("is-active", repeatMode !== "off");
        button.dataset.repeat = repeatMode;
        button.setAttribute("aria-label", `Repeat ${repeatMode}`);
    });

    const player = document.querySelector(".site-player");
    if (player) {
        const isActuallyPlaying =
            !playerAudio.paused &&
            !trackUnavailable;

        player.dataset.playerState = isActuallyPlaying
            ? "playing"
            : "paused";
        player.classList.toggle("is-playing", isActuallyPlaying);
        player.classList.toggle("is-unavailable", trackUnavailable);
        player.style.setProperty(
            "--player-progress",
            `${progress}%`
        );
    }

    if ("mediaSession" in navigator) {
        try {
            navigator.mediaSession.playbackState = playerAudio.paused
                ? "paused"
                : "playing";

            if (duration > 0) {
                navigator.mediaSession.setPositionState({
                    duration,
                    position: Math.min(currentTime, duration)
                });
            }
        } catch {
            // Media Session state is optional.
        }
    }

    updatePlayerText();

}


function loadTrack(index, shouldPlay = false) {

    currentTrackIndex = (index + tracks.length) % tracks.length;
    trackUnavailable = false;
    playerAudio.pause();
    playerAudio.removeAttribute("src");
    playerAudio.load();
    updateMediaSession();
    updatePlayerUI();
    renderQueue();

    if (shouldPlay) {
        playTrack();
    }

}


async function playTrack() {

    if (trackUnavailable || !tracks.length) {
        return;
    }

    if (!playerAudio.src) {
        playerAudio.src = getCurrentTrack().src;
    }

    try {
        await playerAudio.play();
    } catch {
        // The audio events keep the UI truthful when playback is blocked or fails.
        updatePlayerUI();
    }

}


function pauseTrack() {
    playerAudio.pause();
}


function togglePlay() {
    if (playerAudio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}


function getNextTrackIndex() {
    if (tracks.length < 2) {
        return currentTrackIndex;
    }

    if (!shuffleEnabled) {
        return (currentTrackIndex + 1) % tracks.length;
    }

    let nextIndex = currentTrackIndex;
    while (nextIndex === currentTrackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
    }

    return nextIndex;
}


function nextTrack(shouldPlay = !playerAudio.paused) {
    loadTrack(getNextTrackIndex(), shouldPlay);
}


function previousTrack() {
    if (playerAudio.currentTime > 3) {
        playerAudio.currentTime = 0;
        return;
    }

    loadTrack(
        shuffleEnabled
            ? getNextTrackIndex()
            : currentTrackIndex - 1,
        !playerAudio.paused
    );
}


function seekTo(percent) {
    if (!Number.isFinite(playerAudio.duration)) {
        return;
    }

    playerAudio.currentTime =
        Math.max(0, Math.min(100, Number(percent))) /
        100 * playerAudio.duration;
}


function cycleRepeatMode() {
    repeatMode = repeatMode === "off"
        ? "all"
        : repeatMode === "all"
            ? "one"
            : "off";
    savePlayerSetting("repeat", repeatMode);
    updatePlayerUI();
}


function renderQueue() {
    const queue = document.querySelector(".player-queue-list");
    if (!queue) return;

    queue.innerHTML = tracks.map((track, index) => `
        <button type="button" class="player-queue-item${index === currentTrackIndex ? " is-current" : ""}" data-track-index="${index}" role="listitem">
            <span><strong>${escapeHTML(track.artist)}</strong><em>${escapeHTML(track.title)}</em></span>
        </button>
    `).join("");
}


function toggleQueue(force) {
    const queue = document.querySelector(".player-queue");
    if (!queue) return;
    const shouldOpen = force ?? queue.hidden;
    queue.hidden = !shouldOpen;
}


function setPlayerExpanded(isExpanded) {

    const player = document.querySelector(".site-player");
    const expandedPanel = document.querySelector(
        ".player-mobile-expanded"
    );

    if (!player || !expandedPanel) {
        return;
    }

    player.classList.toggle("is-expanded", isExpanded);
    expandedPanel.hidden = !isExpanded;

    document.querySelectorAll(".player-mobile-expand").forEach((button) => {
        button.setAttribute("aria-expanded", String(isExpanded));
        button.setAttribute(
            "aria-label",
            isExpanded ? "Collapse player" : "Expand player"
        );
    });

}


function setupMediaSession() {
    if (!("mediaSession" in navigator)) return;

    const actions = {
        play: playTrack,
        pause: pauseTrack,
        previoustrack: previousTrack,
        nexttrack: nextTrack,
        seekbackward: () => { playerAudio.currentTime = Math.max(0, playerAudio.currentTime - 10); },
        seekforward: () => { playerAudio.currentTime = Math.min(playerAudio.duration || 0, playerAudio.currentTime + 10); },
        seekto: (details) => { if (Number.isFinite(details.seekTime)) playerAudio.currentTime = details.seekTime; }
    };

    Object.entries(actions).forEach(([action, handler]) => {
        try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Unsupported action. */ }
    });
}


function setupPlayer() {

    if (!document.querySelector(".site-player")) return;

    updatePlayerUI();
    renderQueue();
    setupMediaSession();

    document.querySelectorAll(".player-play-toggle, .hero-player-trigger").forEach((button) => button.addEventListener("click", togglePlay));
    document.querySelector(".player-track")?.addEventListener(
        "click",
        () => setPlayerExpanded(true)
    );
    document.querySelectorAll(".player-next").forEach((button) => button.addEventListener("click", () => nextTrack()));
    document.querySelectorAll(".player-previous").forEach((button) => button.addEventListener("click", previousTrack));
    document.querySelectorAll(".player-shuffle").forEach((button) => button.addEventListener("click", () => { shuffleEnabled = !shuffleEnabled; savePlayerSetting("shuffle", shuffleEnabled); updatePlayerUI(); }));
    document.querySelectorAll(".player-repeat").forEach((button) => button.addEventListener("click", cycleRepeatMode));
    document.querySelectorAll(".player-mute").forEach((button) => button.addEventListener("click", () => { if (playerAudio.muted) { playerAudio.muted = false; playerAudio.volume = previousVolume; } else { previousVolume = playerAudio.volume || previousVolume; playerAudio.muted = true; } }));
    document.querySelectorAll(".player-volume").forEach((input) => input.addEventListener("input", () => { previousVolume = Number(input.value); playerAudio.volume = previousVolume; playerAudio.muted = false; }));
    document.querySelectorAll(".player-progress").forEach((input) => input.addEventListener("input", () => seekTo(input.value)));
    document.querySelectorAll(".player-queue-toggle").forEach((button) => button.addEventListener("click", () => toggleQueue()));
    document.querySelector(".player-queue-close")?.addEventListener("click", () => toggleQueue(false));
    document.querySelector(".player-mobile-expand")?.addEventListener("click", () => setPlayerExpanded(true));
    document.querySelector(".player-mobile-collapse")?.addEventListener("click", () => setPlayerExpanded(false));

    document.addEventListener("click", (event) => {
        const player = document.querySelector(".site-player");
        if (player && !player.contains(event.target)) toggleQueue(false);
    });
    document.querySelector(".player-queue-list")?.addEventListener("click", (event) => {
        const item = event.target.closest(".player-queue-item");
        if (!item) return;
        loadTrack(Number(item.dataset.trackIndex), true);
        toggleQueue(false);
    });
    document.addEventListener("keydown", (event) => {
        const target = event.target;
        if (event.key.toLowerCase() === "p" && !target.matches("input, textarea, select, [contenteditable='true']")) {
            event.preventDefault();
            togglePlay();
        }
    });

    playerAudio.addEventListener("play", updatePlayerUI);
    playerAudio.addEventListener("pause", updatePlayerUI);
    playerAudio.addEventListener("timeupdate", updatePlayerUI);
    playerAudio.addEventListener("loadedmetadata", updatePlayerUI);
    playerAudio.addEventListener("durationchange", updatePlayerUI);
    playerAudio.addEventListener("volumechange", () => { savePlayerSetting("volume", playerAudio.volume); savePlayerSetting("muted", playerAudio.muted); updatePlayerUI(); });
    playerAudio.addEventListener("error", () => { trackUnavailable = true; updatePlayerUI(); });
    playerAudio.addEventListener("ended", () => {
        if (repeatMode === "one") { playerAudio.currentTime = 0; playTrack(); return; }
        if (tracks.length === 1 || currentTrackIndex < tracks.length - 1 || repeatMode === "all" || shuffleEnabled) nextTrack(true);
        else updatePlayerUI();
    });

}


setupPlayer();
}

setupLanguageSwitcher();
setupCollaborationStats();
setupCollaborationStatsStyles();
setupAboutStatsAnimation();
loadYouTubeData();
loadSpotifyData();
