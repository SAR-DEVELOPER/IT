"use client";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Grid2,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  People as PeopleIcon,
  PersonAdd as RecruitmentIcon,
  Assessment as PerformanceIcon,
  School as TrainingIcon,
  Payment as PayrollIcon,
  Event as AttendanceIcon,
  TrendingUp as AnalyticsIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  WorkHistory as CareerIcon,
  LocalHospital as BenefitsIcon,
  Badge as BadgeIcon,
  RocketLaunch as RocketIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import UserInfoSidebar from "../components/ui/UserInfoSidebar";

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

// Main Template Dashboard Page
export default function TemplateDashboard() {
  const theme = useTheme();
  const router = useRouter();

  // Handle module card clicks
  const handleModuleClick = (urlTarget: string) => {
    router.push(urlTarget);
  };

  // Example business modules (all disabled in template)
  const businessModules = [
    {
      title: "Employee Management",
      description: "Manage employee profiles, data, and records",
      urlTarget: "/employees",
      icon: <PeopleIcon />,
      color: "#1976d2",
      badge: "Core",
      available: false,
    },
    {
      title: "Recruitment",
      description: "Manage job postings, candidates, and hiring process",
      urlTarget: "/recruitment",
      icon: <RecruitmentIcon />,
      color: "#388e3c",
      badge: "Hiring",
      available: false,
    },
    {
      title: "Performance Management",
      description: "Track and evaluate employee performance",
      urlTarget: "/performance",
      icon: <PerformanceIcon />,
      color: "#7b1fa2",
      badge: "Review",
      available: false,
    },
    {
      title: "Training & Development",
      description: "Manage training programs and employee development",
      urlTarget: "/training",
      icon: <TrainingIcon />,
      color: "#f57c00",
      badge: "Learning",
      available: false,
    },
    {
      title: "Payroll Management",
      description: "Process payroll, benefits, and compensation",
      urlTarget: "/payroll",
      icon: <PayrollIcon />,
      color: "#2e7d32",
      badge: "Finance",
      available: false,
    },
    {
      title: "Attendance & Leave",
      description: "Track attendance, leave requests, and schedules",
      urlTarget: "/attendance",
      icon: <AttendanceIcon />,
      color: "#0288d1",
      badge: "Time",
      available: false,
    },
    {
      title: "Employee Self-Service",
      description: "Employee portal for personal information and requests",
      urlTarget: "/self-service",
      icon: <BadgeIcon />,
      color: "#5c6bc0",
      badge: "Portal",
      available: false,
    },
    {
      title: "Analytics & Reports",
      description: "View business metrics, reports, and insights",
      urlTarget: "/analytics",
      icon: <AnalyticsIcon />,
      color: "#d32f2f",
      badge: "Insights",
      available: false,
    },
    {
      title: "Career Development",
      description: "Manage career paths and succession planning",
      urlTarget: "/career",
      icon: <CareerIcon />,
      color: "#e64a19",
      badge: "Growth",
      available: false,
    },
    {
      title: "Benefits Administration",
      description: "Manage employee benefits and wellness programs",
      urlTarget: "/benefits",
      icon: <BenefitsIcon />,
      color: "#00838f",
      badge: "Wellness",
      available: false,
    },
    {
      title: "Team Management",
      description: "Organize teams, departments, and reporting structures",
      urlTarget: "/teams",
      icon: <TeamIcon />,
      color: "#3c5a96",
      badge: "Structure",
      available: false,
    },
    {
      title: "Settings",
      description: "Configure policies, workflows, and preferences",
      urlTarget: "/settings",
      icon: <SettingsIcon />,
      color: "#607d8b",
      badge: "Config",
      available: false,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid2 container spacing={3}>
        {/* Main Content - Left Side */}
        <Grid2 size={{ xs: 12, md: 9 }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <RocketIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    SAR Module Template
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    A production-ready Next.js template for business applications
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>

          {/* Getting Started Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: "bold" }}>Welcome to SAR Module Template!</AlertTitle>
              This is a clean, production-ready template with:
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li><strong>Authentication:</strong> Cookie-based SSO with Keycloak</li>
                <li><strong>Configuration:</strong> Centralized, type-safe environment management</li>
                <li><strong>API Layer:</strong> Proxy pattern with automatic cookie forwarding</li>
                <li><strong>UI Components:</strong> Material-UI with custom theme</li>
                <li><strong>Examples:</strong> Client & Identity management features included</li>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                📚 See <strong>TEMPLATE_USAGE.md</strong> for setup instructions and <strong>CLAUDE.md</strong> for development guidelines.
              </Typography>
            </Alert>
          </motion.div>

          {/* Business Modules Grid */}
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              Example Business Modules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Below are example module cards. Customize these for your business needs. Currently all modules are disabled as examples.
            </Typography>

            <Grid2 container spacing={3}>
              {businessModules.map((module, index) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <ModuleCard {...module} onClick={handleModuleClick} />
                  </motion.div>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Grid2>

        {/* Sidebar - Right Side */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <UserInfoSidebar />
          </motion.div>
        </Grid2>
      </Grid2>
    </Container>
  );
}
