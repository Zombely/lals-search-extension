import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";
import { IConfig, IPlayer } from "./interface";

let currentSettings: IConfig;

function isFacebookDarkMode(): boolean {
    // i need this to check what type of background should be used in popup
    // somehow this works
    const backgroundColor = window.getComputedStyle(
        document.body
    ).backgroundColor;
    const darkModeActive =
        backgroundColor === "rgb(24, 25, 26)" || backgroundColor === "#18191a";
    return darkModeActive;
}

function createLalsInfoElement(
    fbProfileNode: HTMLElement,
    lalsPlayerData: IPlayer | null
): void {
    const infoDivElement: HTMLDivElement = document.createElement("div");
    infoDivElement.className =
        "lals-info-container" + (isFacebookDarkMode() ? " dark-mode" : "");
    if (lalsPlayerData !== null) {
        infoDivElement.innerHTML = `
            <div class="fb-lals-inner-wrapper">
                <a class="fb-lals-logo-wrapper" href="https://www.facebook.com/LubonskaAmatorskaLigaSiatkowki">
                    <img class="fb-lals-logo" src="${
                        LALS_EXTENSION_ENV_CONSTANTS.LALS_LOGO_URL
                    }">
                </a>
                <div class="fb-lals-data-container">
                    <div class="fb-lals-team-data">
                        <span>Drużyna:</span> <img class="fb-lals-team-logo" src="${
                            lalsPlayerData.team.logo
                        }"><strong>${lalsPlayerData.team.name}</strong>
                    </div>
                    <div>
                        Liga: <strong>${
                            lalsPlayerData.team.league.name
                        }</strong>
                    </div>
                    <div>
                        Pozycja: <strong>${
                            LALS_EXTENSION_ENV_CONSTANTS.POSITION_TRANS_MAP[
                                lalsPlayerData.position
                            ]
                        }</strong>
                    </div>
                </div>
            </div>
        `;
    } else {
        infoDivElement.innerHTML = `
            <div class="fb-lals-inner-wrapper">
                <a class="fb-lals-logo-wrapper" href="https://www.facebook.com/LubonskaAmatorskaLigaSiatkowki">
                    <img class="fb-lals-logo" src="${LALS_EXTENSION_ENV_CONSTANTS.LALS_LOGO_URL}">
                </a>
                <div class="fb-lals-data-container fb-lals-no-data">
                    <div>
                        Brak danych
                    </div>
                </div>
            </div>
        `;
    }
    fbProfileNode.appendChild(infoDivElement);
}

async function fetchPlayerData(playerName: string): Promise<IPlayer | null> {
    try {
        const response = await fetch(
            `${LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL}/player/${playerName}`
        );
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error: Error | unknown) {
        console.error("Fetch error:", error);
        return null;
    }
}

function listenForProfileHover(node: HTMLElement): void {
    // react only to hover on facebook user profile
    if (
        node.matches('div[role="dialog"]') ||
        node.querySelector('div[role="dialog"]')
    ) {
        const nameNode: HTMLElement | null = node.querySelector("h3, h2"); // need to find better way of finding name of user, maybe use fb id somehow
        if (!nameNode) return;
        fetchPlayerData(nameNode.innerText).then((data: IPlayer | null) => {
            createLalsInfoElement(node, data);
        });
    }
}

const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
        if (mutation.type !== "childList") return;
        mutation.addedNodes.forEach((node: Node) => {
            if (node.nodeType !== 1) return;

            if (
                currentSettings.facebookLocation === "groups" &&
                currentSettings.facebookGroupUrls.length > 0 &&
                !currentSettings.facebookGroupUrls.includes(
                    window.location.href
                )
            )
                return;

            listenForProfileHover(node as HTMLElement);
        });
    }
});

// listen for changes in settings
chrome.runtime.onMessage.addListener((message) => {
    if (
        !message.hasOwnProperty("action") &&
        message.action !== "config_updated"
    )
        return;
    chrome.storage.local.get(
        [LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY],
        (result) => {
            currentSettings =
                result[
                    LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY
                ] || LALS_EXTENSION_ENV_CONSTANTS.DEFAULT_SETTINGS;
            if (currentSettings.facebookPopupIsOn) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            } else {
                observer.disconnect();
            }
        }
    );
});

// start observing when config is available
chrome.storage.local.get(
    [LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY],
    (result) => {
        currentSettings =
            result[LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY] ||
            LALS_EXTENSION_ENV_CONSTANTS.DEFAULT_SETTINGS;
        if (currentSettings.facebookPopupIsOn) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
    }
);

window.addEventListener("beforeunload", () => observer.disconnect()); // cleanup
