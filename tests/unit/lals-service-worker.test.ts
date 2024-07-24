import {
    onServiceWorkerInstall,
    onServiceWorkerFetch,
} from "../../scripts/lals-service-worker";
import { LALS_EXTENSION_ENV_CONSTANTS } from "../../scripts/enviroment";

// Mocking the global objects and methods
global.caches = {
    open: jest.fn().mockImplementation((cacheName) => {
        return Promise.resolve({
            match: jest.fn().mockResolvedValue(undefined),
            put: jest.fn(),
        });
    }),
} as any;
global.fetch = jest.fn(() =>
    Promise.resolve({
        clone: jest.fn(),
    })
) as any;
global.self = {
    addEventListener: jest.fn(),
} as any;

global.Request = jest.fn().mockImplementation((url, init) => {
    return {
        url,
        init,
        method: init.method,
    };
});

describe("Service Worker", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should open cache on install", async () => {
        const event: any = { waitUntil: jest.fn() };
        onServiceWorkerInstall(event);
        expect(caches.open).toHaveBeenCalledWith(
            LALS_EXTENSION_ENV_CONSTANTS.CACHE_NAME
        );
        expect(event.waitUntil).toHaveBeenCalledWith(expect.any(Promise));
    });

    it("should handle fetch event for API requests", async () => {
        const request = new Request(
            LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL + "/test",
            {
                method: "GET",
            }
        );
        const event: any = {
            request,
            respondWith: jest.fn(),
        };

        onServiceWorkerFetch(event);
        expect(caches.open).toHaveBeenCalledWith(
            LALS_EXTENSION_ENV_CONSTANTS.CACHE_NAME
        );
        expect(event.respondWith).toHaveBeenCalledWith(expect.any(Promise));
    });

    it("should handle fetch event for non-API requests", async () => {
        const request = new Request("https://www.example.com/test", {
            method: "GET",
        });
        const event: any = {
            request,
            respondWith: jest.fn(),
        };

        onServiceWorkerFetch(event);
        expect(caches.open).not.toHaveBeenCalled();
        expect(event.respondWith).not.toHaveBeenCalled();
    });
});
