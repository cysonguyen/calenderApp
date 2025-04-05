'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@/components/AppBar';
import Drawer from '@/components/Drawer';
import '../globals.css';

export default function ProtectedLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar onDrawerToggle={handleDrawerToggle} />
      <Drawer mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 