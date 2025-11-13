import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/lib/api/services/meeting';

/**
 * API Route: /api/meeting
 * 
 * Proxies meeting requests to the backend API via MeetingService.
 * GET: Returns all meetings grouped by host_id
 */
export async function GET(request: NextRequest) {
    try {
        // Get all cookies from the request to forward to backend
        const cookies = request.cookies.toString();

        // Call the meeting service to get meetings
        const meetings = await MeetingService.getMeetings(cookies);

        return NextResponse.json(meetings, { status: 200 });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: 'Method not allowed. Use specific endpoints like /api/meeting/zoom/create' },
        { status: 405 }
    );
}

