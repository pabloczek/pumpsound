async function loadYouTubeStats() {
    try {
        const response = await fetch("/api/youtube");

        if (!response.ok) {
            throw new Error("Could not load YouTube statistics");
        }

        const data = await response.json();

        const viewsElement = document.querySelector("#youtube-views");
        const subscribersElement = document.querySelector("#youtube-subscribers");

        if (viewsElement) {
            viewsElement.textContent = formatViews(data.views);
        }

        if (subscribersElement) {
            subscribersElement.textContent = formatSubscribers(data.subscribers);
        }

    } catch (error) {
        console.error("YouTube stats error:", error);
    }
}

function formatViews(views) {
    if (views >= 1000000000) {
        return (views / 1000000000).toFixed(1).replace(".0", "") + "B+";
    }

    if (views >= 1000000) {
        return (views / 1000000).toFixed(1).replace(".0", "") + "M+";
    }

    if (views >= 1000) {
        return (views / 1000).toFixed(1).replace(".0", "") + "K+";
    }

    return views.toLocaleString("en-US");
}

function formatSubscribers(subscribers) {
    if (subscribers >= 1000000) {
        return (subscribers / 1000000).toFixed(1).replace(".0", "") + "M+";
    }

    if (subscribers >= 1000) {
        return Math.floor(subscribers / 1000) + "K+";
    }

    return subscribers.toLocaleString("en-US");
}

loadYouTubeStats();