export function apiURL() {
    let url: string = '';
    const port = 3000;
    
    // Use import.meta.env instead of process.env
    if (import.meta.env.VITE_ENVIRONMENT === 'dev') {
        url = `http://localhost:${port}`;
    } else if (import.meta.env.VITE_ENVIRONMENT === 'prod') {
        url = `https://api.candlecompanion.com:${port}`;
    }

    return url;
}