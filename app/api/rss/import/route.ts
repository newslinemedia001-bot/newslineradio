import { NextResponse } from 'next/server';
import { importRssFeed } from '@/lib/rss';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        // 1. Authentication
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');

        // You should store this securely in env vars
        const validApiKey = process.env.RSS_API_KEY;

        let isAuthenticated = false;
        if (apiKey === validApiKey) isAuthenticated = true;
        if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === validApiKey) isAuthenticated = true;

        if (!isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Run Import (auto-rotation, no category needed)
        console.log(`Starting RSS Import with auto-rotation`);
        const stats = await importRssFeed(null);

        return NextResponse.json({
            success: true,
            message: `Import completed for ${stats.category}`,
            stats
        });

    } catch (error: any) {
        console.error('RSS Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// GET endpoint for testing
export async function GET(request: Request) {
    try {
        // Check for API key in query params for testing
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('api_key');
        
        const validApiKey = process.env.RSS_API_KEY;

        if (apiKey !== validApiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`Starting RSS Import (GET) with auto-rotation`);
        const stats = await importRssFeed(null);

        return NextResponse.json({
            success: true,
            message: `Import completed for ${stats.category}`,
            stats
        });

    } catch (error: any) {
        console.error('RSS Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
