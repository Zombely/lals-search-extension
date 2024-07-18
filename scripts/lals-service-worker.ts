import { LALS_EXTENSION_ENV_CONSTANTS } from "./enviroment";

const serviceWorker = self as unknown as ServiceWorkerGlobalScope;

serviceWorker.addEventListener("install", (event: ExtendableEvent) => {
    event.waitUntil(caches.open(LALS_EXTENSION_ENV_CONSTANTS.CACHE_NAME));
});

serviceWorker.addEventListener("fetch", async (event: FetchEvent) => {
    if (event.request.url.includes(LALS_EXTENSION_ENV_CONSTANTS.API_BASE_URL)) {
        event.respondWith(
            caches
                .open(LALS_EXTENSION_ENV_CONSTANTS.CACHE_NAME)
                .then(async (cache: Cache) => {
                    // Respond with the cached response or fetch from the network
                    const cachedResponse = await cache.match(event.request);
                    return (
                        cachedResponse ||
                        fetch(event.request).then(
                            (fetchedResponse: Response) => {
                                // Add the network response to the cache for future visits.
                                cache.put(
                                    event.request,
                                    fetchedResponse.clone()
                                );

                                // Return the network response
                                return fetchedResponse;
                            }
                        )
                    );
                })
        );
    }
});
