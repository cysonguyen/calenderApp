import { Box, Modal, Paper, Typography, TextField, Button } from "@mui/material";
import { useState, useCallback } from "react";

const initialPasswordInfo = {
    password: '',
    confirmPassword: '',
    oldPassword: '',
}

export default function ChangePwModal({ open, onClose, onSave }) {
    const [passwordInfo, setPasswordInfo] = useState(initialPasswordInfo);
    const [error, setError] = useState({});

    const handleChange = (key, value) => {
        setPasswordInfo({ ...passwordInfo, [key]: value });
    }

    const handleClose = useCallback(() => {
        onClose?.();
        setPasswordInfo(initialPasswordInfo);
        setError({});
    }, [onClose]);

    const handleSave = useCallback(() => {
        setError({});
        const error = validatePassword(passwordInfo.password, passwordInfo.confirmPassword);
        if (error) {
            setError(error);
            return;
        }
        onSave?.(passwordInfo);
    }, [passwordInfo, onSave]);
    return (
        <Modal open={open} onClose={handleClose}>
            <Paper sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50%',
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
                    }}>Change password</Typography>

                    <TextField
                        sx={{
                            width: 'calc(50% - 10px)',
                        }}
                        size="small"
                        label="Old password"
                        value={passwordInfo.oldPassword}
                        onChange={(e) => handleChange('oldPassword', e.target.value)}
                        type="password"
                        error={!!error.oldPassword}
                        helperText={error.oldPassword}
                    />
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Password"
                            type="password"
                            value={passwordInfo.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            error={!!error.password}
                            helperText={error.password}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Confirm Password"
                            type="password"
                            value={passwordInfo.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            error={!!error.confirmPassword}
                            helperText={error.confirmPassword}
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                    }}>
                        <Button variant="contained" color="primary" onClick={handleSave}>Submit</Button>
                        <Button variant="contained" color="secondary" onClick={handleClose}>Cancel</Button>
                    </Box>

                </Box>
            </Paper>
        </Modal>
    );
}

function validatePassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        return {
            confirmPassword: 'Passwords do not match',
        };
    }
    return null;
}
