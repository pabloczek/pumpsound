const translations = {
    en: {
        "nav.music": "MUSIC",
        "nav.videos": "VIDEOS",
        "nav.about": "ABOUT",
        "nav.contact": "CONTACT",

        "hero.kicker": "MUSIC PRODUCER FROM POLAND",
        "hero.subtitle": "POLISH SOUND. GLOBAL REACH.",
        "hero.listen": "LISTEN",
        "hero.scroll": "SCROLL TO EXPLORE",
        "hero.scrollAria": "Scroll to explore",

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
        "stats.reach": "AUDIENCE & REACH",

        "contact.heading": "LET'S WORK<br>TOGETHER.",

        "footer.copyright": "© 2026 PUMPSOUND",
        "footer.poland": "POLAND"
    },

    pl: {
        "nav.music": "MUZYKA",
        "nav.videos": "WIDEO",
        "nav.about": "O MNIE",
        "nav.contact": "KONTAKT",

        "hero.kicker": "PRODUCENT MUZYCZNY Z POLSKI",
        "hero.subtitle": "POLSKIE BRZMIENIE. GLOBALNY ZASIĘG.",
        "hero.listen": "SŁUCHAJ",
        "hero.scroll": "PRZEJDŹ DALEJ",
        "hero.scrollAria": "Przewiń dalej",

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
        "stats.reach": "ODBIORCY I ZASIĘG",

        "contact.heading": "DZIAŁAJMY<br>RAZEM.",

        "footer.copyright": "© 2026 PUMPSOUND",
        "footer.poland": "POLSKA"
    }
};


let currentLanguage = getInitialLanguage();


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


        if (data.views !== undefined) {

            const viewsElement =
                document.querySelector(
                    "#youtube-views"
                );


            if (viewsElement) {

                viewsElement.textContent =
                    formatViews(
                        data.views
                    );

            }

        }


        if (data.subscribers !== undefined) {

            const subscribersElement =
                document.querySelector(
                    "#youtube-subscribers"
                );


            if (subscribersElement) {

                subscribersElement.textContent =
                    formatSubscribers(
                        data.subscribers
                    );

            }

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


function formatViews(views) {

    const numericViews =
        Number(views) || 0;


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
            ) + "B+";

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
            ) + "M+";

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
            ) + "K+";

    }


    return numericViews.toLocaleString(
        "en-US"
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
            ) + "M+";

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
            ) + "K+";

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


setupLanguageSwitcher();
loadYouTubeData();