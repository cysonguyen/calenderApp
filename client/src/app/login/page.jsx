'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/app/api/client/account';

export default function LoginPage() {
  const router = useRouter();
  const [openNotification, setOpenNotification] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { mutate: submitLogin, isLoading } = useMutation({
    mutationFn: async (formData) => {
      const response = await login(formData);
      if (response?.token) {
        const { token, user } = response
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        fetch('/api/store-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        router.push('/schedules');
      } else {
        setOpenNotification(true);
        setMessage(response?.errors[0] ?? 'Something went wrong');
      }
      return response;
    },
  });

  const handleCloseNotification = () => {
    setOpenNotification(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    submitLogin(formData);
  }, [formData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/schedules');
    }
  }, [router]);

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
              loading={isLoading}
            >
              Sign In
            </Button>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Don't have an account? <Link href="/register">Sign up</Link>
            </Typography>
          </Box>
        </Paper>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000} onClose={handleCloseNotification}>
          <Alert severity="error">{message}</Alert>
        </Snackbar>
      </Box>
    </Container>
  );
} 