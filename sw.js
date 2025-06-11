const version = '20250611202926';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/2021/07/27/%D0%BF%D1%80%D0%BE-%D0%B7%D0%BE%D0%BE%D0%BF%D0%B0%D1%80%D0%BA/","/2021/07/07/%D0%BC%D1%96%D1%81%D1%82%D0%BE-%D1%81%D0%BE%D0%BD%D1%86%D1%8F/","/2021/06/24/goldilocks-conditions/","/2021/06/21/%D0%B5%D1%80%D0%B0%D1%82%D0%BE%D1%81%D1%84%D0%B5%D0%BD/","/2021/06/13/%D0%B3%D0%B5%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D1%96%D1%8F-%D0%B1%D0%B4%D0%B6%D0%BE%D0%BB%D0%B8%D0%BD%D0%B8%D1%85-%D1%81%D0%BE%D1%82/","/2021/05/24/%D0%B7%D0%BE%D0%BB%D0%BE%D1%82%D1%96-%D1%80%D0%B8%D0%B1%D0%BA%D0%B8/","/2021/05/17/%D0%BF%D1%80%D0%BE-%D0%BF%D0%BE%D0%B3%D0%BE%D0%B4%D1%83/","/2021/05/03/%D0%BC%D0%B0%D0%BC%D0%BE/","/texts/","/","/manifest.json","/assets/search.json","/assets/styles.css","/redirects.json","/sitemap.xml","/robots.txt","/texts/page2/","/feed.xml","/assets/logo.jpeg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
