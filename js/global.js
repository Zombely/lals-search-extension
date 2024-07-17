const LALS_EXTENSION_ENV_CONSTANTS = {
    API_BASE_URL: "https://zbserver.tail7f9ce.ts.net/lals",
    INFO_GROUP_IDS: [589759677744412, 1453034095575643],
    LALS_LOGO_URL:
        "https://scontent.fpoz5-1.fna.fbcdn.net/v/t39.30808-6/292349895_454220650039068_7792229182782599018_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=FB7Nw7VtfF0Q7kNvgHxnX3z&_nc_ht=scontent.fpoz5-1.fna&oh=00_AYB5G-i3SXZe6WM_oo2_qEdFCox-1fm_rOgEalc2s68PdQ&oe=669C2534",
    POSITION_TRANS_MAP: {
        middle_blocker: "Środkowy",
        outside_hitter: "Przyjmujący",
        opposite_hitter: "Atakujący",
        setter: "Rozgrywający",
        libero: "Libero",
        coach: "Trener",
    },
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = LALS_EXTENSION_ENV_CONSTANTS;
} else {
    window.LALS_EXTENSION_ENV_CONSTANTS = LALS_EXTENSION_ENV_CONSTANTS;
}
