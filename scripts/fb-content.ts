import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";
import { IPlayer } from "./interfaces";

function isFacebookDarkMode(): boolean {
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
    } else if (
        LALS_EXTENSION_ENV_CONSTANTS.INFO_GROUP_IDS.some((id: number) =>
            window.location.href.includes(id.toString())
        )
    ) {
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
    } else {
        return;
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
        const nameNode: HTMLElement | null = node.querySelector("h3, h2"); // need to find better way of finding name of user
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
            listenForProfileHover(node as HTMLElement);
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true }); // init
window.addEventListener("beforeunload", () => observer.disconnect()); // cleanup
