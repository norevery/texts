const version = '20250607235614';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/2025/06/04/%D0%BF%D0%B5%D1%80%D1%88%D0%B0-%D0%B7%D1%83%D1%81%D1%82%D1%80%D1%96%D1%87/","/2024/11/29/%D0%BD%D0%B5-%D0%B7%D0%B0%D0%B1%D0%B0%D0%B3%D0%B0%D1%82%D0%BE/","/2022/09/11/%D0%B4%D0%BE%D0%B2%D0%B3%D0%B8%D0%B9-%D1%82%D0%B5%D0%BA%D1%81%D1%82-%D0%BF%D1%80%D0%BE-%D1%80%D0%BE%D0%BC%D1%83/","/2022/08/31/%D0%BA%D0%B0%D0%BF%D0%B5%D0%BB%D1%8E%D1%85/","/2022/08/21/%D0%BD%D0%B5%D0%BF%D1%80%D0%BE%D1%85%D0%B0%D0%BD%D0%B8%D0%B9-%D0%B3%D1%96%D1%81%D1%82%D1%8C/","/2022/06/16/%D1%81%D1%82%D1%80%D0%B0%D1%88%D0%BD%D0%B8%D0%B9-%D1%81%D0%BE%D0%BD/","/2022/06/12/%D0%B5%D0%BB%D0%B5%D0%B2%D1%82%D0%B0%D0%BB%D1%8C%D0%B3%D1%96%D1%8F/","/2022/06/12/%D0%B4%D0%B5%D0%BD%D1%8C-%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BD%D1%96%D0%B9/","/2022/06/11/%D0%B4%D0%B5%D0%BD%D1%8C-%D0%BF%D0%B5%D1%80%D0%B5%D0%B4%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BD%D1%96%D0%B9/","/2022/06/06/%D0%BA%D1%80%D0%B0%D0%BF%D0%BB%D1%96-%D0%B4%D0%BE%D1%89%D1%83/","/texts/","/","/manifest.json","/assets/search.json","/assets/styles.css","/redirects.json","/sitemap.xml","/robots.txt","/texts/page2/","/texts/page3/","/texts/page4/","/texts/page5/","/texts/page6/","/texts/page7/","/feed.xml","/assets/logo.jpeg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
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
