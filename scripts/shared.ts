export function _getElementOfTypeById<T extends HTMLElement>(id: string): T {
    const element: HTMLElement | null = document.getElementById(id);
    if (!element) throw new Error(`Element ${id} not found`);
    return element as T;
}

export function _handleSettingsToggle(buttonId: string): void {
    const toggleButton: HTMLButtonElement =
        _getElementOfTypeById<HTMLButtonElement>(buttonId);
    const settingsContainer: HTMLElement =
        _getElementOfTypeById<HTMLElement>("settings-container");
    const mainSearchContainer: HTMLElement =
        _getElementOfTypeById<HTMLElement>("search-container");
    toggleButton.addEventListener("click", () => {
        settingsContainer.classList.toggle("hidden");
        mainSearchContainer.classList.toggle("hidden");
    });
}
