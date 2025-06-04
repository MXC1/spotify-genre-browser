export const PUBLIC_PATHS = [
    '/privacy-policy',
    '/about',
    '/donate',
    '/feedback'
];

export const isPublicPath = (path) => PUBLIC_PATHS.some(publicPath => path === publicPath);
