import { useState, useCallback, startTransition, useRef } from "react";
import { UploadFile } from "@mui/icons-material";
import { Alert, Box, Button, Input, Modal, Paper, Snackbar, Typography } from "@mui/material";
import { readExcelFile, validateJsonData } from "./comon/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importStudentsApi } from "@/app/api/client/account";

export default function StudentImportModal({ open, onClose, isLoading }) {
    const queryClient = useQueryClient();
    const inputRef = useRef(null);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [file, setFile] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        status: 'success',
        message: ''
    });

    const { mutate: importStudents, isLoading: isImporting } = useMutation({
        mutationFn: (data) => {
            return importStudentsApi({ accounts: data });
        },
        onSettled: (res) => {
            if (res.errors) {
                setErrors(res.errors);
                setMessage({
                    status: 'error',
                    message: res.errors?.[0]
                });
                setOpenNotification(true);
            } else {
                handleClose();
                queryClient.invalidateQueries({ queryKey: ['students'] });
                setMessage({
                    status: 'success',
                    message: 'Import students successfully'
                });
                setOpenNotification(true);
            }
        }
    })

    const handleFileChange = useCallback((event) => {
        setErrors([]);
        const file = event.target.files[0];
        const fileName = file?.name?.toLowerCase();
        if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            setErrors(['Chỉ chấp nhận file Excel (.xlsx hoặc .xls)']);
            return;
        }
        setFile(structuredClone(file));

        readExcelFile(file, (jsonData) => {
            const validateResult = validateJsonData(jsonData);
            if (validateResult?.errors) {
                setErrors(validateResult.errors);
            } else {
                setData(jsonData);
            }
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        });
    }, []);

    const handleImport = () => {
        importStudents(data);
    }

    const handleClose = () => {
        setErrors([]);
        setData([]);
        setFile(null);
        onClose?.();
    }

    return (
        <>
            <Modal open={open} onClose={handleClose}>
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
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="h5">Import students</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Typography variant="body1">Choose  a CSV file:</Typography>
                            <Button
                                size="small"
                                component="label"
                                variant="contained"
                                startIcon={<UploadFile />}
                            >
                                Upload file
                                <Input inputRef={inputRef} sx={{ display: 'none' }} type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </Button>
                        </Box>
                        {errors?.length > 0 && (
                            <Box sx={{ color: 'red' }}>
                                {errors?.slice(0, 5).map((error, index) => (
                                    <Typography key={`error-${index}}`}>{error.message}</Typography>
                                ))}
                            </Box>
                        )}
                        {
                            file && (
                                <Box>
                                    <Typography variant="body1">
                                        We will import <span style={{ fontWeight: 'bold' }}>{file?.name}</span>
                                    </Typography>
                                    {
                                        !errors?.length > 0 && (
                                            <Typography variant="body1">
                                                <span style={{ fontWeight: 'bold' }}>{data.length}</span> students will be added.
                                            </Typography>
                                        )
                                    }
                                </Box>
                            )
                        }

                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 2,
                    }}>
                        <Button variant="contained" color="secondary" disabled={isLoading || isImporting} onClick={() => handleClose()}>Cancel</Button>
                        <Button variant="contained" color="primary" disabled={isLoading || isImporting} loading={isImporting || isLoading} onClick={handleImport}>Import</Button>
                    </Box>
                </Paper>

            </Modal>
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
        </>
    );
}
