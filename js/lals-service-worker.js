const CACHE_NAME = "LALS_EXTENSION_CACHE";
const API_BASE_URL = "https://zbserver.tail7f9ce.ts.net/lals";

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("fetch", async (event) => {
    if (event.request.url.includes(API_BASE_URL)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                // Respond with the cached response or fetch from the network
                return cache.match(event.request).then((cachedResponse) => {
                    return (
                        cachedResponse ||
                        fetch(event.request).then((fetchedResponse) => {
                            // Add the network response to the cache for future visits.
                            cache.put(event.request, fetchedResponse.clone());

                            // Return the network response
                            return fetchedResponse;
                        })
                    );
                });
            })
        );
    }
});
