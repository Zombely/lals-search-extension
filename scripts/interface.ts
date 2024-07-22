export interface IPlayer {
    id: number;
    full_name: string;
    position: string;
    image: string;
    team: {
        id: number;
        name: string;
        logo: string;
        league: {
            id: number;
            name: string;
        };
    };
}

export interface ILalsEnvs {
    API_BASE_URL: string;
    LALS_LOGO_URL: string;
    POSITION_TRANS_MAP: { [key in string]: string };
    CACHE_NAME: string;
    CHROME_STORAGE_SETTINGS_KEY: string;
    DEFAULT_SETTINGS: IConfig;
}

export enum FacebookLocation {
    APP = "app",
    GROUP = "groups",
}

export interface IConfig {
    facebookPopupIsOn: boolean;
    facebookLocation: FacebookLocation;
    facebookGroupUrls: string[];
}
