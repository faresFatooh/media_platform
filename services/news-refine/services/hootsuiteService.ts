
import type { Article, SEO, SocialPlatform } from '../types';

/**
 * Simulates posting a news article to a social media platform via the Hootsuite API.
 * This is a mock implementation and does not make real API calls.
 *
 * @param platform The social media platform to post to ('facebook', 'twitter', 'instagram').
 * @param article The main article object.
 * @param seo The SEO object containing summaries and keywords.
 * @param imageB64 Optional base64 encoded image string, required for Instagram.
 * @returns A promise that resolves on successful post or rejects on failure.
 */
export const postToSocialMedia = (
    platform: SocialPlatform,
    article: Article,
    seo: SEO,
    imageB64?: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(`Preparing to post to ${platform} via Hootsuite...`);

        let postContent: any = {};

        switch (platform) {
            case 'facebook':
                postContent = {
                    text: `${article.title}\n\n${article.dek}`,
                };
                break;
            
            case 'twitter':
                postContent = {
                    text: seo.ai_summary,
                };
                break;

            case 'instagram':
                if (!imageB64) {
                    return reject(new Error('Cannot post to Instagram without an image.'));
                }
                const hashtags = seo.keywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ');
                postContent = {
                    media: {
                        type: 'image/jpeg',
                        data: 'base64_image_data_placeholder',
                    },
                    caption: `${article.title}\n\n${article.dek}\n\n${hashtags}`,
                };
                break;
            
            case 'linkedin':
            case 'youtube':
                return reject(new Error(`Platform ${platform} is not yet implemented.`));

            default:
                return reject(new Error('Unsupported social media platform.'));
        }

        console.log('Simulated Hootsuite API Request Payload:', postContent);

        const delay = 1000 + Math.random() * 1500;
        setTimeout(() => {
            if (Math.random() < 0.1) {
                console.error(`Mock API Error: Failed to post to ${platform}.`);
                reject(new Error(`Simulated network error for ${platform}.`));
            } else {
                console.log(`Successfully posted to ${platform}.`);
                resolve();
            }
        }, delay);
    });
};

/**
 * Simulates scheduling a news article for a future post via the Hootsuite API.
 * @param platform The social media platform.
 * @param article The main article object.
 * @param seo The SEO object.
 * @param scheduleTime The time to schedule the post for.
 * @param imageB64 Optional base64 encoded image.
 * @returns A promise that resolves on successful scheduling.
 */
export const schedulePostToSocialMedia = (
    platform: SocialPlatform,
    article: Article,
    seo: SEO,
    scheduleTime: Date,
    imageB64?: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(`Preparing to schedule a post to ${platform} for ${scheduleTime.toISOString()}...`);

        if (platform === 'instagram' && !imageB64) {
            return reject(new Error('Cannot schedule for Instagram without an image.'));
        }

        const postContent: any = {
            scheduleTime: scheduleTime.toISOString(),
            text: platform === 'twitter' ? seo.ai_summary : `${article.title}\n\n${article.dek}`,
        };
        
        console.log('Simulated Hootsuite API Schedule Payload for', platform, postContent);

        const delay = 1000 + Math.random() * 1500;
        setTimeout(() => {
            if (Math.random() < 0.1) {
                console.error(`Mock API Error: Failed to schedule post for ${platform}.`);
                reject(new Error(`Simulated network error for ${platform}.`));
            } else {
                console.log(`Successfully scheduled post for ${platform}.`);
                resolve();
            }
        }, delay);
    });
};
