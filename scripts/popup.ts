import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";
import { IPlayer } from "./interfaces";

let currentPage: number = 1;

function initInput(): void {
    const searchInput: HTMLElement | null =
        document.getElementById("lals-search-input");
    if (!searchInput) throw new Error(`Input lals-search-input not found`);
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
    });
    return playerElement;
}

function populatePlayers(playersData: IPlayer[]): void {
    const container: HTMLElement | null = document.getElementById(
        "player-results-container"
    );
    if (!container) throw new Error(`Container lals-users-container not found`);

    container.innerHTML = "";
    playersData.forEach((player: IPlayer) => {
        const createdPlayerElement: HTMLDivElement =
            createPlayerElement(player);
        container.appendChild(createdPlayerElement);
    });
}

function handleNextPage(): void {
    const nextButton: HTMLButtonElement | null = document.getElementById(
        "lals-next-page"
    ) as HTMLButtonElement | null;
    if (!nextButton) throw new Error(`Button lals-next-page not found`);
    nextButton.addEventListener("click", function () {
        const lalsSearchInput: HTMLInputElement | null =
            document.getElementById(
                "lals-search-input"
            ) as HTMLInputElement | null;
        if (!lalsSearchInput)
            throw new Error(`Input lals-search-input not found`);
        getApiPlayers(lalsSearchInput.value ?? "", currentPage + 1);
        const prevPageButton: HTMLButtonElement | null =
            document.getElementById(
                "lals-previous-page"
            ) as HTMLButtonElement | null;
        if (prevPageButton) prevPageButton.disabled = false;
    });
}

function handlePrevPage(): void {
    const prevButton: HTMLButtonElement | null = document.getElementById(
        "lals-previous-page"
    ) as HTMLButtonElement | null;
    if (!prevButton) throw new Error(`Button lals-previous-page not found`);
    prevButton.addEventListener("click", function () {
        if (currentPage <= 1) return;
        const lalsSearchInput: HTMLInputElement | null =
            document.getElementById(
                "lals-search-input"
            ) as HTMLInputElement | null;
        if (!lalsSearchInput)
            throw new Error(`Input lals-search-input not found`);

        getApiPlayers(lalsSearchInput.value, currentPage - 1);
        if (currentPage === 2) prevButton.disabled = true;
    });
}

function handleResetSearch(): void {
    const resetButton: HTMLButtonElement | null = document.getElementById(
        "lals-search-reset-button"
    ) as HTMLButtonElement | null;
    if (!resetButton)
        throw new Error(`Button lals-search-reset-button not found`);
    resetButton.addEventListener("click", () => {
        const input: HTMLInputElement | null = document.getElementById(
            "lals-search-input"
        ) as HTMLInputElement | null;
        if (!input) throw new Error(`Input lals-search-input not found`);
        input.value = "";
        getApiPlayers();
    });
}

(function () {
    initInput();
    handleNextPage();
    handlePrevPage();
    handleResetSearch();
})();

document.addEventListener("DOMContentLoaded", function () {
    getApiPlayers();
});
