var currentPage = 1;

function initInput() {
    const input = document.getElementById("lals-search-input");
    if (!input) throw new Error(`Input lals-search-input not found`);
    input.addEventListener("input", (event) => {
        if (event.target.value.length < 3) return;
        getApiPLayers(event.target.value);
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") getApiPLayers(event.target.value);
    });
}

function getApiPLayers(playerName, page = 1) {
    const baseUrl = `${LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL}/players`;
    const params = new URLSearchParams({ page: page.toString() });

    if (playerName) params.append("full_name", playerName);

    const url = `${baseUrl}?${params.toString()}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            currentPage = page;
            populatePlayers(data);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

function createPlayerElement(player) {
    const element = document.createElement("div");
    element.className = "lals-user-container";
    element.innerHTML = `
        <a class="lals-user-avatar" href="${player.image}" target="_blank">
            <img src="${player.image}" alt="${player.full_name}">
        </a>
        <div class="lals-user-data">
            <div class="lals-data-row">
                <span class="lals-data-player-name">${player.full_name}</span>
            </div>
            <div class="lals-data-row">
                <span class="lals-data-label">Drużyna:</span> <img class="lals-team-logo" src="${
                    player.team.logo
                }"> <span>${player.team.name}</span>
            </div>
            <div class="lals-data-row">
                <span class="lals-data-label">Liga:</span><span>${
                    player.team.league.name
                }</span>
            </div>
            <div class="lals-data-row">
                <span class="lals-data-label">Pozycja:</span>
                <span>${
                    LALS_EXTENSION_ENV_CONSTANTS.POSITION_TRANS_MAP[
                        player.position
                    ]
                }</span>
            </div>
        </div>
    `;

    const img = element.querySelector("a.lals-user-avatar > img");
    img.addEventListener("error", function () {
        this.src =
            "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
    });
    return element;
}

function populatePlayers(playersData) {
    const container = document.getElementById("player-results-container");
    if (!container) throw new Error(`Container lals-users-container not found`);

    container.innerHTML = "";
    playersData.forEach((player) => {
        const element = createPlayerElement(player);
        container.appendChild(element);
    });
}

function handleNextPage() {
    const nextButton = document.getElementById("lals-next-page");
    if (!nextButton) throw new Error(`Button lals-next-page not found`);
    nextButton.addEventListener("click", function () {
        getApiPLayers(
            document.getElementById("lals-search-input").value,
            currentPage + 1
        );
        let prevPageButton = document.getElementById("lals-previous-page");
        if (prevPageButton) prevPageButton.disabled = false;
    });
}

function handlePrevPage() {
    const prevButton = document.getElementById("lals-previous-page");
    if (!prevButton) throw new Error(`Button lals-previous-page not found`);
    prevButton.addEventListener("click", function () {
        if (currentPage <= 1) return;
        getApiPLayers(
            document.getElementById("lals-search-input").value,
            currentPage - 1
        );
        if (currentPage === 2) prevButton.disabled = true;
    });
}

function handleResetSearch() {
    const resetButton = document.getElementById("lals-search-reset-button");
    if (!resetButton)
        throw new Error(`Button lals-search-reset-button not found`);
    resetButton.addEventListener("click", () => {
        const input = document.getElementById("lals-search-input");
        if (!input) throw new Error(`Input lals-search-input not found`);
        input.value = "";
        getApiPLayers();
    });
}

(function () {
    initInput();
    handleNextPage();
    handlePrevPage();
    handleResetSearch();
})();

document.addEventListener("DOMContentLoaded", function () {
    getApiPLayers();
});
