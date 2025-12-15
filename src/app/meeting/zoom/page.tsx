"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Box,
    Typography,
    Paper,
    Grid2,
    Chip,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Snackbar,
} from "@mui/material";
import {
    VideoCall as ZoomIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CheckCircle as ActiveIcon,
    Schedule as ScheduleIcon,
    AccessTime as TimeIcon,
    Link as LinkIcon,
    Refresh as RefreshIcon,
    Update as UpdateIcon,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Close as CloseIcon,
    ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { format, isToday, parseISO, addMinutes } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DocumentPersonnelModal from "@/src/components/ui/DocumentPersonnelModal";
import { IdentityService, Identity } from "@/lib/api/services/identity";
import { Tabs, Tab } from "@mui/material";

// Types
interface ZoomMeeting {
    id: string;
    topic: string;
    startTime: string;
    duration: number; // in minutes
    joinUrl: string;
    meetingId: string;
    hostName: string;
    requestedById?: string | null;
    internalAttendantIds?: string[];
}

interface ZoomAccount {
    id: string;
    accountName: string;
    email: string;
    status: "active" | "inactive" | "suspended";
    planType: string;
    meetingsToday: ZoomMeeting[];
}

interface InternalAttendant {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface MeetingFormData {
    startDate: Date | null;
    startTime: string; // Format: "HH:mm" (e.g., "14:30")
    duration: number; // -1 for "all day"
    accountId: string;
    topic: string;
    emailAttendants: string[];
    internalAttendants: InternalAttendant[];
    description: string;
}

// Account Card Component
interface AccountCardProps {
    account: ZoomAccount;
    index: number;
    selectedDate: Date;
    currentUserId?: string | null;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index, selectedDate, currentUserId }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "#10b981";
            case "inactive":
                return "#f59e0b";
            case "suspended":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, "HH:mm");
        } catch {
            return dateString;
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getCurrentTimeMeetings = () => {
        const now = new Date();
        return account.meetingsToday.filter((meeting) => {
            const meetingStart = parseISO(meeting.startTime);
            const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
            return now >= meetingStart && now <= meetingEnd;
        });
    };

    const getUpcomingMeetings = () => {
        const now = new Date();
        return account.meetingsToday.filter((meeting) => {
            const meetingStart = parseISO(meeting.startTime);
            return meetingStart > now;
        });
    };

    const currentMeetings = getCurrentTimeMeetings();
    const upcomingMeetings = getUpcomingMeetings();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Paper
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    border: `1px solid ${getStatusColor(account.status)}20`,
                }}
            >
                {/* Account Header */}
                <Box
                    sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${getStatusColor(account.status)}15 0%, ${getStatusColor(account.status)}05 100%)`,
                        borderBottom: `2px solid ${getStatusColor(account.status)}30`,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: getStatusColor(account.status),
                                width: 56,
                                height: 56,
                            }}
                        >
                            <ZoomIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                {account.accountName}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                <Typography variant="body2" color="text.secondary">
                                    {account.email}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Chip
                                    label={account.status.toUpperCase()}
                                    size="small"
                                    sx={{
                                        bgcolor: getStatusColor(account.status),
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "0.7rem",
                                    }}
                                />
                                <Chip
                                    label={account.planType}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.7rem" }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Meetings Section */}
                <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                            {isToday(selectedDate)
                                ? `Today's Meetings (${account.meetingsToday.length})`
                                : `${format(selectedDate, "MMMM d, yyyy")} Meetings (${account.meetingsToday.length})`
                            }
                        </Typography>
                    </Box>

                    {account.meetingsToday.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 4,
                                color: "text.secondary",
                            }}
                        >
                            <Typography variant="body2">
                                {isToday(selectedDate)
                                    ? "No meetings scheduled for today"
                                    : `No meetings scheduled for ${format(selectedDate, "MMMM d, yyyy")}`
                                }
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Current/Ongoing Meetings */}
                            {currentMeetings.length > 0 && (
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#10b981",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            mb: 1,
                                            display: "block",
                                        }}
                                    >
                                        🔴 Ongoing Now ({currentMeetings.length})
                                    </Typography>
                                    {currentMeetings.map((meeting) => (
                                        <MeetingItem key={meeting.id} meeting={meeting} isOngoing={true} currentUserId={currentUserId} />
                                    ))}
                                </Box>
                            )}

                            {/* Upcoming Meetings */}
                            {upcomingMeetings.length > 0 && (
                                <Box>
                                    {currentMeetings.length > 0 && <Divider sx={{ my: 2 }} />}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            mb: 1,
                                            display: "block",
                                        }}
                                    >
                                        Upcoming ({upcomingMeetings.length})
                                    </Typography>
                                    {upcomingMeetings.map((meeting) => (
                                        <MeetingItem key={meeting.id} meeting={meeting} isOngoing={false} currentUserId={currentUserId} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
};

// Meeting Item Component
interface MeetingItemProps {
    meeting: ZoomMeeting;
    isOngoing: boolean;
    currentUserId?: string | null;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting, isOngoing, currentUserId }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const formatTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, "HH:mm");
        } catch {
            return dateString;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, "EEEE, MMMM d, yyyy 'at' HH:mm");
        } catch {
            return dateString;
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const handleCopyMeetingLink = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the meeting link

        const formattedMessage = `${meeting.hostName} invites you to a Zoom meeting:

Title: ${meeting.topic}
Date & Time: ${formatDate(meeting.startTime)}
Duration: ${formatDuration(meeting.duration)}
Meeting ID: ${meeting.meetingId}

Join Meeting: ${meeting.joinUrl}`;

        try {
            await navigator.clipboard.writeText(formattedMessage);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Check if current user is authorized (requestedById matches or is in internalAttendantIds)
    const isAuthorized = currentUserId && (
        meeting.requestedById === currentUserId ||
        (meeting.internalAttendantIds && meeting.internalAttendantIds.includes(currentUserId))
    );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 1,
                border: isOngoing ? "2px solid #10b981" : "1px solid #e5e7eb",
                borderRadius: 2,
                bgcolor: isOngoing ? "#10b98108" : "background.paper",
                "&:hover": {
                    bgcolor: isOngoing ? "#10b98112" : "#f9fafb",
                    cursor: isAuthorized ? "pointer" : "default",
                },
                transition: "all 0.2s ease",
            }}
            onClick={isAuthorized ? () => window.open(meeting.joinUrl, "_blank") : undefined}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: "bold",
                        flexGrow: 1,
                        color: isOngoing ? "#10b981" : "text.primary",
                    }}
                >
                    {meeting.topic}
                </Typography>
                {isOngoing && (
                    <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                            bgcolor: "#10b981",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.65rem",
                            height: 20,
                        }}
                    />
                )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                        {(() => {
                            try {
                                const startDate = parseISO(meeting.startTime);
                                const endDate = addMinutes(startDate, meeting.duration);
                                return `${formatTime(meeting.startTime)} - ${format(endDate, "HH:mm")} (${formatDuration(meeting.duration)})`;
                            } catch {
                                return `${formatTime(meeting.startTime)} • ${formatDuration(meeting.duration)}`;
                            }
                        })()}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                        Requested by: {meeting.hostName}
                    </Typography>
                </Box>
                {isAuthorized && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <LinkIcon sx={{ fontSize: 14, color: "#2D8CFF" }} />
                        <Typography
                            variant="caption"
                            sx={{ color: "#2D8CFF", textDecoration: "underline", cursor: "pointer" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(meeting.joinUrl, "_blank");
                            }}
                        >
                            Join Meeting
                        </Typography>
                        <Tooltip title="Copy meeting invitation">
                            <IconButton
                                size="small"
                                onClick={handleCopyMeetingLink}
                                sx={{
                                    p: 0.5,
                                    color: "#2D8CFF",
                                    "&:hover": {
                                        bgcolor: "rgba(45, 140, 255, 0.1)",
                                    },
                                }}
                            >
                                <CopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
            <Snackbar
                open={copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" onClose={() => setCopySuccess(false)}>
                    Meeting invitation copied to clipboard!
                </Alert>
            </Snackbar>
        </Paper>
    );
};

// Main Zoom Page
export default function ZoomPage() {
    const [accounts, setAccounts] = useState<ZoomAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { user, displayName, role, isLoading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
    const [hostKey, setHostKey] = useState<string | null>(null);
    const [hostKeyLoading, setHostKeyLoading] = useState(false);
    const [hostKeyCopySuccess, setHostKeyCopySuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Schedule Meeting Modal State
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<MeetingFormData>({
        startDate: null,
        startTime: "",
        duration: 30,
        accountId: "",
        topic: "",
        emailAttendants: [],
        internalAttendants: [],
        description: "",
    });

    // Generate time options in 15-minute increments (00:00 to 23:45)
    const generateTimeOptions = (): string[] => {
        const times: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();
    const [attendantInput, setAttendantInput] = useState("");
    const [attendantTab, setAttendantTab] = useState(0); // 0 = email, 1 = internal

    // Internal personnel modal state
    const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
    const [availablePersonnel, setAvailablePersonnel] = useState<Identity[]>([]);
    const [personnelLoading, setPersonnelLoading] = useState(false);
    const [personnelError, setPersonnelError] = useState("");
    const [personnelSearchQuery, setPersonnelSearchQuery] = useState("");

    // Fetch user profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch('/api/auth/profile', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && (data.identity || data.jwt)) {
                        const identity = data.identity || {};
                        const jwt = data.jwt || {};
                        setProfileData({
                            id: identity.id || user?.sub || "",
                            name: identity.name || jwt.name || displayName || "User",
                            email: identity.email || jwt.email || user?.email || "",
                            role: identity.jobTitle || jwt.role || role || "",
                        });
                    }
                }
            } catch (err) {
                // Fallback to useAuth data
                if (user) {
                    setProfileData({
                        id: user.sub || "",
                        name: displayName || "User",
                        email: user.email || "",
                        role: role || "",
                    });
                }
            }
        };

        if (!authLoading) {
            fetchProfileData();
        }
    }, [user, displayName, role, authLoading]);

    const getInitials = (name: string): string => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const stringToColor = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 50%)`;
    };

    // Combine date and time into a single Date object (for display/comparison)
    const getCombinedDateTime = (): Date | null => {
        if (!formData.startDate) return null;

        const date = new Date(formData.startDate);

        // For all-day meetings, use 00:00:00
        if (formData.duration === -1) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
        } else {
            // For regular meetings, require time selection
            if (!formData.startTime) return null;
            const [hours, minutes] = formData.startTime.split(':').map(Number);
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(0);
            date.setMilliseconds(0);
        }

        return date;
    };

    // Get UTC+7 ISO string for API submission
    // Returns ISO string with +07:00 timezone offset (Jakarta/Bangkok)
    const getUTC7ISOString = (): string | null => {
        if (!formData.startDate) return null;

        // Format the date as YYYY-MM-DD
        const year = formData.startDate.getFullYear();
        const month = String(formData.startDate.getMonth() + 1).padStart(2, '0');
        const day = String(formData.startDate.getDate()).padStart(2, '0');

        // For all-day meetings, start at 00:00:00
        if (formData.duration === -1) {
            return `${year}-${month}-${day}T00:00:00+07:00`;
        }

        // For regular meetings, require time selection
        if (!formData.startTime) return null;

        // Create ISO string with UTC+7 timezone offset
        // Format: YYYY-MM-DDTHH:mm:ss+07:00
        return `${year}-${month}-${day}T${formData.startTime}:00+07:00`;
    };

    // Get UTC+7 ISO string for end time
    const getUTC7EndISOString = (duration: number): string | null => {
        if (!formData.startDate) return null;

        // For all-day meetings, end at 23:59:59 of the selected date
        if (duration === -1) {
            const year = formData.startDate.getFullYear();
            const month = String(formData.startDate.getMonth() + 1).padStart(2, '0');
            const day = String(formData.startDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}T23:59:59+07:00`;
        }

        // For regular meetings, require time selection
        if (!formData.startTime) return null;

        const startDate = getCombinedDateTime();
        if (!startDate) return null;

        const endDate = addMinutes(startDate, duration);

        // Format the end date as YYYY-MM-DD
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        const hours = String(endDate.getHours()).padStart(2, '0');
        const minutes = String(endDate.getMinutes()).padStart(2, '0');

        // Create ISO string with UTC+7 timezone offset
        return `${year}-${month}-${day}T${hours}:${minutes}:00+07:00`;
    };

    // Check if account has available space at the selected time
    const isAccountAvailable = (account: ZoomAccount, startTime: Date, duration: number): boolean => {
        if (account.status !== "active") return false;

        // For "all day" meetings, check if account has any meetings that day
        if (duration === -1) {
            // Use the date from formData if available, otherwise use startTime
            const selectedDate = formData.startDate
                ? format(formData.startDate, "yyyy-MM-dd")
                : format(startTime, "yyyy-MM-dd");
            return !account.meetingsToday.some((meeting) => {
                const meetingDate = format(parseISO(meeting.startTime), "yyyy-MM-dd");
                return meetingDate === selectedDate;
            });
        }

        const endTime = addMinutes(startTime, duration);

        // Check if any existing meeting overlaps with the selected time
        const hasConflict = account.meetingsToday.some((meeting) => {
            const meetingStart = parseISO(meeting.startTime);
            const meetingEnd = addMinutes(meetingStart, meeting.duration);

            // Check for overlap: meetings overlap if one starts before the other ends
            return (
                (startTime >= meetingStart && startTime < meetingEnd) ||
                (endTime > meetingStart && endTime <= meetingEnd) ||
                (startTime <= meetingStart && endTime >= meetingEnd)
            );
        });

        return !hasConflict;
    };

    // Get available accounts for selected time
    const getAvailableAccounts = (): ZoomAccount[] => {
        // For all-day meetings, only need the date
        if (formData.duration === -1) {
            if (!formData.startDate) return [];
            // Create a date object at 00:00:00 for all-day meetings
            const dateForCheck = new Date(formData.startDate);
            dateForCheck.setHours(0, 0, 0, 0);
            return accounts.filter((account) =>
                isAccountAvailable(account, dateForCheck, formData.duration)
            );
        }

        // For regular meetings, need both date and time
        const combinedDateTime = getCombinedDateTime();
        if (!combinedDateTime) return [];
        return accounts.filter((account) =>
            isAccountAvailable(account, combinedDateTime, formData.duration)
        );
    };

    // Handle step navigation
    const handleNext = () => {
        if (activeStep === 0) {
            if (!formData.startDate) {
                setError("Please select a date");
                return;
            }
            // For regular meetings (not all-day), require time selection
            if (formData.duration !== -1 && !formData.startTime.trim()) {
                setError("Please select a time");
                return;
            }
        }
        if (activeStep === 1 && !formData.accountId) {
            setError("Please select an account");
            return;
        }
        setError(null);
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setError(null);
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setFormData({
            startDate: null,
            startTime: "",
            duration: 30,
            accountId: "",
            topic: "",
            emailAttendants: [],
            internalAttendants: [],
            description: "",
        });
        setAttendantInput("");
        setAttendantTab(0);
        setSubmitting(false);
    };

    const handleCloseModal = () => {
        setOpenScheduleModal(false);
        setTimeout(() => {
            handleReset();
        }, 300);
    };

    // Load personnel data
    const loadPersonnel = async () => {
        setPersonnelLoading(true);
        setPersonnelError("");
        try {
            const personnel = await IdentityService.getPersonnel();
            setAvailablePersonnel(personnel);
        } catch (error) {
            setPersonnelError(error instanceof Error ? error.message : "Failed to load personnel");
        } finally {
            setPersonnelLoading(false);
        }
    };

    // Handle personnel search
    const handlePersonnelSearch = (query: string) => {
        setPersonnelSearchQuery(query);
    };

    // Filter personnel based on search query
    const filteredPersonnel = availablePersonnel.filter(person =>
        person.name.toLowerCase().includes(personnelSearchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(personnelSearchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(personnelSearchQuery.toLowerCase())
    );

    // Handle internal personnel selection
    const handleInternalPersonnelSelect = (person: Identity) => {
        const internalAttendant: InternalAttendant = {
            id: person.id,
            name: person.name,
            email: person.email,
            role: person.role,
            avatar: person.avatar,
        };

        if (!formData.internalAttendants.some(a => a.id === person.id)) {
            setFormData({
                ...formData,
                internalAttendants: [...formData.internalAttendants, internalAttendant],
            });
        }
        setPersonnelModalOpen(false);
    };

    const handleAddAttendant = () => {
        if (attendantInput.trim() && !formData.emailAttendants.includes(attendantInput.trim())) {
            setFormData({
                ...formData,
                emailAttendants: [...formData.emailAttendants, attendantInput.trim()],
            });
            setAttendantInput("");
        }
    };

    const handleRemoveEmailAttendant = (email: string) => {
        setFormData({
            ...formData,
            emailAttendants: formData.emailAttendants.filter((a) => a !== email),
        });
    };

    const handleRemoveInternalAttendant = (id: string) => {
        setFormData({
            ...formData,
            internalAttendants: formData.internalAttendants.filter((a) => a.id !== id),
        });
    };

    const handleSubmit = async () => {
        if (submitting) return; // Prevent multiple submissions

        if (!formData.topic.trim()) {
            setError("Please enter a meeting topic");
            return;
        }

        const timeStartUTC7 = getUTC7ISOString();
        const timeEndUTC7 = getUTC7EndISOString(formData.duration);

        if (!timeStartUTC7 || !timeEndUTC7) {
            if (formData.duration === -1) {
                setError("Please select a date");
            } else {
                setError("Please select both date and time");
            }
            return;
        }

        // Find the selected account
        const selectedAccount = accounts.find(account => account.id === formData.accountId);
        if (!selectedAccount) {
            setError("Please select an account");
            return;
        }

        // Prepare data to be sent with UTC+7 timezone
        const dataToSend = {
            meetingTitle: formData.topic,
            meetingDescription: formData.description,
            timeStart: timeStartUTC7,
            timeEnd: timeEndUTC7,
            internalAttendants: formData.internalAttendants.map(attendant => attendant.id),
            emailAttendants: formData.emailAttendants,
            requestedById: profileData?.id,
            hostId: formData.accountId,
        };

        // Log the data to be sent
        console.log("Data to be sent:", dataToSend);

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/meeting/zoom/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Failed to create meeting: ${response.status}` }));
                throw new Error(errorData.error || errorData.message || 'Failed to create meeting');
            }

            const meeting = await response.json();
            console.log("Meeting created:", meeting);

            // Refresh accounts after successful creation
            await fetchZoomAccounts();
            handleCloseModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create meeting");
        } finally {
            setSubmitting(false);
        }
    };

    const fetchZoomAccounts = async () => {
        try {
            setRefreshing(true);
            setError(null);

            // Fetch accounts and meetings in parallel
            const [accountsResponse, meetingsResponse] = await Promise.all([
                fetch('/api/meeting/accounts', {
                    method: 'GET',
                    credentials: 'include',
                }),
                fetch('/api/meeting', {
                    method: 'GET',
                    credentials: 'include',
                }),
            ]);

            if (!accountsResponse.ok) {
                const errorData = await accountsResponse.json().catch(() => ({ error: `Failed to fetch accounts: ${accountsResponse.status}` }));
                throw new Error(errorData.error || errorData.message || 'Failed to fetch accounts');
            }

            if (!meetingsResponse.ok) {
                const errorData = await meetingsResponse.json().catch(() => ({ error: `Failed to fetch meetings: ${meetingsResponse.status}` }));
                throw new Error(errorData.error || errorData.message || 'Failed to fetch meetings');
            }

            const accountsData = await accountsResponse.json();
            const groupedMeetings = await meetingsResponse.json();

            // Get selected date range (start and end of day in UTC)
            const selectedDateCopy = new Date(selectedDate);
            selectedDateCopy.setHours(0, 0, 0, 0);
            const dateStart = selectedDateCopy.toISOString();
            const dateEnd = new Date(selectedDateCopy);
            dateEnd.setHours(23, 59, 59, 999);
            const dateEndISO = dateEnd.toISOString();

            // Helper function to check if a meeting is on the selected date
            const isDateMeeting = (meeting: any): boolean => {
                const meetingStart = new Date(meeting.timeStart);
                return meetingStart >= new Date(dateStart) && meetingStart <= new Date(dateEndISO);
            };

            // Helper function to transform meeting to ZoomMeeting format
            const transformMeeting = (meeting: any): ZoomMeeting => {
                const startDate = new Date(meeting.timeStart);
                const endDate = new Date(meeting.timeEnd);
                const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

                return {
                    id: meeting.id,
                    topic: meeting.meetingTitle,
                    startTime: meeting.timeStart,
                    duration: durationMinutes,
                    joinUrl: meeting.joinUrl || '',
                    meetingId: meeting.zoomId || '',
                    hostName: meeting.requestedBy?.name || 'Unknown',
                    requestedById: meeting.requestedById || null,
                    internalAttendantIds: meeting.internalAttendantIds || [],
                };
            };

            // Create a map of host_id to meetings for quick lookup
            const meetingsByHostId = new Map<string | null, ZoomMeeting[]>();

            groupedMeetings.forEach((group: { id: string | null; meetings: any[] }) => {
                const dateMeetings = group.meetings
                    .filter(isDateMeeting)
                    .map(transformMeeting);

                if (dateMeetings.length > 0) {
                    meetingsByHostId.set(group.id, dateMeetings);
                }
            });

            // Map API response to ZoomAccount format and attach meetings
            const mappedAccounts: ZoomAccount[] = accountsData.map((account: any) => {
                const accountMeetings = meetingsByHostId.get(account.id) || [];
                return {
                    id: account.id,
                    accountName: account.accountName,
                    email: account.accountEmail,
                    status: account.accountStatus.toLowerCase() as "active" | "inactive" | "suspended",
                    planType: account.accountPlanType,
                    meetingsToday: accountMeetings,
                };
            });

            setAccounts(mappedAccounts);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch Zoom accounts");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch host key
    const fetchHostKey = async () => {
        try {
            setHostKeyLoading(true);
            const response = await fetch('/api/meeting/host-key', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setHostKey(data.hostKey || null);
            } else {
                console.error('Failed to fetch host key');
                setHostKey(null);
            }
        } catch (err) {
            console.error('Error fetching host key:', err);
            setHostKey(null);
        } finally {
            setHostKeyLoading(false);
        }
    };

    const handleCopyHostKey = async () => {
        if (!hostKey) return;
        try {
            await navigator.clipboard.writeText(hostKey);
            setHostKeyCopySuccess(true);
            setTimeout(() => setHostKeyCopySuccess(false), 3000);
        } catch (err) {
            console.error('Failed to copy host key:', err);
        }
    };

    // Initial load and refetch when selected date changes
    useEffect(() => {
        fetchZoomAccounts();
        fetchHostKey();
    }, [selectedDate]);

    const handleRefresh = () => {
        fetchZoomAccounts();
        fetchHostKey();
    };

    return (
        <Box
            sx={{
                px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
                py: 4,
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        p: 4,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #2D8CFF 0%, #1E6FD9 100%)",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    {/* Background Pattern */}
                    <Box
                        sx={{
                            position: "absolute",
                            right: -50,
                            top: -50,
                            width: 300,
                            height: 300,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.05)",
                            opacity: 0.5,
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            right: 100,
                            bottom: -30,
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.03)",
                            opacity: 0.5,
                        }}
                    />

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        {/* Top Section - Title and Icon */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                mb: 3,
                                flexWrap: { xs: "wrap", sm: "nowrap" },
                            }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 64, sm: 80 },
                                    height: { xs: 64, sm: 80 },
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backdropFilter: "blur(10px)",
                                    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <ZoomIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: "white" }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "white",
                                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                                        mb: 1,
                                    }}
                                >
                                    Zoom Accounts
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.9)",
                                        fontSize: { xs: "0.9rem", sm: "1rem" },
                                    }}
                                >
                                    Manage your Zoom accounts and view today's scheduled meetings
                                </Typography>
                            </Box>
                            {/* Current User Block */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {profileData && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            bgcolor: "rgba(255, 255, 255, 0.15)",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255, 255, 255, 0.2)",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: stringToColor(profileData.name),
                                                fontSize: 14,
                                                fontWeight: 700,
                                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                            }}
                                        >
                                            {getInitials(profileData.name)}
                                        </Avatar>
                                        <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "white",
                                                    fontWeight: 600,
                                                    fontSize: "0.875rem",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {profileData.name}
                                            </Typography>
                                            {profileData.role && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "rgba(255, 255, 255, 0.8)",
                                                        fontSize: "0.7rem",
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {profileData.role}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                                {/* Host Key Block */}
                                {hostKey && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            bgcolor: "rgba(255, 255, 255, 0.15)",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255, 255, 255, 0.2)",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                            },
                                        }}
                                    >
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "rgba(255, 255, 255, 0.8)",
                                                    fontSize: "0.7rem",
                                                    display: "block",
                                                    mb: 0.5,
                                                }}
                                            >
                                                Host Key
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "white",
                                                    fontWeight: 600,
                                                    fontSize: "0.875rem",
                                                    fontFamily: "monospace",
                                                    wordBreak: "break-all",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {hostKey}
                                            </Typography>
                                        </Box>
                                        <Tooltip title={hostKeyCopySuccess ? "Copied!" : "Copy host key"}>
                                            <IconButton
                                                onClick={handleCopyHostKey}
                                                size="small"
                                                sx={{
                                                    color: "white",
                                                    bgcolor: "rgba(255, 255, 255, 0.2)",
                                                    "&:hover": {
                                                        bgcolor: "rgba(255, 255, 255, 0.3)",
                                                    },
                                                }}
                                            >
                                                <CopyIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                {hostKeyLoading && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            bgcolor: "rgba(255, 255, 255, 0.15)",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255, 255, 255, 0.2)",
                                        }}
                                    >
                                        <CircularProgress size={16} sx={{ color: "white" }} />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "rgba(255, 255, 255, 0.8)",
                                                fontSize: "0.7rem",
                                            }}
                                        >
                                            Loading...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Bottom Section - Stats */}
                        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", mb: 3 }} />
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: { xs: "wrap", sm: "nowrap" },
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "white",
                                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                                        }}
                                    >
                                        {accounts.length}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.75rem" }}
                                    >
                                        Accounts
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "white",
                                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                                        }}
                                    >
                                        {accounts.reduce((sum, acc) => sum + acc.meetingsToday.length, 0)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.75rem" }}
                                    >
                                        {isToday(selectedDate) ? "Meetings Today" : `Meetings on ${format(selectedDate, "MMM d")}`}
                                    </Typography>
                                </Box>
                            </Box>
                            {lastUpdated && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <UpdateIcon sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.7)" }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "rgba(255, 255, 255, 0.8)",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        Last updated: {format(lastUpdated, "HH:mm:ss")}
                                    </Typography>
                                </Box>
                            )}
                            <Tooltip title="Refresh data">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={refreshing || loading}
                                    sx={{
                                        color: "white",
                                        bgcolor: "rgba(255, 255, 255, 0.15)",
                                        "&:hover": {
                                            bgcolor: "rgba(255, 255, 255, 0.25)",
                                        },
                                        "&:disabled": {
                                            bgcolor: "rgba(255, 255, 255, 0.1)",
                                            color: "rgba(255, 255, 255, 0.5)",
                                        },
                                    }}
                                >
                                    <RefreshIcon
                                        sx={{
                                            animation: refreshing ? "spin 1s linear infinite" : "none",
                                            "@keyframes spin": {
                                                "0%": { transform: "rotate(0deg)" },
                                                "100%": { transform: "rotate(360deg)" },
                                            },
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>
            </motion.div>

            {/* Date Filter and Create Meeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: { xs: "wrap", sm: "nowrap" },
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flexGrow: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="View Schedule"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setSelectedDate(newValue);
                                        }
                                    }}
                                    slotProps={{
                                        textField: {
                                            sx: {
                                                width: { xs: "100%", sm: 250 },
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                            {isToday(selectedDate) && (
                                <Chip
                                    label="Today"
                                    size="small"
                                    sx={{
                                        bgcolor: "#10b981",
                                        color: "white",
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Schedule New Meeting">
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenScheduleModal(true)}
                                    sx={{
                                        bgcolor: "#2D8CFF",
                                        "&:hover": {
                                            bgcolor: "#1E6FD9",
                                        },
                                        display: { xs: "none", sm: "flex" },
                                    }}
                                >
                                    Schedule Meeting
                                </Button>
                            </Tooltip>
                            <Tooltip title="Schedule New Meeting">
                                <IconButton
                                    onClick={() => setOpenScheduleModal(true)}
                                    sx={{
                                        color: "#2D8CFF",
                                        display: { xs: "flex", sm: "none" },
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Accounts Grid */}
            {!loading && !error && (
                <Grid2 container spacing={3}>
                    {accounts.map((account, index) => (
                        <Grid2 size={{ xs: 12, sm: 6, lg: 3 }} key={account.id}>
                            <AccountCard account={account} index={index} selectedDate={selectedDate} currentUserId={profileData?.id} />
                        </Grid2>
                    ))}
                </Grid2>
            )}

            {/* Schedule Meeting Modal */}
            <Dialog
                open={openScheduleModal}
                onClose={(event, reason) => {
                    // Prevent closing on backdrop click or escape key
                    if (reason === "backdropClick" || reason === "escapeKeyDown") {
                        return;
                    }
                    handleCloseModal();
                }}
                disableEscapeKeyDown
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle sx={{ pb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <ZoomIcon sx={{ color: "#2D8CFF" }} />
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            Schedule New Meeting
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {/* Step 1: Date and Time */}
                            <Step>
                                <StepLabel>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Select Date & Time
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <DatePicker
                                                    label="Meeting Date"
                                                    value={formData.startDate}
                                                    onChange={(newValue) => {
                                                        setFormData({ ...formData, startDate: newValue });
                                                        setError(null);
                                                    }}
                                                    minDate={new Date()}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                        },
                                                    }}
                                                />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <FormControl fullWidth required={formData.duration !== -1}>
                                                    <InputLabel>Meeting Time</InputLabel>
                                                    <Select
                                                        value={formData.startTime}
                                                        label="Meeting Time"
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, startTime: e.target.value });
                                                            setError(null);
                                                        }}
                                                        disabled={formData.duration === -1}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 300,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {timeOptions.map((time) => (
                                                            <MenuItem key={time} value={time}>
                                                                <Typography variant="body2">{time}</Typography>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {formData.duration === -1 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                                                            Time is not required for all-day meetings
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid2>
                                        </Grid2>
                                        <FormControl fullWidth>
                                            <InputLabel>Duration</InputLabel>
                                            <Select
                                                value={formData.duration}
                                                label="Duration"
                                                onChange={(e) => {
                                                    const newDuration = Number(e.target.value);
                                                    // Clear time when switching to all-day, or set default time when switching from all-day
                                                    if (newDuration === -1) {
                                                        setFormData({ ...formData, duration: newDuration, startTime: "" });
                                                    } else if (formData.duration === -1 && !formData.startTime) {
                                                        // If switching from all-day and no time is set, set a default time
                                                        setFormData({ ...formData, duration: newDuration, startTime: "09:00" });
                                                    } else {
                                                        setFormData({ ...formData, duration: newDuration });
                                                    }
                                                }}
                                            >
                                                <MenuItem value={15}>15 minutes</MenuItem>
                                                <MenuItem value={30}>30 minutes</MenuItem>
                                                <MenuItem value={45}>45 minutes</MenuItem>
                                                <MenuItem value={60}>1 hour</MenuItem>
                                                <MenuItem value={90}>1.5 hours</MenuItem>
                                                <MenuItem value={120}>2 hours</MenuItem>
                                                <MenuItem value={180}>3 hours</MenuItem>
                                                <MenuItem value={240}>4 hours</MenuItem>
                                                <MenuItem value={-1}>All Day</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {formData.startDate && (formData.duration === -1 || formData.startTime) && (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "#f5f5f5",
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {formData.duration === -1 ? "Selected Date:" : "Selected Time:"}
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {formData.duration === -1
                                                        ? format(formData.startDate, "EEEE, MMMM d, yyyy")
                                                        : format(getCombinedDateTime()!, "EEEE, MMMM d, yyyy 'at' HH:mm")}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Duration: {formData.duration === -1 ? "All Day (00:00 - 23:59)" : `${formData.duration} minutes`}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Box>
                                </StepContent>
                            </Step>

                            {/* Step 2: Account Selection */}
                            <Step>
                                <StepLabel>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Select Account
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Box sx={{ pt: 2 }}>
                                        {formData.startDate && (formData.duration === -1 || formData.startTime.trim()) ? (
                                            <>
                                                {getAvailableAccounts().length > 0 ? (
                                                    <FormControl fullWidth>
                                                        <InputLabel>Available Accounts</InputLabel>
                                                        <Select
                                                            value={formData.accountId}
                                                            label="Available Accounts"
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, accountId: e.target.value })
                                                            }
                                                            required
                                                        >
                                                            {getAvailableAccounts().map((account) => (
                                                                <MenuItem key={account.id} value={account.id}>
                                                                    <Box>
                                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                            {account.accountName}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {account.email} • {account.planType}
                                                                        </Typography>
                                                                    </Box>
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                                        No accounts are available at the selected time. Please choose a
                                                        different time slot.
                                                    </Alert>
                                                )}
                                                {getAvailableAccounts().length > 0 && formData.accountId && (
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mt: 2,
                                                            bgcolor: "#e8f5e9",
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            Selected Account:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {
                                                                accounts.find((acc) => acc.id === formData.accountId)
                                                                    ?.accountName
                                                            }
                                                        </Typography>
                                                    </Paper>
                                                )}
                                            </>
                                        ) : (
                                            <Alert severity="info">
                                                {formData.duration === -1
                                                    ? "Please select a date first to see available accounts."
                                                    : "Please select a date and time first to see available accounts."}
                                            </Alert>
                                        )}
                                    </Box>
                                </StepContent>
                            </Step>

                            {/* Step 3: Meeting Details */}
                            <Step>
                                <StepLabel>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Meeting Details
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                                        <TextField
                                            label="Meeting Topic"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            fullWidth
                                            required
                                            placeholder="e.g., Team Standup, Client Meeting"
                                        />
                                        <TextField
                                            label="Description (Optional)"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Add meeting agenda, notes, or other details..."
                                        />
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                                                Attendants
                                            </Typography>

                                            {/* Tabs for Email vs Internal */}
                                            <Tabs
                                                value={attendantTab}
                                                onChange={(_, newValue) => setAttendantTab(newValue)}
                                                sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
                                            >
                                                <Tab label="Email" />
                                                <Tab label="Internal Users" />
                                            </Tabs>

                                            {/* Email Attendants Tab */}
                                            {attendantTab === 0 && (
                                                <Box>
                                                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                                        <TextField
                                                            placeholder="Enter email address"
                                                            value={attendantInput}
                                                            onChange={(e) => setAttendantInput(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAddAttendant();
                                                                }
                                                            }}
                                                            size="small"
                                                            fullWidth
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleAddAttendant}
                                                            disabled={!attendantInput.trim()}
                                                        >
                                                            Add
                                                        </Button>
                                                    </Box>
                                                    {formData.emailAttendants.length > 0 && (
                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                                                            {formData.emailAttendants.map((email) => (
                                                                <Chip
                                                                    key={email}
                                                                    label={email}
                                                                    onDelete={() => handleRemoveEmailAttendant(email)}
                                                                    size="small"
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}

                                            {/* Internal Attendants Tab */}
                                            {attendantTab === 1 && (
                                                <Box>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<PersonIcon />}
                                                        onClick={() => {
                                                            setPersonnelModalOpen(true);
                                                            if (availablePersonnel.length === 0) {
                                                                loadPersonnel();
                                                            }
                                                        }}
                                                        fullWidth
                                                        sx={{ mb: 2 }}
                                                    >
                                                        Add Internal User
                                                    </Button>
                                                    {formData.internalAttendants.length > 0 && (
                                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                            {formData.internalAttendants.map((attendant) => (
                                                                <Paper
                                                                    key={attendant.id}
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        border: "1px solid",
                                                                        borderColor: "divider",
                                                                        borderRadius: 1,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                        <Avatar
                                                                            src={attendant.avatar}
                                                                            sx={{ width: 32, height: 32 }}
                                                                        >
                                                                            {attendant.name.charAt(0)}
                                                                        </Avatar>
                                                                        <Box>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                {attendant.name}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {attendant.email} • {attendant.role}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleRemoveInternalAttendant(attendant.id)}
                                                                    >
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Paper>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                bgcolor: "#f5f5f5",
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Meeting Summary:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {formData.topic || "Untitled Meeting"}
                                            </Typography>
                                            {formData.startDate && (formData.duration === -1 || formData.startTime) && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                                    {formData.duration === -1
                                                        ? format(formData.startDate, "MMM d, yyyy") + " • All Day (00:00 - 23:59)"
                                                        : format(getCombinedDateTime()!, "MMM d, yyyy 'at' HH:mm") + ` • ${formData.duration} min`}
                                                </Typography>
                                            )}
                                            {formData.accountId && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                                    Account: {accounts.find((acc) => acc.id === formData.accountId)?.accountName}
                                                </Typography>
                                            )}
                                            {(formData.emailAttendants.length > 0 || formData.internalAttendants.length > 0) && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                                        Attendants:
                                                    </Typography>
                                                    {formData.emailAttendants.length > 0 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                            {formData.emailAttendants.length} email(s)
                                                        </Typography>
                                                    )}
                                                    {formData.internalAttendants.length > 0 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                            {formData.internalAttendants.length} internal user(s)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Paper>
                                    </Box>
                                </StepContent>
                            </Step>
                        </Stepper>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseModal} color="inherit">
                        Cancel
                    </Button>
                    {activeStep > 0 && (
                        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                            Back
                        </Button>
                    )}
                    {activeStep < 2 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={<ArrowForwardIcon />}
                            disabled={
                                (activeStep === 0 && (!formData.startDate || (formData.duration !== -1 && !formData.startTime.trim()))) ||
                                (activeStep === 1 && !formData.accountId)
                            }
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                            disabled={submitting}
                        >
                            {submitting ? "Scheduling..." : "Schedule Meeting"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Internal Personnel Selection Modal */}
            <DocumentPersonnelModal
                open={personnelModalOpen}
                onClose={() => setPersonnelModalOpen(false)}
                personnel={filteredPersonnel}
                onSelectPersonnel={handleInternalPersonnelSelect}
                loading={personnelLoading}
                error={personnelError}
                onSearch={handlePersonnelSearch}
            />
        </Box>
    );
}

