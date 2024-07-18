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
    INFO_GROUP_IDS: number[];
    LALS_LOGO_URL: string;
    POSITION_TRANS_MAP: { [key in string]: string };
    CACHE_NAME: string;
}
