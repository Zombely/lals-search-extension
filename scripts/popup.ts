import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";
import { IPlayer } from "./interface";
import { _getElementOfTypeById, _handleSettingsToggle } from "./shared";

let currentPage: number = 1;

function getApiPlayers(
    inputData: string | null = null,
    page: number = 1
): void {
    const baseUrl: string = `${LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL}/players`;
    const params: URLSearchParams = new URLSearchParams({
        page: page.toString(),
    });

    if (inputData !== null) params.append("search", inputData);

    const url: string = `${baseUrl}?${params.toString()}`;

    fetch(url)
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((playersData: IPlayer[]) => {
            currentPage = page;

            // handle pagination buttons
            const prevPageButton: HTMLButtonElement =
                _getElementOfTypeById<HTMLButtonElement>("lals-previous-page");
            prevPageButton.disabled = page === 1;

            const nextPageButton: HTMLButtonElement =
                _getElementOfTypeById<HTMLButtonElement>("lals-next-page");

            nextPageButton.disabled =
                playersData.length === 0 || playersData.length < 5;

            populatePlayers(playersData);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

function createPlayerElement(player: IPlayer): HTMLDivElement {
    const playerElement: HTMLDivElement = document.createElement("div");
    playerElement.className = "lals-user-container";
    playerElement.innerHTML = `
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

    const userImgElement: HTMLImageElement | null = playerElement.querySelector(
        "a.lals-user-avatar > img"
    );
    if (!userImgElement)
        throw new Error(`Image not found in player element template`);
    userImgElement.addEventListener("error", () => {
        userImgElement.src =
            "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
        userImgElement.alt = "Default avatar";
        userImgElement.style.objectFit = "contain";
    });
    return playerElement;
}

function populatePlayers(playersData: IPlayer[]): void {
    const container: HTMLDivElement = _getElementOfTypeById<HTMLDivElement>(
        "player-results-container"
    );
    container.innerHTML = "";
    if (playersData.length === 0) {
        const messageElement: HTMLDivElement = document.createElement("div");
        messageElement.textContent = "Brak wyników :(";
        messageElement.className = "lals-no-results";
        container.appendChild(messageElement);
    } else {
        playersData.forEach((player: IPlayer) => {
            const createdPlayerElement: HTMLDivElement =
                createPlayerElement(player);
            container.appendChild(createdPlayerElement);
        });
    }
}

function handleSearchInput(): void {
    const searchInput: HTMLInputElement =
        _getElementOfTypeById<HTMLInputElement>("lals-search-input");
    searchInput.addEventListener("input", (event: Event) => {
        if (event.target === null) return;
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value.length < 3) return;
        getApiPlayers(inputElement.value);
    });
    searchInput.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key !== "Enter" || event.target === null) return;
        const inputElement = event.target as HTMLInputElement;
        getApiPlayers(inputElement.value);
    });
}

function handleNextPage(): void {
    const nextButton: HTMLButtonElement =
        _getElementOfTypeById<HTMLButtonElement>("lals-next-page");
    nextButton.addEventListener("click", function () {
        const lalsSearchInput: HTMLInputElement =
            _getElementOfTypeById<HTMLInputElement>("lals-search-input");
        getApiPlayers(lalsSearchInput.value ?? "", currentPage + 1);
    });
}

function handlePrevPage(): void {
    const prevButton: HTMLButtonElement =
        _getElementOfTypeById<HTMLButtonElement>("lals-previous-page");
    prevButton.addEventListener("click", function () {
        if (currentPage <= 1) return;
        const lalsSearchInput: HTMLInputElement =
            _getElementOfTypeById<HTMLInputElement>("lals-search-input");

        getApiPlayers(lalsSearchInput.value, currentPage - 1);
    });
}

function handleResetSearch(): void {
    const resetButton: HTMLButtonElement =
        _getElementOfTypeById<HTMLButtonElement>("lals-search-reset-button");
    resetButton.addEventListener("click", () => {
        const lalsSearchInput: HTMLInputElement =
            _getElementOfTypeById<HTMLInputElement>("lals-search-input");
        lalsSearchInput.value = "";
        getApiPlayers();
    });
}

(function () {
    // setup event listeners
    handleSearchInput();
    handleNextPage();
    handlePrevPage();
    handleResetSearch();
    _handleSettingsToggle("settings-icon-id");
    //
})();

document.addEventListener("DOMContentLoaded", function () {
    getApiPlayers();

    // set up lals logo
    let lalsLogoImg: HTMLImageElement = _getElementOfTypeById<HTMLImageElement>(
        "lals-logo-dashboard-id"
    );
    lalsLogoImg.src = LALS_EXTENSION_ENV_CONSTANTS.LALS_LOGO_URL;
});
