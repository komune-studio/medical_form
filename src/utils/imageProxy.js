const DEV_IMAGE_PROXY_PREFIX = '/__image_proxy__';
const SPACES_HOST_PATTERN = /(^|\.)digitaloceanspaces\.com$/i;

const canUseDevProxy = () =>
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost';

export const getProxiedImageUrl = (url) => {
  if (!url || !canUseDevProxy()) return url;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    const isRemoteAsset =
      /^https?:$/i.test(parsedUrl.protocol) &&
      parsedUrl.origin !== window.location.origin &&
      SPACES_HOST_PATTERN.test(parsedUrl.hostname);

    if (!isRemoteAsset) return url;

    return `${DEV_IMAGE_PROXY_PREFIX}?url=${encodeURIComponent(parsedUrl.toString())}`;
  } catch (error) {
    return url;
  }
};

export { DEV_IMAGE_PROXY_PREFIX };
