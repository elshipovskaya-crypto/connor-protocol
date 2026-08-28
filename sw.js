// Простой офлайн-кэш для «Протокол Коннор».
// Все данные персонажа хранятся в localStorage на устройстве — сервис-воркер
// отвечает только за то, чтобы сама оболочка приложения открывалась без сети.

const CACHE_NAME = "connor-protocol-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Сеть в приоритете: пока приложение активно дорабатывается, свежая версия
// важнее офлайн-скорости. Кэш используется только как запасной вариант,
// если сети нет вообще (самолётный режим и т.п.).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
