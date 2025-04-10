'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@/components/header/AppBar';
import Drawer from '@/components/side-bar/Drawer';
import '../globals.css';

export default function ProtectedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
      </Box>
    </Box>
  );
} 