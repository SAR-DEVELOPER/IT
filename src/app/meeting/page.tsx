"use client";
import { motion } from "framer-motion";
import {
    Box,
    Typography,
    Paper,
    Grid2,
    Chip,
} from "@mui/material";
import {
    VideoCall as ZoomIcon,
    Groups as TeamsIcon,
    Apps as MiscIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import { Meeting } from "@/lib/api/services/meeting";

// Meeting Platform Button Component
interface MeetingButtonProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}

const MeetingButton: React.FC<MeetingButtonProps> = ({
    title,
    icon,
    color,
    onClick,
}) => {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                onClick={onClick}
                sx={{
                    height: { xs: "200px", sm: "250px", md: "300px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    cursor: "pointer",
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    color: "white",
                    boxShadow: `0px 8px 24px ${color}40`,
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                        boxShadow: `0px 12px 32px ${color}60`,
                    },
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255, 255, 255, 0.1)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                        opacity: 1,
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        zIndex: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: 80, sm: 100, md: 120 },
                            height: { xs: 80, sm: 100, md: 120 },
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </Paper>
        </motion.div>
    );
};

// Active Meetings Component
const ActiveMeetingsCard = () => {
    const [activeMeetings, setActiveMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveMeetings = async () => {
            try {
                const response = await fetch("/api/meeting");
                if (!response.ok) {
                    throw new Error("Failed to fetch meetings");
                }
                const groupedMeetings = await response.json();

                // Flatten all meetings from all groups
                const allMeetings: Meeting[] = [];
                groupedMeetings.forEach((group: { meetings: Meeting[] }) => {
                    allMeetings.push(...group.meetings);
                });

                // Filter active meetings (currently ongoing)
                const now = new Date();
                const active = allMeetings.filter((meeting) => {
                    const startTime = parseISO(meeting.timeStart);
                    const endTime = parseISO(meeting.timeEnd);
                    return now >= startTime && now <= endTime;
                });

                setActiveMeetings(active);
            } catch (error) {
                console.error("Error fetching active meetings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveMeetings();
        // Refresh every minute
        const interval = setInterval(fetchActiveMeetings, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return null;
    }

    if (activeMeetings.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    background: "linear-gradient(135deg, #10b98108 0%, #10b98105 100%)",
                    maxWidth: "1200px",
                    width: "100%",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <ZoomIcon sx={{ color: "#10b981", fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e3a8a" }}>
                        Active Meetings
                    </Typography>
                    <Chip
                        label={activeMeetings.length}
                        size="small"
                        sx={{
                            bgcolor: "#10b981",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.65rem",
                            height: 20,
                            ml: "auto",
                        }}
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {activeMeetings.map((meeting) => (
                        <Paper
                            key={meeting.id}
                            elevation={0}
                            onClick={() => meeting.joinUrl && window.open(meeting.joinUrl, "_blank")}
                            sx={{
                                p: 1.5,
                                border: "1px solid #10b98130",
                                borderRadius: 2,
                                bgcolor: "#10b98108",
                                cursor: meeting.joinUrl ? "pointer" : "default",
                                "&:hover": {
                                    bgcolor: meeting.joinUrl ? "#10b98112" : "#10b98108",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: "#10b981",
                                    mb: 0.5,
                                    fontSize: "0.875rem",
                                }}
                            >
                                {meeting.meetingTitle}
                            </Typography>
                            {meeting.joinUrl && (
                                <Chip
                                    label="Join"
                                    size="small"
                                    sx={{
                                        bgcolor: "#10b981",
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "0.65rem",
                                        height: 18,
                                        mt: 0.5,
                                    }}
                                />
                            )}
                        </Paper>
                    ))}
                </Box>
            </Paper>
        </motion.div>
    );
};

// Main Meeting Page
export default function MeetingPage() {
    const router = useRouter();

    const handleZoomClick = () => {
        router.push("/meeting/zoom");
    };

    const handleTeamsClick = () => {
        // TODO: Implement Microsoft Teams integration
        console.log("Microsoft Teams clicked");
    };

    const handleMiscClick = () => {
        // TODO: Implement misc meeting options
        console.log("Misc meeting clicked");
    };

    return (
        <Box
            sx={{
                px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
                py: 4,
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Active Meetings */}
            <ActiveMeetingsCard />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 6, textAlign: "center" }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: "bold",
                            color: "#1e3a8a",
                            mb: 2,
                            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                        }}
                    >
                        Meeting Platforms
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
                    >
                        Choose your preferred meeting platform
                    </Typography>
                </Box>
            </motion.div>

            {/* Meeting Buttons Grid */}
            <Grid2 container spacing={4} sx={{ maxWidth: "1200px", width: "100%" }}>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <MeetingButton
                        title="Zoom Meetings"
                        icon={<ZoomIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 } }} />}
                        color="#2D8CFF"
                        onClick={handleZoomClick}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <MeetingButton
                        title="Microsoft Teams"
                        icon={<TeamsIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 } }} />}
                        color="#6264A7"
                        onClick={handleTeamsClick}
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <MeetingButton
                        title="Misc"
                        icon={<MiscIcon sx={{ fontSize: { xs: 48, sm: 60, md: 72 } }} />}
                        color="#6366F1"
                        onClick={handleMiscClick}
                    />
                </Grid2>
            </Grid2>
        </Box>
    );
}

