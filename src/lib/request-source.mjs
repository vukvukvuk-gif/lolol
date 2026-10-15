export function requestSource(source, referer, requestUrl) {
    if (source === 'landing-page') return 'Landing page';
    if (source === 'main-website') return 'Main website';
    try {
        const page = new URL(referer);
        const endpoint = new URL(requestUrl);
        const knownHosts = new Set(['homecleaningco.com', 'www.homecleaningco.com']);
        if (page.origin !== endpoint.origin && !(knownHosts.has(page.hostname) && knownHosts.has(endpoint.hostname))) return 'Not specified';
        if (/^\/landing\/?$/.test(page.pathname)) return 'Landing page';
        if (page.pathname === '/') return 'Main website';
    } catch {}
    return 'Not specified';
}
