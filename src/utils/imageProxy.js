const DEV_IMAGE_PROXY_PREFIX = '/__image_proxy__';
const SPACES_HOST_PATTERN = /(^|\.)digitaloceanspaces\.com$/i;
const BACKEND_BASE = require('./ApiConfig').base_url;

const isLocalhost = () =>
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost';

const isDigitalOceanSpaces = (url) => {
  try {
    const parsed = new URL(url);
    return (
      /^https?:$/i.test(parsed.protocol) &&
      SPACES_HOST_PATTERN.test(parsed.hostname)
    );
  } catch {
    return false;
  }
};

/**
 * Returns proxied URL for use in <img> tags (dev only).
 * For production, returns the original URL.
 */
export const getProxiedImageUrl = (url) => {
  if (!url) return url;

  if (isLocalhost() && isDigitalOceanSpaces(url)) {
    return `${DEV_IMAGE_PROXY_PREFIX}?url=${encodeURIComponent(url)}`;
  }

  return url;
};

/**
 * Fetches an image as a base64 data URL, routing through the
 * backend proxy in production to avoid CORS issues with DigitalOcean Spaces.
 * Falls back to the raw URL if fetch fails.
 */
export const fetchImageAsBase64 = async (url) => {
  if (!url) return null;

  try {
    // In dev, use the dev proxy prefix
    const fetchUrl = isLocalhost() && isDigitalOceanSpaces(url)
      ? `${DEV_IMAGE_PROXY_PREFIX}?url=${encodeURIComponent(url)}`
      : isDigitalOceanSpaces(url)
        ? `${BACKEND_BASE}v1/image-proxy?url=${encodeURIComponent(url)}`
        : url;

    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('fetchImageAsBase64 failed, using raw URL:', err);
    return url; // fallback to raw url
  }
};

export { DEV_IMAGE_PROXY_PREFIX };
