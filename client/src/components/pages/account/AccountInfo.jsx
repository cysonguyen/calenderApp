'use client';

import { Box, Paper, Typography, Divider, Button, Snackbar, Alert } from '@mui/material';
import { useUser } from '@/hooks/useUser';
import { ROLES } from '@/utils/const';
import EditInfoModal from './EditInfoModal';
import ChangePwModal from './ChangePwModal';
import { useState, useCallback } from 'react';
import Loading from '@/components/common/loading';
import { useMutation } from '@tanstack/react-query';
import { changeInfoApi, changePasswordApi } from '@/app/api/client/account';
import dayjs from 'dayjs';
export default function AccountInfo() {
    const [user, updateUser] = useUser();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        status: '',
        message: '',
    });

    const { mutate: changeInfo, isLoading: isChangingInfo } = useMutation({
        mutationFn: async (info) => {
            const res = await changeInfoApi(info, user.id);
            if (!res.errors) {
                setOpenNotification(true);
                setMessage({
                    status: 'success',
                    message: 'Updated success',
                });
                setOpenEditModal(false);
                updateUser(res);
            } else {
                setOpenNotification(true);
                setMessage({
                    status: 'error',
                    message: res.errors[0],
                });
            }
        },
    });

    const { mutate: changePassword, isLoading: isChangingPassword } = useMutation({
        mutationFn: async (passwordInfo) => {
            const res = await changePasswordApi(passwordInfo, user.id);
            if (!res.errors) {
                setOpenNotification(true);
                setMessage({
                    status: 'success',
                    message: 'Updated success',
                });
                setOpenChangePasswordModal(false);
            } else {
                setOpenNotification(true);
                setMessage({
                    status: 'error',
                    message: res.errors[0],
                });
            }
        },
    });

    const handleSaveInfo = useCallback((info) => {
        changeInfo(info);
    }, []);

    const handleOpenEditInfo = useCallback(() => {
        setOpenEditModal(true);
    }, []);

    const handleChangePassword = useCallback((passwordInfo) => {
        try {
            changePassword(passwordInfo);
        } catch (error) {
            console.log('error', error);
        }
    }, []);

    const handleOpenChangePassword = useCallback(() => {
        setOpenChangePasswordModal(true);
    }, []);

    if (!user) return <Loading />;
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 'bold' }} variant="h5">Account</Typography>
                        <Button variant="contained" size='small' color="primary" onClick={handleOpenChangePassword}>Change password</Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant="body2">Username: {user?.username}</Typography>
                        <Typography variant="body2">Password: *********</Typography>
                    </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 'bold' }} variant="h5">User information</Typography>
                        <Button variant="contained" size='small' color="primary" onClick={handleOpenEditInfo}>Edit</Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant="body2">Full name: {user?.full_name ?? 'N/A'}</Typography>
                        <Typography variant="body2">Email: {user?.email ?? 'N/A'}</Typography>
                        <Typography variant="body2">Date of birth: {user?.birth_day ? dayjs(user?.birth_day).format('DD/MM/YYYY') : 'N/A'}</Typography>
                        <Typography variant="body2">Level: {user?.level ?? 'N/A'}</Typography>
                        <Typography variant="body2">Work place: {user?.work_place ?? 'N/A'}</Typography>
                        <Typography variant="body2">MSNV: {user?.msnv ?? 'N/A'}</Typography>

                    </Box>
                </Box>
            </Paper>
            <EditInfoModal open={openEditModal} onClose={() => setOpenEditModal(false)} onSave={handleSaveInfo} user={user} />
            <ChangePwModal open={openChangePasswordModal} onClose={() => setOpenChangePasswordModal(false)} onSave={handleChangePassword} />
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
        </Box>
    );
}
