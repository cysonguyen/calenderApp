'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@/components/header/AppBar';
import Drawer from '@/components/side-bar/Drawer';
import '../globals.css';
import useNotification from '@/hooks/useNotification';
import { Alert, Snackbar } from '@mui/material';
export default function ProtectedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { notification } = useNotification();
  const [openNotification, setOpenNotification] = useState(false);
  const handleCloseNotification = () => {
    setOpenNotification(false);
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (notification) {
      setOpenNotification(true);
    }
  }, [notification]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar onDrawerToggle={handleDrawerToggle} />
      <Drawer mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingTop: 8,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        {children}
        <br />
        <br />

        {
          notification && (
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              open={openNotification}
              autoHideDuration={3000}
              onClose={handleCloseNotification}
            >
              <Alert severity={'info'}>{notification?.message}</Alert>
            </Snackbar>
          )
        }
      </Box>
    </Box>
  );
} 