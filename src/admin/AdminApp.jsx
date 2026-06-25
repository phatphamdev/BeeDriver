import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const DRAWER_WIDTH = 240;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#F5A623' },
    background: { default: '#0F1923', paper: '#1A2636' },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
});

const NAV_ITEMS = [
  { label: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Quản lý tài xế', icon: <PeopleIcon />, path: '/admin/drivers' },
];

export default function AdminApp() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#0F1923">
        <CircularProgress sx={{ color: '#F5A623' }} />
      </Box>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1A2636' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #F5A623, #D4891C)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
            }}
          >
            🐝
          </Box>
          <Box>
            <Typography fontWeight={800} sx={{ color: '#F5A623', lineHeight: 1 }}>
              BeeDriver
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  background: isActive ? 'rgba(245, 166, 35, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(245,166,35,0.3)' : '1px solid transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? '#F5A623' : 'rgba(255,255,255,0.45)', minWidth: 36 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 400,
                    fontSize: '0.875rem',
                    color: isActive ? '#F5A623' : 'rgba(255,255,255,0.7)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info at bottom */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#F5A623', color: '#0F1923', fontSize: '0.875rem' }}>
            {user.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
              {user.email}
            </Typography>
            <Typography variant="caption" sx={{ color: '#F5A623', fontSize: '0.65rem' }}>
              Quản trị viên
            </Typography>
          </Box>
          <Tooltip title="Đăng xuất">
            <IconButton onClick={handleSignOut} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#EF4444' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0F1923' }}>
        {/* Mobile AppBar */}
        <AppBar
          position="fixed"
          sx={{
            display: { md: 'none' },
            background: '#1A2636',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: 'rgba(255,255,255,0.7)', mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography fontWeight={800} sx={{ color: '#F5A623' }}>🐝 BeeDriver</Typography>
          </Toolbar>
        </AppBar>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            mt: { xs: '56px', md: 0 },
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
