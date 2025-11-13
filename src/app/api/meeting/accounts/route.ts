import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/lib/api/services/meeting';

/**
 * API Route: /api/meeting/accounts
 * 
 * Proxies meeting accounts requests to the backend API via MeetingService.
 */
export async function GET(request: NextRequest) {
    try {
        // Get all cookies from the request to forward to backend
        const cookies = request.cookies.toString();

        // Call the meeting service to get accounts
        const accounts = await MeetingService.getAccounts(cookies);

        return NextResponse.json(accounts, { status: 200 });
    } catch (error) {
        console.error('Error fetching meeting accounts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

