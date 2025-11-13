import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/lib/api/services/meeting';

/**
 * API Route: /api/meeting/zoom/create
 * 
 * Proxies meeting creation requests to the backend API via MeetingService.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get all cookies from the request to forward to backend
        const cookies = request.cookies.toString();

        // Call the meeting service to create the meeting
        const meeting = await MeetingService.createMeeting(body, cookies);

        return NextResponse.json(meeting, { status: 201 });
    } catch (error) {
        console.error('Error creating meeting:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}