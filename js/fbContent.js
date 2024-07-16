const API_URL = "https://zbserver.tail7f9ce.ts.net/lals";
const INFO_GROUP_IDS = [589759677744412, 1453034095575643]; // ids of groups that should display info about LALS even if not found, else only shows info if found player

const poistionTransMap = {
    middle_blocker: "Środkowy",
    outside_hitter: "Przyjmujący",
    opposite_hitter: "Atakujący",
    setter: "Rozgrywający",
    libero: "Libero",
    coach: "Trener",
};

function createLalsInfoElement(node, lalsData) {
    element = document.createElement("div");
    element.className = "lals-info-container";
    if (lalsData !== null) {
        element.innerHTML = `
            <div class="fb-lals-inner-wrapper">
                <a class="fb-lals-logo-wrapper" href="https://www.facebook.com/LubonskaAmatorskaLigaSiatkowki">
                    <img class="fb-lals-logo" src="${chrome.runtime.getURL(
                        "images/lals-logo.jpg"
                    )}">
                </a>
                <div class="fb-lals-data-container">
                    <div>
                        Drużyna: <strong>${lalsData.team_name}</strong>
                    </div>
                    <div>
                        Liga: <strong>${lalsData.league.name}</strong>
                    </div>
                    <div>
                        Pozycja: <strong>${
                            poistionTransMap[lalsData.position]
                        }</strong>
                    </div>
                </div>
            </div>
        `;
    } else if (
        INFO_GROUP_IDS.some((id) =>
            window.location.href.includes(id.toString())
        )
    ) {
        element.innerHTML = `
            <div class="fb-lals-inner-wrapper">
                <a class="fb-lals-logo-wrapper" href="https://www.facebook.com/LubonskaAmatorskaLigaSiatkowki">
                    <img class="fb-lals-logo" src="${chrome.runtime.getURL(
                        "images/lals-logo.jpg"
                    )}">
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
        const response = await fetch(`${API_URL}/${playerName}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type !== "childList") return;
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;

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
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true }); // init
window.addEventListener("beforeunload", () => observer.disconnect()); // cleanup
