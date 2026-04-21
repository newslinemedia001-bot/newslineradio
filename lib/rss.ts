import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
    },
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator'],
        ],
    },
});

export const DEFAULT_FEEDS = [
    // --- NEWS ---
    {
        name: 'Tuko News',
        url: 'https://www.tuko.co.ke/rss/',
        category: 'News',
        enabled: true
    },
    {
        name: 'Capital FM News',
        url: 'https://www.capitalfm.co.ke/news/feed/',
        category: 'News',
        enabled: true
    },
    {
        name: 'The Star Kenya',
        url: 'https://www.the-star.co.ke/rss',
        category: 'News',
        enabled: true
    },
    {
        name: 'Standard Digital Headlines',
        url: 'https://www.standardmedia.co.ke/rss/headlines.php',
        category: 'News',
        enabled: true
    },
    {
        name: 'Citizen Digital',
        url: 'https://www.citizen.digital/rss',
        category: 'News',
        enabled: true
    },
    {
        name: 'Tukio Radio',
        url: 'https://tukioradio.co.ke/feed/',
        category: 'News',
        enabled: true
    },

    // --- POLITICS ---
    {
        name: 'The Star Politics',
        url: 'https://www.the-star.co.ke/rss/news/politics',
        category: 'Politics',
        enabled: true
    },
    {
        name: 'Standard Politics',
        url: 'https://www.standardmedia.co.ke/rss/politics.php',
        category: 'Politics',
        enabled: true
    },
    {
        name: 'Capital FM Politics',
        url: 'https://www.capitalfm.co.ke/news/category/politics/feed/',
        category: 'Politics',
        enabled: true
    },

    // --- ENTERTAINMENT ---
    {
        name: 'Mpasho',
        url: 'https://mpasho.co.ke/feed/',
        category: 'Entertainment',
        enabled: true
    },
    {
        name: 'Pulse Live Entertainment',
        url: 'https://www.pulselive.co.ke/entertainment/rss',
        category: 'Entertainment',
        enabled: true
    },
    {
        name: 'Kiss 100',
        url: 'https://kiss100.co.ke/feed/',
        category: 'Entertainment',
        enabled: true
    },

    // --- SPORTS ---
    {
        name: 'Capital FM Sports',
        url: 'https://www.capitalfm.co.ke/sports/feed/',
        category: 'Sports',
        enabled: true
    },
    {
        name: 'The Star Sports',
        url: 'https://www.the-star.co.ke/rss/sports',
        category: 'Sports',
        enabled: true
    },
    {
        name: 'Standard Sports',
        url: 'https://www.standardmedia.co.ke/rss/sports.php',
        category: 'Sports',
        enabled: true
    },
    {
        name: 'Tukio Radio Sports',
        url: 'https://tukioradio.co.ke/category/sports/feed/',
        category: 'Sports',
        enabled: true
    },

    // --- LIFESTYLE ---
    {
        name: 'Capital FM Lifestyle',
        url: 'https://www.capitalfm.co.ke/lifestyle/feed/',
        category: 'Lifestyle',
        enabled: true
    },
    {
        name: 'The Star Lifestyle',
        url: 'https://www.the-star.co.ke/rss/lifestyle',
        category: 'Lifestyle',
        enabled: true
    },
    {
        name: 'Pulse Live Lifestyle',
        url: 'https://www.pulselive.co.ke/lifestyle/rss',
        category: 'Lifestyle',
        enabled: true
    },
];

// Helper to extract image from various possible sources
function extractImage(item: any): string | null {
    // 1. Check media:content
    if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
    if (item.mediaContent?.url) return item.mediaContent.url;

    // 2. Check media:thumbnail
    if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
    if (item.mediaThumbnail?.url) return item.mediaThumbnail.url;

    // 3. Check enclosure
    if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
        return item.enclosure.url;
    }

    // 4. Check iTunes image (if podcast)
    if (item.itunes?.image) return item.itunes.image;

    // 5. Check content for first image
    const content = item.contentEncoded || item.content || '';
    const $ = cheerio.load(content);
    const firstImg = $('img').first().attr('src');
    if (firstImg) return firstImg;

    return null;
}

// Helper to clean and format content
function processContent(params: { content: string; link: string }): string | null {
    const { content, link } = params;
    let cleanContent = sanitizeHtml(content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol', 'blockquote', 'h2', 'h3', 'h4'],
        allowedAttributes: {
            'a': ['href', 'target']
        },
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
        }
    });

    // Load into cheerio for structure fixes if needed
    const $ = cheerio.load(cleanContent);

    const textLength = $.text().trim().length;

    // Require at least 30 characters of actual text to be meaningful
    if (textLength < 30) return null;

    // Add read more link
    const finalHtml = $.html() + `<p><i>Read more at <a href="${link}" target="_blank" rel="nofollow">original source</a>.</i></p>`;

    return finalHtml;
}

export async function importRssFeed(manualCategory: string | null = null) {
    const stats = {
        processed: 0,
        imported: 0,
        duplicates: 0,
        errors: 0,
        skipped: 0,
        skippedReasons: {
            political: 0,
            duplicate: 0,
            tooShort: 0,
            noImage: 0,
            feedError: 0
        },
        lastError: null as string | null,
        category: manualCategory || 'auto-rotated',
        feedsProcessed: [] as string[],
        feedsWithErrors: [] as string[]
    };

    try {
        // Determine Category and Feeds to process
        let categoryToImport = manualCategory;

        // Use default feeds
        let availableFeeds = DEFAULT_FEEDS.filter(f => f.enabled);

        if (!manualCategory) {
            // AUTO-ROTATION: Get last category from Firestore and rotate to next
            const categories = ['News', 'Politics', 'Entertainment', 'Sports', 'Lifestyle'];
            
            try {
                const rotationRef = collection(db, 'settings');
                const q = query(rotationRef, where('__name__', '==', 'rssRotation'));
                const rotationSnap = await getDocs(q);
                
                let lastCategory = null;
                if (!rotationSnap.empty) {
                    lastCategory = rotationSnap.docs[0].data().lastCategory;
                }
                
                // Find next category
                const lastIndex = lastCategory ? categories.indexOf(lastCategory) : -1;
                const nextIndex = (lastIndex + 1) % categories.length;
                categoryToImport = categories[nextIndex];
                
                // Save the new category for next time
                const { doc: docRef, setDoc } = await import('firebase/firestore');
                await setDoc(docRef(db, 'settings', 'rssRotation'), {
                    lastCategory: categoryToImport,
                    updatedAt: serverTimestamp()
                });
                
                console.log(`Auto-rotated from ${lastCategory || 'start'} to ${categoryToImport}`);
            } catch (rotationErr) {
                console.error('Rotation error, using fallback:', rotationErr);
                categoryToImport = categories[0];
            }
        }

        // Filter feeds for the target category
        const targetFeeds = availableFeeds.filter(f => f.category === categoryToImport);
        stats.category = categoryToImport || 'unknown';

        // Process Feeds
        for (const feedConfig of targetFeeds) {
            try {
                console.log(`Processing feed: ${feedConfig.name} (${feedConfig.url})`);
                const feed = await parser.parseURL(feedConfig.url);
                stats.feedsProcessed.push(feedConfig.name);

                // Process top 5 items
                const itemsToProcess = feed.items.slice(0, 5);
                console.log(`Found ${itemsToProcess.length} items in ${feedConfig.name}`);

                for (const item of itemsToProcess) {
                    stats.processed++;
                    try {
                        const title = item.title || 'No Title';

                        // SMART FILTER: Exclude Politics from Entertainment
                        if (feedConfig.category === 'Entertainment') {
                            const politicalKeywords = ['Ruto', 'Tax', 'Parliament', 'Governor', 'President', 'Govt', 'Cabinet', 'CS ', 'Senator', 'MP ', 'Politics'];
                            const hasPolitics = politicalKeywords.some(keyword => title.includes(keyword));
                            if (hasPolitics) {
                                console.log(`Skipped political content in entertainment: ${title}`);
                                stats.skipped++;
                                stats.skippedReasons.political++;
                                continue;
                            }
                        }

                        const link = item.link || '';
                        const pubDate = item.isoDate ? new Date(item.isoDate) : new Date();

                        // Check for duplicate by URL
                        const q = query(collection(db, 'news'), where('sourceUrl', '==', link));
                        const duplicateCheck = await getDocs(q);

                        if (!duplicateCheck.empty) {
                            stats.duplicates++;
                            stats.skippedReasons.duplicate++;
                            continue;
                        }

                        // Extract content and image
                        let rawContent = item.contentEncoded || item.content || item.summary || item.contentSnippet || '';

                        // If content is very short, try the summary as a fallback
                        if (rawContent.length < 100) {
                            rawContent = item.summary || item.contentSnippet || rawContent;
                        }

                        const processedHtml = processContent({ content: rawContent, link });

                        if (!processedHtml) {
                            console.log(`Skipped (no usable content): ${title}`);
                            stats.skipped++;
                            stats.skippedReasons.tooShort++;
                            continue;
                        }

                        const imageUrl = extractImage(item);

                        // More lenient image check - allow articles without images for certain categories
                        const allowNoImage = ['Politics', 'News'].includes(feedConfig.category);
                        if (!imageUrl && !allowNoImage) {
                            console.log(`Skipped due to missing image: ${title}`);
                            stats.skipped++;
                            stats.skippedReasons.noImage++;
                            continue;
                        }

                        // Generate slug from title
                        const slug = title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .substring(0, 100);

                        const articleData = {
                            title: title,
                            slug: slug,
                            content: processedHtml,
                            excerpt: (item.contentSnippet || item.content || '').substring(0, 150) + '...',
                            imageUrl: imageUrl || null,
                            category: feedConfig.category,
                            sourceUrl: link || null,
                            sourceName: feedConfig.name || 'Unknown Source',
                            author: item.creator || (item as any).author || 'RSS Feed',
                            status: 'published',
                            publishedAt: pubDate,
                            timestamp: serverTimestamp(),
                            isRssImport: true
                        };

                        // Save to DB
                        await addDoc(collection(db, 'news'), articleData);

                        stats.imported++;

                    } catch (itemErr: any) {
                        console.error(`Error processing item ${item.title}:`, itemErr);
                        stats.errors++;
                        stats.lastError = String(itemErr);
                    }
                }

            } catch (feedErr: any) {
                console.error(`Error processing feed ${feedConfig.name}:`, feedErr);
                stats.errors++;
                stats.feedsWithErrors.push(`${feedConfig.name}: ${feedErr.message}`);
                stats.skippedReasons.feedError++;
            }
        }

    } catch (e: any) {
        console.error("RSS Import Fatal Error:", e);
        throw e;
    }

    return stats;
}
