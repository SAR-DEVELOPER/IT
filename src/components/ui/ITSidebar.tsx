// components/ui/ITSidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Divider,
    Stack,
    Skeleton,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Badge,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    ConfirmationNumber as TicketIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Help as HelpIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
}

/**
 * ITSidebar Component
 * Displays user information and quick IT actions
 */
export default function ITSidebar() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch('/api/auth/profile', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch profile: ${res.status}`);
                }

                const data = await res.json();

                if (data && (data.identity || data.jwt)) {
                    const identity = data.identity || {};
                    const jwt = data.jwt || {};

                    setProfileData({
                        id: identity.id || "",
                        name: identity.name || jwt.name || "User",
                        email: identity.email || jwt.email || "",
                        role: identity.jobTitle || jwt.role || "",
                        department: identity.department || ""
                    });
                    setError(null);
                } else {
                    throw new Error('Invalid profile data structure');
                }
            } catch (err) {
                console.error('Failed to load profile in sidebar:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

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

    if (loading) {
        return (
            <Box sx={{ position: 'sticky', top: 24 }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2} alignItems="center">
                            <Skeleton variant="circular" width={64} height={64} />
                            <Skeleton variant="text" width="80%" height={24} />
                            <Skeleton variant="text" width="60%" height={20} />
                            <Divider sx={{ width: '100%', my: 2 }} />
                            <Skeleton variant="rectangular" width="100%" height={100} />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (error || !profileData) {
        return (
            <Box sx={{ position: 'sticky', top: 24 }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Not logged in
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const avatarColor = stringToColor(profileData.name);

    return (
        <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
                {/* User Profile Card */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`,
                            p: 3,
                            textAlign: 'center',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'white',
                                color: '#1e3a8a',
                                fontSize: 24,
                                fontWeight: 700,
                                margin: '0 auto',
                                mb: 1.5,
                                border: '3px solid rgba(255,255,255,0.3)',
                            }}
                        >
                            {getInitials(profileData.name)}
                        </Avatar>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                            {profileData.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {profileData.role || 'User'}
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    EMAIL
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                    {profileData.email}
                                </Typography>
                            </Box>
                            {profileData.department && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        DEPARTMENT
                                    </Typography>
                                    <Typography variant="body2">
                                        {profileData.department}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1e3a8a' }}>
                            Quick Actions
                        </Typography>
                        <Stack spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                fullWidth
                                sx={{
                                    justifyContent: 'flex-start',
                                    bgcolor: '#1976d2',
                                    '&:hover': { bgcolor: '#1565c0' }
                                }}
                            >
                                New Ticket
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<TicketIcon />}
                                fullWidth
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                My Tickets
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<HelpIcon />}
                                fullWidth
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Knowledge Base
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Notifications Card */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                                Recent Activity
                            </Typography>
                            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                                <NotificationsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            </Badge>
                        </Box>
                        <List sx={{ p: 0 }}>
                            <ListItem sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <TicketIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography variant="caption" sx={{ fontWeight: 600 }}>Ticket #1234 resolved</Typography>}
                                    secondary={<Typography variant="caption" color="text.secondary">2 hours ago</Typography>}
                                />
                            </ListItem>
                            <ListItem sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <NotificationsIcon sx={{ fontSize: 18, color: '#f57c00' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography variant="caption" sx={{ fontWeight: 600 }}>Server maintenance tonight</Typography>}
                                    secondary={<Typography variant="caption" color="text.secondary">5 hours ago</Typography>}
                                />
                            </ListItem>
                            <ListItem sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <HistoryIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography variant="caption" sx={{ fontWeight: 600 }}>Knowledge article updated</Typography>}
                                    secondary={<Typography variant="caption" color="text.secondary">1 day ago</Typography>}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}
