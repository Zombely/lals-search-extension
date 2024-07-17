function createLalsInfoElement(node, lalsPlayerData) {
    element = document.createElement("div");
    element.className = "lals-info-container";
    if (lalsPlayerData !== null) {
        element.innerHTML = `
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
        LALS_EXTENSION_ENV_CONSTANTS.INFO_GROUP_IDS.some((id) =>
            window.location.href.includes(id.toString())
        )
    ) {
        element.innerHTML = `
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
    node.appendChild(element);
}

async function fetchPlayerData(playerName) {
    try {
        const response = await fetch(
            `${LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL}/player/${playerName}`
        );
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function listenForProfileHover(node) {
    // react only to hover on facebook user profile
    if (
        node.matches('div[role="dialog"]') ||
        node.querySelector('div[role="dialog"]')
    ) {
        const nameNode = node.querySelector("h3, h2"); // need to find better way of finding name of user
        if (!nameNode) return;
        fetchPlayerData(nameNode.innerText).then((data) => {
            createLalsInfoElement(node, data);
        });
    }
}

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type !== "childList") return;
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            listenForProfileHover(node);
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true }); // init
window.addEventListener("beforeunload", () => observer.disconnect()); // cleanup
