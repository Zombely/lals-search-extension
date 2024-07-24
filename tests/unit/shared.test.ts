import * as sharedModule from "../../scripts/shared";

describe("_getElementOfTypeById", () => {
    function setupDOM() {
        document.body.innerHTML = `
        <div id="settings-container" class="hidden"></div>
        <div id="search-container" class="hidden"></div>
        <button id="toggle-button"></button>
      `;
    }

    beforeEach(() => {
        document.body.innerHTML = ""; // Clear the DOM
    });
    it("should return the element of the specified type by ID, div", () => {
        setupDOM();
        const element =
            sharedModule._getElementOfTypeById<HTMLDivElement>(
                "settings-container"
            );
        expect(element).toBeInstanceOf(HTMLDivElement);
        expect(element.id).toBe("settings-container");
    });

    it("should return the element of the specified type by ID, button", () => {
        setupDOM();
        const element =
            sharedModule._getElementOfTypeById<HTMLButtonElement>(
                "toggle-button"
            );
        expect(element).toBeInstanceOf(HTMLButtonElement);
        expect(element.id).toBe("toggle-button");
    });

    it("should throw an error if the element does not exist", () => {
        expect(() =>
            sharedModule._getElementOfTypeById<HTMLElement>("non-existent")
        ).toThrow(`Element non-existent not found`);
    });
});

describe("_handleSettingsToggle", () => {
    let mockToggleButton: HTMLButtonElement;
    let mockSettingsContainer: HTMLElement;
    let mockSearchContainer: HTMLElement;

    beforeEach(() => {
        // Setup mock elements
        mockToggleButton = document.createElement("button");
        mockToggleButton.id = "toggle-button";
        mockSettingsContainer = document.createElement("div");
        mockSettingsContainer.id = "settings-container";
        mockSearchContainer = document.createElement("div");
        mockSearchContainer.id = "search-container";
        document.body.appendChild(mockToggleButton);
        document.body.appendChild(mockSettingsContainer);
        document.body.appendChild(mockSearchContainer);

        // Mock _getElementOfTypeById
        jest.spyOn(sharedModule, "_getElementOfTypeById").mockImplementation(
            (id: string) => {
                switch (id) {
                    case "toggle-button":
                        return mockToggleButton;
                    case "settings-container":
                        return mockSettingsContainer;
                    case "search-container":
                        return mockSearchContainer;
                    default:
                        throw new Error(`No mock element for id: ${id}`);
                }
            }
        );
    });

    afterEach(() => {
        // Reset mocks and remove elements
        jest.restoreAllMocks();
        document.body.removeChild(mockToggleButton);
        document.body.removeChild(mockSettingsContainer);
        document.body.removeChild(mockSearchContainer);
    });

    it("should toggle the visibility of settings and search containers", () => {
        sharedModule._handleSettingsToggle("toggle-button");

        // Initially, containers are not hidden
        expect(mockSettingsContainer.classList.contains("hidden")).toBe(false);
        expect(mockSearchContainer.classList.contains("hidden")).toBe(false);

        // Simulate button click
        mockToggleButton.click();

        // Check if the classes were toggled
        expect(mockSettingsContainer.classList.contains("hidden")).toBe(true);
        expect(mockSearchContainer.classList.contains("hidden")).toBe(true);
    });

    it("should toggle the visibility of settings and search containers twice", () => {
        sharedModule._handleSettingsToggle("toggle-button");

        // Initially, containers are not hidden
        expect(mockSettingsContainer.classList.contains("hidden")).toBe(false);
        expect(mockSearchContainer.classList.contains("hidden")).toBe(false);

        // Simulate button click
        mockToggleButton.click();

        // Check if the classes were toggled
        expect(mockSettingsContainer.classList.contains("hidden")).toBe(true);
        expect(mockSearchContainer.classList.contains("hidden")).toBe(true);

        // Simulate button click again
        mockToggleButton.click();

        // Check if the classes were toggled back
        expect(mockSettingsContainer.classList.contains("hidden")).toBe(false);
        expect(mockSearchContainer.classList.contains("hidden")).toBe(false);
    });
});
