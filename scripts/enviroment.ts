import { FacebookLocation, ILalsEnvs } from "./interface";

export const LALS_EXTENSION_ENV_CONSTANTS: ILalsEnvs = {
    API_BASE_URL: "https://zbserver.tail7f9ce.ts.net/lals",
    LALS_LOGO_URL: chrome.runtime.getURL("lals-logo.jpg"),
    POSITION_TRANS_MAP: {
        middle_blocker: "Środkowy",
        outside_hitter: "Przyjmujący",
        opposite_hitter: "Atakujący",
        setter: "Rozgrywający",
        libero: "Libero",
        coach: "Trener",
    },
    CACHE_NAME: "LALS_EXTENSION_CACHE",
    CHROME_STORAGE_SETTINGS_KEY: "LALS-extension-config",
    DEFAULT_SETTINGS: {
        facebookPopupIsOn: true,
        facebookLocation: FacebookLocation.GROUP,
        facebookGroupUrls: ["https://www.facebook.com/groups/589759677744412"],
    },
};
