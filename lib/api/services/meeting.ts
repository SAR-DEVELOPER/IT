/**
 * Meeting Service Module
 *
 * @description
 * This module provides services for creating and managing meetings via the backend API.
 * It handles all API interactions related to meetings including creation and proper error handling.
 *
 * @purpose
 * To centralize meeting-related API calls and provide a clean interface
 * for components to interact with meeting data.
 *
 * @example
 * ```typescript
 * import { MeetingService } from 'lib/api/services/meeting';
 *
 * // Create a new meeting
 * const meeting = await MeetingService.createMeeting({
 *   meetingTitle: "Team Standup",
 *   timeStart: "2025-11-12T14:00:00+07:00",
 *   timeEnd: "2025-11-12T14:30:00+07:00",
 *   hostEmail: "host@example.com",
 *   ...
 * });
 * ```
 */

/**
 * Create meeting request payload
 */
export interface CreateMeetingRequest {
    meetingTitle: string;
    meetingDescription?: string;
    timeStart: string;
    timeEnd: string;
    requestedById?: string | null;
    accountId?: string | null;
    internalAttendants?: string[];
    emailAttendants?: string[];
}

/**
 * Meeting response interface
 */
export interface MeetingResponse {
    id: string;
    meetingTitle: string;
    meetingDescription?: string;
    timeStart: string;
    timeEnd: string;
    status: string;
    hostEmail?: string;
    requestedById?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Meeting account interface
 */
export interface MeetingAccount {
    id: string;
    accountName: string;
    accountEmail: string;
    accountStatus: string;
    accountPlanType: string;
}

/**
 * Meeting interface (from backend)
 */
export interface Meeting {
    id: string;
    meetingTitle: string;
    timeStart: string;
    timeEnd: string;
    hostClaimKey: string | null;
    status: string;
    startUrl: string | null;
    joinUrl: string | null;
    requestedById: string | null;
    zoomId: string | null;
    hostId: string | null;
    internalAttendantIds: string[];
    emailAttendants: string[];
    createdAt: string;
    updatedAt: string;
    requestedBy?: {
        id: string;
        name: string;
        email: string;
        [key: string]: any;
    };
}

/**
 * Grouped meetings by host_id
 */
export interface GroupedMeetings {
    id: string | null;
    meetings: Meeting[];
}

/**
 * Host key interface
 */
export interface HostKey {
    id: number;
    hostKey: string;
    setTime: string;
    expiresAt: string;
    isActive: boolean;
}

/**
 * Meeting service providing API interaction functionality for meeting entities
 */
export const MeetingService = {
    /**
     * Create a new meeting
     * @param meetingData Meeting creation data
     * @param cookies Optional cookies string to forward to backend
     * @returns Promise with created meeting
     */
    createMeeting: async (
        meetingData: CreateMeetingRequest,
        cookies?: string
    ): Promise<MeetingResponse> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';

            const response = await fetch(`${apiUrl}/meeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(cookies && { 'Cookie': cookies }),
                },
                body: JSON.stringify(meetingData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || `Failed to create meeting: ${response.status}` };
                }
                throw new Error(errorData.message || errorData.error || 'Failed to create meeting');
            }

            return await response.json();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
            console.error('Error creating meeting:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    /**
     * Get all meeting accounts
     * @param cookies Optional cookies string to forward to backend
     * @returns Promise with array of meeting accounts
     */
    getAccounts: async (
        cookies?: string
    ): Promise<MeetingAccount[]> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';

            const response = await fetch(`${apiUrl}/meeting/accounts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(cookies && { 'Cookie': cookies }),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || `Failed to fetch accounts: ${response.status}` };
                }
                throw new Error(errorData.message || errorData.error || 'Failed to fetch accounts');
            }

            return await response.json();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch accounts';
            console.error('Error fetching meeting accounts:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    /**
     * Get all meetings grouped by host_id
     * @param cookies Optional cookies string to forward to backend
     * @returns Promise with array of grouped meetings
     */
    getMeetings: async (
        cookies?: string
    ): Promise<GroupedMeetings[]> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';

            const response = await fetch(`${apiUrl}/meeting`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(cookies && { 'Cookie': cookies }),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || `Failed to fetch meetings: ${response.status}` };
                }
                throw new Error(errorData.message || errorData.error || 'Failed to fetch meetings');
            }

            return await response.json();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch meetings';
            console.error('Error fetching meetings:', errorMessage);
            throw new Error(errorMessage);
        }
    },

    /**
     * Get the active host key
     * @param cookies Optional cookies string to forward to backend
     * @returns Promise with host key
     */
    getHostKey: async (
        cookies?: string
    ): Promise<HostKey> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.centri.id';

            const response = await fetch(`${apiUrl}/meeting/host-key`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(cookies && { 'Cookie': cookies }),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || `Failed to fetch host key: ${response.status}` };
                }
                throw new Error(errorData.message || errorData.error || 'Failed to fetch host key');
            }

            return await response.json();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch host key';
            console.error('Error fetching host key:', errorMessage);
            throw new Error(errorMessage);
        }
    },
};

