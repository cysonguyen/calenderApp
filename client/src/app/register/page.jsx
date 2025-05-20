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
import { register } from '@/app/api/client/account';

export default function RegisterPage() {
    const router = useRouter();
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState('');


    const { mutate: submitRegister, isLoading } = useMutation({
        mutationFn: async (formData) => {
            const response = await register(formData);
            if (response?.token) {
                const { token, user } = response
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/schedules');
            } else {
                setOpenNotification(true);
                setMessage(response?.errors[0] ?? 'Something went wrong');
            }
            return response;
        },
    });

    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        username: null,
        password: null,
        confirmPassword: null,
        email: null,
        full_name: null,
        birth_day: null,
        work_place: null,
        level: null,
    });

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setErrors({});
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            submitRegister(formData);
        }
    }, [formData]);

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/schedules');
        }
    }, [router]);

    return (
        <Container component="main" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center', pb: 4 }}>Calendar App</Typography>
                    <Typography component="h1" variant="h5">
                        Account registration
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username ?? ''}
                            size='small'
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email ?? ''}
                            size='small'
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="msnv"
                            label="MSNV"
                            name="msnv"
                            autoComplete="msnv"
                            autoFocus
                            value={formData.msnv ?? ''}
                            size='small'
                            onChange={handleChange}
                            error={!!errors.msnv}
                            helperText={errors.msnv}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="normal"
                                size='small'
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={formData.password ?? ''}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                            <TextField
                                margin="normal"
                                size='small'
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword ?? ''}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="normal"
                                size='small'
                                required
                                fullWidth
                                name="full_name"
                                label="Full name"
                                type="text"
                                id="full_name"
                                value={formData.full_name ?? ''}
                                onChange={handleChange}
                                error={!!errors.full_name}
                                helperText={errors.full_name}
                            />
                            <TextField
                                margin="normal"
                                size='small'
                                fullWidth
                                name="birth_day"
                                label="Birth day"
                                type="date"
                                id="birth_day"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.birth_day ?? ''}
                                onChange={handleChange}
                                error={!!errors.birth_day}
                                helperText={errors.birth_day}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="normal"
                                size='small'
                                fullWidth
                                name="work_place"
                                label="Work place"
                                type="text"
                                id="work_place"
                                value={formData.work_place ?? ''}
                                onChange={handleChange}
                                error={!!errors.work_place}
                                helperText={errors.work_place}
                            />
                            <TextField
                                margin="normal"
                                size='small'
                                fullWidth
                                name="level"
                                label="Level"
                                type="text"
                                id="level"
                                value={formData.level ?? ''}
                                onChange={handleChange}
                                error={!!errors.level}
                                helperText={errors.level}
                            />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ mt: 3 }}
                                loading={isLoading}
                            >
                                Register
                            </Button>
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                Already have an account? <Link href="/login">Login</Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000} onClose={handleCloseNotification}>
                <Alert severity="error">{message}</Alert>
            </Snackbar>
        </Container>
    );
}

function validateForm(formData) {
    const errors = {};
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Confirm password is not correct';
    }
    return errors;
}

