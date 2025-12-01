'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, IconButton,
  Typography, List, ListItemText, Button,
  ListItemButton
} from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/app/utils/apiClient';
import Navbar from './Navbar';

const drawerWidth = 200;

// Define props interface
interface ResponsiveLayoutProps {
  children: React.ReactNode;
}
type ValidPaths = '/finance' | '/test-maker' | '/user' | '/group' | '/auth/login' | '/auth/register' | '/settings' | '/' ;

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { loading, token, role } = useAuth()
  const [favGroups, setFavGroups] = useState<{ id: string; name: string }[]>([])
  // console.log('role', role)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  let menuItems = [];

// Dummy menu items
if (role === 'SuperAdmin') {
  
  menuItems =  [
    { label: 'Dashboard', path: '/', description: 'Watch Analytics' },
    { label: 'Finance', path: '/finance', description: 'Manage Finance' },
    { label: 'Test', path: '/test-maker', description: 'Test Maker' },
    { label: 'User', path: '/user', description: 'Manage User' },
    { label: 'Settings', path: '/settings', description: 'Organisation Setting' },
    { label: 'Group', path: '/group', description: 'Manage Group' },
  ];
}
else if (role === 'Admin' || role === 'Finance') {
  
  menuItems =  [
    { label: 'Dashboard', path: '/', description: 'Watch Analytics' },
    { label: 'Finance', path: '/finance', description: 'Manage Finance' },
    { label: 'Test', path: '/test-maker', description: 'Test Maker' },
    { label: 'User', path: '/user', description: 'Manage User' },
    { label: 'Settings', path: '/settings', description: 'Organisation Setting' },
    { label: 'Group', path: '/group', description: 'Manage Group' },
  ];
} else if (role === 'Moderator' || role === 'Editor') {
  menuItems = [
    { label: 'Test', path: '/test-maker', description: 'Test Maker' },
    { label: 'User', path: '/user', description: 'Manage User' },
    { label: 'Settings', path: '/settings', description: 'Organisation Setting' },
    { label: 'Group', path: '/group', description: 'Manage Group' },
    { label: 'Dashboard', path: '/', description: 'Watch Analytics' },
  ];
} else {
  menuItems = [
    { label: 'Group', path: '/group', description: 'Manage Group' },
    { label: 'Dashboard', path: '/', description: 'Watch Analytics' },
  ];
}


  // Dummy functions
  const handleLogout = () => console.log('Logging out...');
  // const router = { push: (path: ValidPaths | '#') => console.log(`Navigating to: ${path}`) };
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
      if (!token && loading) {
        router.push('/auth/login');
      }
      setMounted(true);
  }, [token, loading, router]);

  useEffect(() => {
      async function fetchFavorites() {
        const res = await apiClient('/api/user/favorites');
        if (!res) return; 
        const data = await res.json();
        setFavGroups(data.favorites  || []);
      }
      fetchFavorites();
    }, []);

  return (
    mounted && token && (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

      <Navbar handleDrawerToggle={handleDrawerToggle} />
      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'primary.dark',
            backgroundImage: 'linear-gradient(45deg, #1a237e 0%, #311b92 100%)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              onClick={() => router.push('/')}
              sx={{
                bgcolor: 'white',
                color: 'primary.dark',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mr: 1,
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}>
              EquaSeed
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Portal
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                if (item.label === 'Logout') handleLogout();
                else if (item.path){
                  router.push(item.path as  ValidPaths)
                } ;
              }}
              sx={{
                py: 1.5,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <ListItemText
                primary={<Typography fontWeight="500" color="white">{item.label}</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {item.description}
                </Typography>}
              />
            </ListItemButton>
          ))}
            {favGroups.map((group) => (
              <ListItemButton key={group.id} onClick={()=>router.push(`/group/${group.id}`)} sx={{ color: '#fff' }}>
                {group.name}
              </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Desktop sidebar - Persistent and always visible */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'primary.dark',
            backgroundImage: 'linear-gradient(45deg, #1a237e 0%, #311b92 100%)',
            borderRight: 'none',
          },
        }}
        open
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            onClick={() => router.push('/')}
            sx={{
              bgcolor: 'white',
              color: 'primary.dark',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              mr: 1,
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}>
            EquaSeed
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Portal
          </Typography>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                if (item.label === 'Logout') handleLogout();
                else if (item.path) router.push(item.path as ValidPaths);
              }}
              sx={{
                py: 1.5,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <ListItemText
                primary={<Typography fontWeight="500" color="white">{item.label}</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {item.description}
                </Typography>}
              />
            </ListItemButton>
          ))}
          
            {favGroups.map((group) => (
              <ListItemButton key={group.id} onClick={()=>router.push(`/group/${group.id}`)} sx={{color: '#fff' }}>
                {group.name}
              </ListItemButton>
          ))}

        </List>
      </Drawer>

      {/* Main content area where children will be rendered */}
      <Box component="main" sx={{
        flexGrow: 1,
        // p: 3,
        width: { md: `calc(100% - ${drawerWidth}px)` },
      }}>
        <Toolbar />
        {children} {/* This is where your page content will be injected */}
      </Box>
    </Box>
    ) 
  );
};

export default ResponsiveLayout;