'use client';

import { useMemo, useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  InputBase,
  alpha,
  Popover,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings,
  Logout,
  Search as SearchIcon,
  CheckCircle,
  CheckCircleOutline,
  FiberManualRecord,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { getNotificationApi, updateSeenNotificationApi } from '@/app/api/client/notification';
import { useQuery, useQueryClient } from '@tanstack/react-query';
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function AppBar({ onDrawerToggle }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();
  const [user, _update, isInitialized] = useUser();
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const [anchorElNotification, setAnchorElNotification] = useState(null);
  const queryClient = useQueryClient();
  const { data, isLoading: isLoadingNotification } = useQuery({
    queryKey: ['notification', user?.id],
    queryFn: () => getNotificationApi({ userId: user?.id }),
    enabled: isInitialized,
  });

  const handleReadNotification = async () => {
    const res = await updateSeenNotificationApi({ userId: user?.id });
    if (!res?.error) {
      queryClient.invalidateQueries({ queryKey: ['notification', user?.id] });
    }
  }

  const { unreadNotificationsSize, notifications } = useMemo(() => {
    if (!data) return { unreadNotificationsSize: 0, notifications: [] };
    const { notifications, count } = data;
    if (!Array.isArray(notifications) || !notifications.length) return { unreadNotificationsSize: 0, notifications: [] };
    return { unreadNotificationsSize: notifications.filter((notification) => !notification.seen).length, notifications: notifications.slice(0, 5) };
  }, [data]);

  const handleOpenNotification = (event) => {
    setAnchorElNotification(event.currentTarget);
    if (unreadNotificationsSize) {
      handleReadNotification();
    }
    setOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  console.log('notification', data);

  return (
    <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Calendar App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton id="popover-notification" color="inherit" onClick={handleOpenNotification}>
            <Badge badgeContent={unreadNotificationsSize ? '!' : null} color="error">
              <NotificationsIcon />
            </Badge>

          </IconButton>
          <Popover
            className='w-[1000px]'
            id={`popover-notification`}
            open={open}
            onClose={handleClose}
            anchorEl={anchorElNotification}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 1, alignItems: 'flex-start', width: '300px' }}>
              {notifications.length ? notifications?.map((notification) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }} key={notification.id}>
                  <Box>
                    {notification.seen ? <FiberManualRecord sx={{ color: 'green', fontSize: 12 }} /> : <FiberManualRecord sx={{ color: 'red', fontSize: 12 }} />}
                  </Box>
                  <Typography>{notification.message}</Typography>
                </Box>
              )) : (
                <Typography>No notifications !!</Typography>
              )}
            </Box>
          </Popover>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>{user?.username[0].toUpperCase()}</Avatar>
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <Link href="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
              {user?.full_name}
            </Link>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
} 