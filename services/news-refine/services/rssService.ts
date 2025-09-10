import type { FeedItem } from '../types';

/**
 * Fetches and parses an RSS feed from a given URL.
 * Note: This function relies on direct fetching. In a real-world scenario on localhost,
 * this might be blocked by CORS policies. A CORS proxy server would be needed to bypass this.
 * @param url The URL of the RSS feed.
 * @returns A promise that resolves to an array of FeedItem objects.
 */
export const fetchAndParseRSS = async (url: string): Promise<FeedItem[]> => {
    try {
        // A CORS proxy can be prefixed here if needed, e.g., `https://cors-anywhere.herokuapp.com/${url}`
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const items = Array.from(xml.querySelectorAll('item, entry'));
        
        return items.map(item => {
            const title = item.querySelector('title')?.textContent || 'No Title';
            const linkElement = item.querySelector('link');
            // RSS <link> can be an element with text content or an attribute 'href'
            const link = linkElement?.getAttribute('href') || linkElement?.textContent || '';
            const pubDate = item.querySelector('pubDate, published')?.textContent || new Date().toISOString();
            
            let source = 'Unknown Source';
            try {
                source = new URL(url).hostname.replace('www.', '');
            } catch (e) {}

            return { title, link, pubDate, source };
        }).filter(item => item.link); // Ensure item has a link

    } catch (error) {
        console.error(`Error processing feed ${url}:`, error);
        return []; // Return empty array on failure
    }
};
