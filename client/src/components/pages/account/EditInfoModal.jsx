import { ROLES } from "@/utils/const";
import { Modal, Box, Typography, Paper, TextField, Button } from "@mui/material";
import dayjs from "dayjs";
import { useState, useCallback } from "react";

export default function EditInfoModal({ open, onClose, onSave, user }) {
    const [info, setInfo] = useState(user);
    const handleChange = (key, value) => {
        setInfo({ ...info, [key]: value });
    }

    const handleSubmit = useCallback(() => {
        onSave?.(info);
    }, [info, onSave, onClose]);

    const handleClose = useCallback(() => {
        onClose?.();
        setInfo(user);
    }, [onClose]);

    return (
        <Modal
            open={open}
            onClose={handleClose}
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
                    }}>Edit Information</Typography>
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
                            value={info?.birth_day ? dayjs(info?.birth_day).format('YYYY-MM-DD') : ''}
                            onChange={(e) => handleChange('birth_day', e.target.value)}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        value={info?.email ?? ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {
                        info?.role === ROLES.TEACHER && (
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Work place"
                                    value={info?.work_place ?? ''}
                                    onChange={(e) => handleChange('work_place', e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Level"
                                    value={info?.level ?? ''}
                                    onChange={(e) => handleChange('level', e.target.value)}
                                />
                            </Box>
                        )
                    }
                    {
                        info?.role === ROLES.STUDENT && (
                            <TextField
                                fullWidth
                                size="small"
                                label="MSSV"
                                value={info?.mssv ?? ''}
                            />
                        )
                    }
                </Box>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2,
                }}>
                    <Button variant="contained" color="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>Save</Button>
                </Box>
            </Paper>
        </Modal>
    );
}
