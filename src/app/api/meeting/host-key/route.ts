import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/lib/api/services/meeting';

/**
 * API Route: /api/meeting/host-key
 * 
 * Proxies host key requests to the backend API via MeetingService.
 * GET: Returns the active host key
 */
export async function GET(request: NextRequest) {
    try {
        // Get all cookies from the request to forward to backend
        const cookies = request.cookies.toString();

        // Call the meeting service to get host key
        const hostKey = await MeetingService.getHostKey(cookies);

        return NextResponse.json(hostKey, { status: 200 });
    } catch (error) {
        console.error('Error fetching host key:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}


