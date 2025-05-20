import { Alert, Box, Button, Modal, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStaffApi } from "@/app/api/client/account";

export default function StaffAddModal({ open, onClose }) {
    const queryClient = useQueryClient();
    const { mutate: createStaff, isLoading } = useMutation({
        mutationFn: async (staff) => {
            const res = await createStaffApi(staff);
            if (!res.errors) {
                queryClient.invalidateQueries({ queryKey: ['staffs'], exact: false });
                handleClose({
                    status: 'success',
                    message: 'Added success',
                });
            } else {
                onClose?.({
                    status: 'error',
                    message: res.errors[0],
                });
            }
            return res;
        },
    });

    const [info, setInfo] = useState({
        full_name: '',
        birth_day: '',
        email: '',
        msnv: '',
        username: '',
        password: '',
    });

    const handleChange = useCallback((key, value) => {
        setInfo((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = useCallback(() => {
        createStaff(info);
    }, [info, createStaff]);

    const handleClose = useCallback((data) => {
        onClose?.(data);
        setInfo({
            full_name: '',
            birth_day: '',
            email: '',
            msnv: '',
            username: '',
            password: '',
        });
    }, [onClose]);
    return (
        <Modal
            open={open}
            onClose={() => handleClose()}
        >
            <Paper sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 800,
                padding: 2,
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        mb: 2,
                    }}>Staff Information</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Username"
                        value={info?.username ?? ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Password"
                        type="password"
                        value={info?.password ?? ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                    />
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                    }}>

                        <TextField
                            fullWidth
                            size="small"
                            label="Full Name"
                            value={info?.full_name ?? ''}
                            onChange={(e) => handleChange('full_name', e.target.value)}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Birthday"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={info?.birth_day ?? ''}
                            onChange={(e) => handleChange('birth_day', e.target.value)}
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Email"
                            value={info?.email ?? ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="MSNV"
                            value={info?.msnv ?? ''}
                            onChange={(e) => handleChange('msnv', e.target.value)}
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Level"
                            value={info?.level ?? ''}
                            onChange={(e) => handleChange('level', e.target.value)}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Work Place"
                            value={info?.work_place ?? ''}
                            onChange={(e) => handleChange('work_place', e.target.value)}
                        />
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2,
                }}>
                    <Button variant="contained" color="secondary" disabled={isLoading} onClick={() => handleClose()}>Cancel</Button>
                    <Button variant="contained" color="primary" disabled={isLoading} loading={isLoading} onClick={handleSave}>Add</Button>
                </Box>
            </Paper>
        </Modal>
    )
}
