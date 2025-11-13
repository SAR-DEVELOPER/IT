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
  ConfirmationNumber as TicketIcon,
  MenuBook as KnowledgeIcon,
  Monitor as MonitorIcon,
  Inventory as AssetIcon,
  Key as LicenseIcon,
  Security as SecurityIcon,
  Cable as NetworkIcon,
  Storage as ServerIcon,
  Backup as BackupIcon,
  AdminPanelSettings as AccessIcon,
  Insights as AnalyticsIcon,
  Computer as ITIcon,
  Speed as PerformanceIcon,
  Cloud as CloudIcon,
  VideoCall as VideoCallIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ITSidebar from "../components/ui/ITSidebar";

// Module Card Component
interface ModuleItemProps {
  title: string;
  description: string;
  urlTarget: string;
  icon: React.ReactNode;
  color: string;
  onClick: (urlTarget: string) => void;
  badge?: string;
  available?: boolean;
}

const ModuleCard: React.FC<ModuleItemProps> = ({
  title,
  description,
  urlTarget,
  icon,
  color,
  onClick,
  badge = "Coming Soon",
  available = false,
}) => {
  return (
    <motion.div whileHover={available ? { y: -5 } : {}} whileTap={available ? { scale: 0.98 } : {}}>
      <Paper
        onClick={() => available && onClick(urlTarget)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "visible",
          position: "relative",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.08)",
          cursor: available ? "pointer" : "not-allowed",
          opacity: available ? 1 : 0.5,
          "&:hover": {
            boxShadow: available ? "0px 8px 25px rgba(0, 0, 0, 0.15)" : "0px 5px 15px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ pt: 5, px: 3, pb: 3, flexGrow: 1 }}>
          <Box sx={{ height: "70px" }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ mt: 1, fontWeight: "bold" }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: `${color}15`,
                color: color,
                fontWeight: "medium",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
              }}
            >
              {badge}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Main IT Dashboard Page
export default function ITDashboard() {
  const router = useRouter();

  // Handle module card clicks
  const handleModuleClick = (urlTarget: string) => {
    router.push(urlTarget);
  };

  // IT modules
  const itModules = [
    {
      title: "Meetings",
      description: "Schedule and join video meetings with Zoom and Teams",
      urlTarget: "/meeting",
      icon: <VideoCallIcon />,
      color: "#2D8CFF",
      badge: "Live",
      available: true,
    },
    {
      title: "IT Help Desk",
      description: "Submit and track IT support tickets and requests",
      urlTarget: "/helpdesk",
      icon: <TicketIcon />,
      color: "#1976d2",
      badge: "Support",
      available: false,
    },
    {
      title: "Knowledge Base",
      description: "Access IT documentation, guides, and solutions",
      urlTarget: "/knowledge",
      icon: <KnowledgeIcon />,
      color: "#7b1fa2",
      badge: "KMS",
      available: false,
    },
    {
      title: "Infrastructure Status",
      description: "Monitor system health, uptime, and performance",
      urlTarget: "/infrastructure",
      icon: <MonitorIcon />,
      color: "#2e7d32",
      badge: "Live",
      available: false,
    },
    {
      title: "Asset Management",
      description: "Track hardware, devices, and IT equipment",
      urlTarget: "/assets",
      icon: <AssetIcon />,
      color: "#f57c00",
      badge: "Inventory",
      available: false,
    },
    {
      title: "Software Licenses",
      description: "Manage software licenses, renewals, and compliance",
      urlTarget: "/licenses",
      icon: <LicenseIcon />,
      color: "#d32f2f",
      badge: "Licenses",
      available: false,
    },
    {
      title: "Security Center",
      description: "Security alerts, compliance, and audit logs",
      urlTarget: "/security",
      icon: <SecurityIcon />,
      color: "#c62828",
      badge: "Security",
      available: false,
    },
    {
      title: "Network Management",
      description: "Monitor network topology, bandwidth, and connectivity",
      urlTarget: "/network",
      icon: <NetworkIcon />,
      color: "#00838f",
      badge: "Network",
      available: false,
    },
    {
      title: "Server Management",
      description: "Manage servers, containers, and virtual machines",
      urlTarget: "/servers",
      icon: <ServerIcon />,
      color: "#5c6bc0",
      badge: "Servers",
      available: false,
    },
    {
      title: "Backup & Recovery",
      description: "Configure backups, disaster recovery, and restores",
      urlTarget: "/backup",
      icon: <BackupIcon />,
      color: "#388e3c",
      badge: "Backup",
      available: false,
    },
    {
      title: "Access Management",
      description: "Manage user permissions, roles, and access control",
      urlTarget: "/access",
      icon: <AccessIcon />,
      color: "#e64a19",
      badge: "IAM",
      available: false,
    },
    {
      title: "Cloud Services",
      description: "Monitor cloud resources, costs, and deployments",
      urlTarget: "/cloud",
      icon: <CloudIcon />,
      color: "#0288d1",
      badge: "Cloud",
      available: false,
    },
    {
      title: "IT Analytics",
      description: "Reports, metrics, and insights on IT operations",
      urlTarget: "/analytics",
      icon: <AnalyticsIcon />,
      color: "#6a1b9a",
      badge: "Insights",
      available: false,
    },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }, py: 4 }}>
      <Grid2 container spacing={3}>
        {/* Main Content - Left Side */}
        <Grid2 size={{ xs: 12, lg: 9 }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <ITIcon sx={{ fontSize: 48, color: "#1976d2" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                    IT Services Portal
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access IT support, resources, and tools all in one place
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>

          {/* Service Status Banner */}
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
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                    <PerformanceIcon />
                    IT Services Status
                  </Typography>
                  <Chip
                    label="All Services Available"
                    sx={{
                      bgcolor: "#10b981",
                      color: "white",
                      fontWeight: "bold",
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  />
                </Box>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Avg Response Time</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>2.5 hrs</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>My Open Tickets</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>3</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Knowledge Articles</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>248</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>System Health</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>99.8%</Typography>
                  </Grid2>
                </Grid2>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  right: -30,
                  bottom: -30,
                  opacity: 0.08,
                }}
              >
                <ITIcon sx={{ fontSize: 200 }} />
              </Box>
            </Paper>
          </motion.div>

          {/* IT Services Grid */}
          <Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold", color: "#1e3a8a" }}>
              Available Services
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Access IT support, resources, and tools. Need help? Start by submitting a ticket or browsing our knowledge base.
            </Typography>

            <Grid2 container spacing={3}>
              {itModules.map((module, index) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                  >
                    <ModuleCard {...module} onClick={handleModuleClick} />
                  </motion.div>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Grid2>

        {/* Sidebar - Right Side */}
        <Grid2 size={{ xs: 12, lg: 3 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ITSidebar />
          </motion.div>
        </Grid2>
      </Grid2>
    </Box>
  );
}
