import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";
import { IConfig, FacebookLocation } from "./interface";
import { _getElementOfTypeById, _handleSettingsToggle } from "./shared";

// default config
let currentConfig: IConfig = LALS_EXTENSION_ENV_CONSTANTS.DEFAULT_SETTINGS;
let currentGroupId: number = 0;

function initVersionInfo(): void {
    const manifest: chrome.runtime.Manifest = chrome.runtime.getManifest();
    const versionInfo: HTMLSpanElement =
        _getElementOfTypeById<HTMLSpanElement>("app-version");
    versionInfo.innerText = `${manifest.version}`;

    const contactInfo: HTMLAnchorElement =
        _getElementOfTypeById<HTMLAnchorElement>("app-contact");
    contactInfo.innerText = `${manifest.author}`;
    contactInfo.setAttribute("href", `mailto:${manifest.author_email}`);
}

function initSettings(): void {
    // fetch settings from storage
    chrome.storage.local.get(
        [LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY],
        (result: { [key: string]: string }) => {
            const settings: string | undefined =
                result[
                    LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY
                ];
            if (settings !== undefined) {
                currentConfig = settings as unknown as IConfig;
            }
            saveConfig();

            // handle interface
            const fbSwitch: HTMLInputElement =
                _getElementOfTypeById<HTMLInputElement>("facebook-info-switch");
            fbSwitch.checked = currentConfig.facebookPopupIsOn;

            const visibilitySelect: HTMLSelectElement =
                _getElementOfTypeById<HTMLSelectElement>(
                    "facebook-info-location"
                );
            visibilitySelect.disabled = !fbSwitch.checked;
            visibilitySelect.value = currentConfig.facebookLocation;

            const groupContainer: HTMLDivElement =
                _getElementOfTypeById<HTMLDivElement>(
                    "settings-groups-inputs-container-id"
                );

            const urls: string[] =
                currentConfig.facebookGroupUrls.length > 0
                    ? currentConfig.facebookGroupUrls
                    : [""];
            do {
                groupContainer.appendChild(
                    buildGroupInput(currentGroupId, urls[currentGroupId] || "")
                );
                currentGroupId++;
            } while (currentGroupId < urls.length);
        }
    );
}

function buildGroupInput(index: number, value: string = ""): HTMLDivElement {
    const inputWrapper: HTMLDivElement = document.createElement("div");
    inputWrapper.className = "group-input-wrapper";
    inputWrapper.id = `group-url-${index}`;
    const input: HTMLInputElement = document.createElement("input");
    input.type = "text";
    input.id = `group-url-${index}`;
    input.name = `group-url-${index}`;
    input.value = value;

    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.innerText = "close";
    deleteIcon.onclick = () => removeGroupInput(inputWrapper.id);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(deleteIcon);
    return inputWrapper;
}

function removeGroupInput(id: string): void {
    const groupContainer: HTMLDivElement =
        _getElementOfTypeById<HTMLDivElement>(id);
    if (groupContainer === null) return;
    const inputsContainer: HTMLDivElement =
        _getElementOfTypeById<HTMLDivElement>(
            "settings-groups-inputs-container-id"
        );
    if (inputsContainer.querySelectorAll("input").length === 1) {
        const input: HTMLInputElement = groupContainer.querySelector(
            "input"
        ) as HTMLInputElement;
        input.value = "";
    } else {
        groupContainer.remove();
    }
}

function sendSingalToContentScriptsConfig(): void {
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs: chrome.tabs.Tab[]) {
            if (tabs.length === 0) return;

            const manifest = chrome.runtime.getManifest();
            if (manifest.content_scripts === undefined)
                throw new Error(
                    "No content scripts in manifest to send config"
                );

            const contentScriptLinks: Array<string> =
                manifest.content_scripts.flatMap((script: any) => {
                    if (!script.hasOwnProperty("full_url_matches"))
                        throw new Error(
                            "No full_url_matches property in content script, add it to send config to content scripts"
                        );
                    return script.full_url_matches;
                });
            const tab: chrome.tabs.Tab | undefined = tabs.find((currentTab) =>
                contentScriptLinks.some((partialUrl) =>
                    currentTab.url?.includes(partialUrl)
                )
            );
            if (tab === undefined || tab.id === undefined) return;
            chrome.tabs.sendMessage(tab.id, { action: "config_updated" });
        }
    );
}

function saveConfig(): void {
    // store changes
    chrome.storage.local.set({
        [LALS_EXTENSION_ENV_CONSTANTS.CHROME_STORAGE_SETTINGS_KEY]:
            currentConfig,
    });

    // send info to update content scripts
    sendSingalToContentScriptsConfig();
}

function handleFacebookSwitch(): void {
    const fbSwitch: HTMLInputElement = _getElementOfTypeById<HTMLInputElement>(
        "facebook-info-switch"
    );
    fbSwitch.addEventListener("change", () => {
        // interface changes
        const visibilitySelect: HTMLSelectElement =
            _getElementOfTypeById<HTMLSelectElement>("facebook-info-location");
        visibilitySelect.disabled = !fbSwitch.checked;

        const groupContainer: HTMLDivElement =
            _getElementOfTypeById<HTMLDivElement>(
                "settings-groups-container-id"
            );
        groupContainer
            .querySelectorAll("input")
            .forEach(
                (input: HTMLInputElement) =>
                    (input.disabled = !fbSwitch.checked)
            );

        const groupAddButton: HTMLButtonElement =
            _getElementOfTypeById<HTMLButtonElement>("add-group-button");
        groupAddButton.disabled = !fbSwitch.checked;
    });
}

function handleFacebookVisibilitySelect(): void {
    const visibilitySelect: HTMLSelectElement =
        _getElementOfTypeById<HTMLSelectElement>("facebook-info-location");

    visibilitySelect.addEventListener("change", (event: Event) => {
        if (event.target === null) return;
        const eventSelect = event.target as HTMLSelectElement;

        //interface changes
        const groupContainer: HTMLDivElement =
            _getElementOfTypeById<HTMLDivElement>(
                "settings-groups-container-id"
            );
        groupContainer
            .querySelectorAll("input")
            .forEach(
                (input: HTMLInputElement) =>
                    (input.disabled = eventSelect.value !== "groups")
            );

        const groupAddButton: HTMLButtonElement =
            _getElementOfTypeById<HTMLButtonElement>("add-group-button");
        groupAddButton.disabled = eventSelect.value !== "groups";
    });
}

function handleSettingsSubmit(): void {
    const form: HTMLFormElement =
        _getElementOfTypeById<HTMLFormElement>("settings-form");
    form.addEventListener("submit", (event: Event) => {
        event.preventDefault();

        const groupContainer: HTMLDivElement =
            _getElementOfTypeById<HTMLDivElement>(
                "settings-groups-inputs-container-id"
            );
        const urls: string[] = Array.from(
            groupContainer.querySelectorAll("input")
        ).map((input: HTMLInputElement) => input.value);
        currentConfig.facebookGroupUrls = urls;

        const fbSwitch: HTMLInputElement =
            _getElementOfTypeById<HTMLInputElement>("facebook-info-switch");
        currentConfig.facebookPopupIsOn = fbSwitch.checked;

        const visibilitySelect: HTMLSelectElement =
            _getElementOfTypeById<HTMLSelectElement>("facebook-info-location");
        currentConfig.facebookLocation =
            visibilitySelect.value as FacebookLocation;
        saveConfig();
    });
}

function handleGroupAdd(): void {
    const addGroupButton: HTMLButtonElement =
        _getElementOfTypeById<HTMLButtonElement>("add-group-button");
    addGroupButton.addEventListener("click", () => {
        const groupContainer: HTMLDivElement =
            _getElementOfTypeById<HTMLDivElement>(
                "settings-groups-inputs-container-id"
            );
        groupContainer.appendChild(buildGroupInput(currentGroupId));
        currentGroupId++;
    });
}

(function () {
    initVersionInfo();
    initSettings();

    // setup event listeners
    _handleSettingsToggle("settings-go-back-button-id");
    handleFacebookSwitch();
    handleFacebookVisibilitySelect();
    handleSettingsSubmit();
    handleGroupAdd();
    //
})();
