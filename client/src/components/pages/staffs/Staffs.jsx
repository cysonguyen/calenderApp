'use client';

import { Alert, Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import { StaffTable } from "../groups/StaffsTable";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import StaffAddModal from "./StaffAddModal";
import StaffImportModal from "./StaffImportModal";
const columns = (router) => {
    return [
        { field: 'full_name', headerName: 'Full name', flex: 1, minWidth: 150 },
        { field: 'msnv', headerName: 'MSNV', flex: 1, minWidth: 120 },
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
                    <Button variant="contained" color="primary" size="small" onClick={() => router?.push(`/staffs/${params.id}`)}>
                        View
                    </Button>
                )
            }
        }
    ]
}


export default function Staffs() {
    const router = useRouter();
    const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
    const [openImportStudentModal, setOpenImportStudentModal] = useState(false);
    const [message, setMessage] = useState({
        status: 'success',
        message: '',
    });
    const [openNotification, setOpenNotification] = useState(false);
    const handleCloseAddModal = useCallback((payload) => {
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

    const handleCloseImportModal = useCallback((payload) => {
        if (payload) {
            setMessage(payload);
            setOpenNotification(true);
            if (payload.status === 'success') {
                setOpenImportStudentModal(false);
            }
        } else {
            setOpenImportStudentModal(false);
        }
    }, []);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h4">Staffs</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => setOpenImportStudentModal(true)}>Import</Button>
                            <Button variant="contained" color="primary" onClick={() => setOpenAddStudentModal(true)}>Add</Button>
                        </Box>
                    </Box>
                    <StaffTable
                        rows={null}
                        initialColumns={columns(router)}
                        allowSelect={false}
                        allowAdd={true}
                    />
                </Box>
            </Paper>
            <StaffAddModal
                open={openAddStudentModal}
                onClose={handleCloseAddModal}
            />
            <StaffImportModal
                open={openImportStudentModal}
                onClose={handleCloseImportModal}
            />
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
        </Box>
    )
}
