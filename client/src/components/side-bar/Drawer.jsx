'use client';

import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  CalendarToday,
  People,
  Settings,
  ChevronLeft,
  Class,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useMemo } from 'react';
import { ROLES } from '@/utils/const';
const drawerWidth = 240;

const menuItems = [
  { text: 'Schedules', icon: <CalendarToday />, path: '/schedules' },
  { text: 'Groups', icon: <Class />, path: '/groups' },
  { text: 'Staffs', icon: <People />, path: '/staffs' },
];

export default function Drawer({ mobileOpen, onDrawerToggle }) {
  const router = useRouter();

  const [user] = useUser();

  const menuItemsFiltered = useMemo(() => {
    if (user?.role !== ROLES.LEADER) {
      return menuItems.filter((item) => {
        return item.path !== '/staffs';
      });
    }
    return menuItems;
  }, [user?.role]);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Calendar App
        </Typography>
        <IconButton onClick={onDrawerToggle}>
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItemsFiltered.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => router.push(item.path)}
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => router.push('/account')}
            sx={{
              minHeight: 48,
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
              }}
            >
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </MuiDrawer>
      <MuiDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </MuiDrawer>
    </Box>
  );
} 