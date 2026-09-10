(() => {
    "use strict";

    const copy = {
        en: {
            "nav.music": "MUSIC", "nav.videos": "VIDEOS", "nav.download": "DOWNLOAD", "nav.about": "ABOUT", "nav.contact": "CONTACT",
            "catalog.kicker": "PUMPSOUND ARCHIVE", "catalog.title": "DOWNLOADS", "catalog.lede": "The complete PUMPSOUND catalogue. New YouTube releases appear here automatically.", "catalog.searchLabel": "Search tracks", "catalog.searchPlaceholder": "SEARCH TRACKS", "catalog.available": "YOUTUBE RELEASES", "catalog.empty": "No releases match your search.", "catalog.error": "The catalogue could not be loaded.",
            "track.back": "← ALL DOWNLOADS", "track.free": "FREE DOWNLOAD", "track.comingSoon": "COMING SOON", "track.notAvailable": "DOWNLOAD NOT YET AVAILABLE", "track.gate": "UNLOCK TO DOWNLOAD", "track.stepYoutube": "Subscribe on YouTube", "track.stepInstagram": "Follow @pumpsound_ on Instagram", "track.subscribe": "SUBSCRIBE", "track.follow": "FOLLOW", "track.completed": "COMPLETED", "track.completeSteps": "COMPLETE STEPS TO DOWNLOAD", "track.oneStepLeft": "ONE STEP LEFT", "track.confirming": "VERIFYING UNLOCK", "track.unlockUnavailable": "UNLOCK COULD NOT BE CONFIRMED", "track.unlocked": "UNLOCKED", "track.download": "DOWNLOAD MP3", "track.notFound": "This release is not available.",
            "label.format": "FORMAT", "label.bitrate": "BITRATE", "label.size": "FILE SIZE", "label.date": "UPLOAD DATE", "label.duration": "DURATION", "label.views": "YOUTUBE VIEWS", "label.downloads": "DOWNLOADS", "label.lastDownload": "LAST DOWNLOAD", "label.youtube": "YOUTUBE", "label.instagram": "INSTAGRAM"
        },
        pl: {
            "nav.music": "MUZYKA", "nav.videos": "WIDEO", "nav.download": "DOWNLOAD", "nav.about": "O MNIE", "nav.contact": "KONTAKT",
            "catalog.kicker": "ARCHIWUM PUMPSOUND", "catalog.title": "POBIERANIE", "catalog.lede": "Pełny katalog PUMPSOUND. Nowe premiery YouTube pojawiają się tu automatycznie.", "catalog.searchLabel": "Szukaj utworów", "catalog.searchPlaceholder": "SZUKAJ UTWORÓW", "catalog.available": "PREMIERY YOUTUBE", "catalog.empty": "Brak utworów pasujących do wyszukiwania.", "catalog.error": "Nie udało się wczytać katalogu.",
            "track.back": "← WSZYSTKIE PLIKI", "track.free": "DARMOWE POBRANIE", "track.comingSoon": "WKRÓTCE", "track.notAvailable": "POBIERANIE JESZCZE NIEDOSTĘPNE", "track.gate": "ODBLOKUJ POBIERANIE", "track.stepYoutube": "Zasubskrybuj na YouTube", "track.stepInstagram": "Obserwuj @pumpsound_ na Instagramie", "track.subscribe": "ZASUBSKRYBUJ", "track.follow": "OBSERWUJ", "track.completed": "WYKONANO", "track.completeSteps": "WYKONAJ KROKI, ABY POBRAĆ", "track.oneStepLeft": "ZOSTAŁ JEDEN KROK", "track.confirming": "WERYFIKOWANIE ODBLOKOWANIA", "track.unlockUnavailable": "NIE MOŻNA POTWIERDZIĆ ODBLOKOWANIA", "track.unlocked": "ODBLOKOWANE", "track.download": "POBIERZ MP3", "track.notFound": "Ten utwór nie jest dostępny.",
            "label.format": "FORMAT", "label.bitrate": "BITRATE", "label.size": "ROZMIAR PLIKU", "label.date": "DATA UPLOADU", "label.duration": "DŁUGOŚĆ", "label.views": "WYŚWIETLENIA YOUTUBE", "label.downloads": "POBRANIA", "label.lastDownload": "OSTATNIE POBRANIE", "label.youtube": "YOUTUBE", "label.instagram": "INSTAGRAM"
        }
    };

    let language = document.documentElement.lang === "pl" ? "pl" : "en";
    let catalogue = [];
    const t = (key) => copy[language][key] || key;
    const present = (value) => value || "—";
    const formatViews = (value) => Number.isFinite(Number(value)) ? new Intl.NumberFormat(language === "pl" ? "pl-PL" : "en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value)) : "—";
    const formatDate = (value) => value ? new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value)) : "—";

    function slugify(title, videoId) {
        const base = String(title || "release").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return base || `release-${videoId}`;
    }

    function assignSlugs(videos, downloadsByVideoId) {
        const manualSlugs = new Set([...downloadsByVideoId.values()].map((download) => download.slug).filter(Boolean));
        const usedSlugs = new Set();
        return videos.map((video) => {
            const download = downloadsByVideoId.get(video.id) || {};
            let slug = download.slug || slugify(video.title, video.id);
            if (!download.slug && (manualSlugs.has(slug) || usedSlugs.has(slug))) slug = `${slug}-${video.id.toLowerCase()}`;
            usedSlugs.add(slug);
            return { video, download, slug };
        });
    }

    function applyLanguage() {
        document.documentElement.lang = language;
        document.querySelectorAll("[data-download-i18n]").forEach((element) => { element.textContent = t(element.dataset.downloadI18n); });
        document.querySelectorAll("[data-download-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.downloadPlaceholder); });
        document.querySelectorAll(".language-button").forEach((button) => button.classList.toggle("active", button.dataset.language === language));
    }

    function setupLanguage() {
        document.querySelectorAll(".language-button").forEach((button) => button.addEventListener("click", () => {
            language = button.dataset.language;
            try { localStorage.setItem("pumpsound-language", language); } catch { /* language still applies */ }
            applyLanguage(); renderCurrentPage();
        }));
    }

    async function getCatalogue() {
        const [youtubeResponse, configResponse] = await Promise.all([fetch("/api/youtube-catalog"), fetch("/data/downloads.json", { cache: "no-cache" })]);
        if (!youtubeResponse.ok || !configResponse.ok) throw new Error("Could not load downloads catalogue");
        const [youtube, config] = await Promise.all([youtubeResponse.json(), configResponse.json()]);
        const downloadsByVideoId = new Map((Array.isArray(config.downloads) ? config.downloads : []).map((item) => [item.youtubeVideoId, item]));
        const tracks = assignSlugs(Array.isArray(youtube.videos) ? youtube.videos : [], downloadsByVideoId).map(({ video, download, slug }) => ({
            id: video.id, slug, title: video.title || "PUMPSOUND RELEASE", artist: "PUMPSOUND", thumbnail: video.thumbnail || "", uploadDate: video.publishedAt || "", views: video.viewCount, youtubeUrl: video.url || `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`, displayArtist: download.displayArtist || null, displayTitle: download.displayTitle || null, displayVersion: download.displayVersion || null, fileKey: download.fileKey || null, format: download.format || null, bitrate: download.bitrate || null, fileSize: download.fileSize || null, duration: download.duration || video.duration || null
        }));
        const availabilityResponse = await fetch("/api/download-availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tracks: tracks.map((track) => ({ youtubeVideoId: track.id, youtubeTitle: track.title })) })
        });
        if (!availabilityResponse.ok) throw new Error("Could not check download availability");
        const availabilityData = await availabilityResponse.json();
        return tracks.map((track) => ({ ...track, downloadAvailable: availabilityData.availability?.[track.id]?.available === true }))
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    function thumbnail(track) { return track.thumbnail ? `<img src="${track.thumbnail}" alt="" loading="lazy">` : `<span class="download-thumbnail-fallback" aria-hidden="true">P</span>`; }
    async function getUnlockStatus() {
        try {
            const response = await fetch("/api/download-unlock-status", { cache: "no-store" });
            return response.ok && (await response.json()).unlocked === true;
        } catch { return false; }
    }
    function specs(track, includeYoutube) {
        const items = [["label.format", present(track.format)], ["label.bitrate", present(track.bitrate)], ["label.size", present(track.fileSize)], ["label.date", formatDate(track.uploadDate)]];
        if (includeYoutube) items.push(["label.views", formatViews(track.views)]);
        return items.map(([label, value]) => `<div class="download-meta"><span>${t(label)}</span><strong>${value}</strong></div>`).join("");
    }

    function renderCatalogue() {
        const list = document.querySelector("#download-list"), count = document.querySelector("#download-count"), empty = document.querySelector("#download-empty"), search = document.querySelector("#download-search");
        if (!list || !count || !empty || !search) return;
        const render = () => {
            const query = search.value.trim().toLowerCase();
            const filtered = catalogue.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query));
            count.textContent = String(filtered.length).padStart(2, "0");
            list.innerHTML = filtered.map((track, index) => `<a class="download-card" href="/d/${encodeURIComponent(track.slug)}"><span class="download-card-index">${String(index + 1).padStart(2, "0")}</span><div class="download-card-thumbnail">${thumbnail(track)}</div><div class="download-card-title"><h2>${track.title}</h2><p>${track.artist}</p></div><div class="download-card-meta">${specs(track, true)}</div><span class="download-card-cta">${track.downloadAvailable ? t("track.free") : t("track.comingSoon")} <i aria-hidden="true">↗</i></span></a>`).join("");
            empty.hidden = filtered.length !== 0;
        };
        search.oninput = render; render();
    }

    function renderTrack(hasGlobalUnlock = false) {
        const root = document.querySelector("#download-track"); if (!root) return;
        const slug = new URLSearchParams(window.location.search).get("slug") || window.location.pathname.split("/").filter(Boolean).pop();
        const track = catalogue.find((item) => item.slug === slug);
        if (!track) { root.innerHTML = `<p class="download-error">${t("track.notFound")}</p>`; return; }
        document.title = `${track.title} — Download — PUMPSOUND`;
        const releaseArtist = track.displayArtist || track.artist;
        const releaseTitle = track.displayTitle || track.title;
        const releaseVersion = track.displayVersion || "";
        const downloadUrl = `/api/download?videoId=${encodeURIComponent(track.id)}&title=${encodeURIComponent(track.title)}`;
        const gate = track.downloadAvailable ? `<section class="download-gate" data-gate-state="locked"><p class="download-gate-label">${t("track.gate")}</p><div class="download-gate-steps"><button type="button" class="download-gate-step" data-gate-step="youtube"><span>01</span><p>${t("track.stepYoutube")}</p><em>${t("track.subscribe")}</em></button><button type="button" class="download-gate-step" data-gate-step="instagram"><span>02</span><p>${t("track.stepInstagram")}</p><em>${t("track.follow")}</em></button></div><button type="button" class="download-gate-download" data-download-url="${downloadUrl}" disabled aria-disabled="true"><span data-gate-download-label>🔒 ${t("track.completeSteps")}</span><i aria-hidden="true">↗</i></button></section>` : `<section class="download-unavailable"><p>${t("track.notAvailable")}</p><span>${t("track.comingSoon")}</span></section>`;
        root.innerHTML = `<div class="download-detail-layout"><section class="download-detail-left"><div class="download-track-thumbnail">${thumbnail(track)}</div><div class="download-specs">${specs(track, true)}<div class="download-meta"><span>${t("label.duration")}</span><strong>${present(track.duration)}</strong></div></div><div class="download-public-stats"><div><span>${t("label.downloads")}</span><strong>—</strong></div><div><span>${t("label.lastDownload")}</span><strong>—</strong></div></div></section><section class="download-detail-right"><div class="download-release-head"><p class="download-release-artist">${releaseArtist}</p><h1>${releaseTitle}</h1>${releaseVersion ? `<p class="download-release-version">${releaseVersion}</p>` : ""}</div>${gate}</section></div>`;
        if (track.downloadAvailable) setupDownloadGate(root, hasGlobalUnlock);
    }

    function setupDownloadGate(root, hasGlobalUnlock) {
        const gate = root.querySelector(".download-gate");
        const steps = [...root.querySelectorAll("[data-gate-step]")];
        const downloadButton = root.querySelector(".download-gate-download");
        const label = root.querySelector("[data-gate-download-label]");
        const completed = new Set(hasGlobalUnlock ? ["youtube", "instagram"] : []);
        let confirmedUnlock = hasGlobalUnlock;
        let confirmingUnlock = false;
        let unlockError = false;

        function updateGate() {
            const completedCount = completed.size;
            const state = confirmedUnlock ? "unlocked" : completedCount > 0 ? "partial" : "locked";
            gate.dataset.gateState = state;
            steps.forEach((step) => {
                const isComplete = completed.has(step.dataset.gateStep);
                step.classList.toggle("is-complete", isComplete);
                step.querySelector("em").textContent = isComplete ? t("track.completed") : step.dataset.gateStep === "youtube" ? t("track.subscribe") : t("track.follow");
            });
            downloadButton.disabled = !confirmedUnlock;
            downloadButton.setAttribute("aria-disabled", String(state !== "unlocked"));
            label.textContent = confirmedUnlock ? `↓ ${t("track.download")}` : confirmingUnlock ? `🔒 ${t("track.confirming")}` : unlockError ? `🔒 ${t("track.unlockUnavailable")}` : state === "partial" ? `🔒 ${t("track.oneStepLeft")}` : `🔒 ${t("track.completeSteps")}`;
        }

        steps.forEach((step) => step.addEventListener("click", async () => {
            if (confirmedUnlock || confirmingUnlock) return;
            completed.add(step.dataset.gateStep);
            unlockError = false;
            updateGate();
            if (completed.size !== 2) return;

            confirmingUnlock = true;
            updateGate();
            try {
                const response = await fetch("/api/download-dev-unlock", { method: "POST", credentials: "same-origin" });
                if (!response.ok || !(await getUnlockStatus())) throw new Error("Unlock not confirmed");
                confirmedUnlock = true;
            } catch {
                unlockError = true;
            } finally {
                confirmingUnlock = false;
                updateGate();
            }
        }));
        downloadButton.addEventListener("click", () => {
            if (!downloadButton.disabled) window.location.assign(downloadButton.dataset.downloadUrl);
        });
        updateGate();
    }

    async function renderCurrentPage() {
        try { catalogue = await getCatalogue(); if (document.body.dataset.downloadPage === "catalog") renderCatalogue(); if (document.body.dataset.downloadPage === "track") renderTrack(await getUnlockStatus()); }
        catch (error) { const target = document.querySelector("#download-list, #download-track"); if (target) target.innerHTML = `<p class="download-error">${t(document.body.dataset.downloadPage === "catalog" ? "catalog.error" : "track.notFound")}</p>`; console.error("Download catalogue error:", error); }
    }

    applyLanguage(); setupLanguage(); renderCurrentPage();
})();
