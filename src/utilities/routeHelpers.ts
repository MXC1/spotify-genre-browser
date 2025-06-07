export const PUBLIC_PATHS: string[] = [
    '/privacy-policy',
    '/about',
    '/donate',
    '/feedback'
];

export const isPublicPath = (path: string): boolean => PUBLIC_PATHS.some(publicPath => path === publicPath);