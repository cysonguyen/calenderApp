'use client';

import { Alert, Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import StudentTable from "../groups/StudentTable";
import { useRouter } from "next/navigation";
import StudentAddModal from "./StudentAddModal";
import { useState, useCallback } from "react";
const columns = (router) => {
    return [
        { field: 'full_name', headerName: 'Full name', flex: 1, minWidth: 150 },
        { field: 'mssv', headerName: 'MSSV', flex: 1, minWidth: 120 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        { field: 'birth_day', headerName: 'Birth Day', flex: 1, minWidth: 130 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 100,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                return (
                    <Button variant="contained" color="primary" size="small" onClick={() => router?.push(`/students/${params.id}`)}>
                        View
                    </Button>
                )
            }
        }
    ]
}


export default function Students() {
    const router = useRouter();
    const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
    const [message, setMessage] = useState({
        status: 'success',
        message: '',
    });
    const [openNotification, setOpenNotification] = useState(false);

    const handleClose = useCallback((payload) => {
        if (payload) {
            setMessage(payload);
            setOpenNotification(true);
            if (payload.status === 'success') {
                setOpenAddStudentModal(false);
            }
        } else {
            setOpenAddStudentModal(false);
        }
    }, []);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h4">Students</Typography>
                        <Button variant="contained" color="primary" onClick={() => setOpenAddStudentModal(true)}>Add Student</Button>
                    </Box>
                    <StudentTable
                        rows={null}
                        initialColumns={columns(router)}
                        allowSelect={false}
                        allowAdd={true}
                    />
                </Box>
            </Paper>
            <StudentAddModal
                open={openAddStudentModal}
                onClose={handleClose}
            />
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
        </Box>
    )
}
