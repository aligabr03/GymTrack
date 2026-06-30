// ── GymTrack Service Worker ──
// Provides offline shell + cache-first strategy for app-like experience

const CACHE_NAME = "gymtrack-v1";
const OFFLINE_URL = "/dashboard";

// Assets to pre-cache for instant offline shell
const PRECACHE_ASSETS = [
    "/",
    "/dashboard",
    "/workouts",
    "/exercises",
    "/body",
    "/insights",
    "/friends",
    "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }),
    );
    // Activate immediately — don't wait for old SW to close
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            );
        }),
    );
    // Take control of all clients immediately
    self.clients.claim();
});

// Stale-while-revalidate for navigation, network-first for API
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Skip non-GET requests and Supabase API calls
    if (
        request.method !== "GET" ||
        request.url.includes("supabase.co") ||
        request.url.includes("/api/")
    ) {
        return;
    }

    // Navigation requests: stale-while-revalidate
    if (request.mode === "navigate") {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                        return response;
                    })
                    .catch(() => cached || Response.error());

                return cached || fetchPromise;
            }),
        );
        return;
    }

    // Static assets: cache-first
    if (
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font" ||
        request.destination === "image"
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return (
                    cached ||
                    fetch(request).then((response) => {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                        return response;
                    })
                );
            }),
        );
    }
});
