'use client';

import { Box, Paper, Typography, TextField, Button, TextareaAutosize, Snackbar, Alert, Modal } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGroupByIdApi } from "@/app/api/client/account";
import { useState, useMemo, useCallback, startTransition } from "react";;
import { useRouter } from "next/navigation";
import Loading from "@/components/common/loading";
import StudentTable from "./StudentTable";
import { useGroupController } from "./comon/group.controller";
import { useUser } from "@/hooks/useUser";
import { ROLES } from "@/utils/const";

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

export default function GroupDetail({ groupId }) {
    const [user] = useUser();
    const queryClient = useQueryClient();
    const [openNotification, setOpenNotification] = useState(false);
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [message, setMessage] = useState({
        status: '',
        message: '',
    });
    const router = useRouter();
    const { createGroup, updateGroup, isLoadingCreate, isLoadingUpdate } = useGroupController();
    const { data, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => getGroupByIdApi(groupId),
        enabled: !!groupId && !groupId?.includes('add'),
        onSuccess: (data) => {
            setGroup(data);
            setSelectedUsers(data?.Users?.map((user) => user.id));
        }
    });
    const initGroup = useMemo(() => {
        if (groupId === 'add') {
            return {
                name: '', description: '', userIds: []
            }
        }
        return data;
    }, [groupId, data]);

    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.TEACHER;
    }, [user?.role]);

    const [group, setGroup] = useState(initGroup);
    const [selectedUsers, setSelectedUsers] = useState(groupId === 'add' ? [] : group?.Users?.map((user) => user.id));
    const handleChangeDetail = useCallback((key, value) => {
        setGroup((prev) => ({ ...prev, [key]: value }));
    }, []);

    const onChangeSelectedUsers = useCallback((newRowSelectionModel) => {
        setSelectedUsers(newRowSelectionModel);
    }, []);

    const onFinish = useCallback((res) => {
        if (!res.errors) {
            setOpenNotification(true);
            setMessage({
                status: 'success',
                message: 'Updated success',
            });
            if (groupId === 'add') {
                startTransition(() => {
                    router.push(`/groups/${res.id}`);
                });
            } else {
                setIsOpenEditModal(false);
                queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            }
        } else {
            setOpenNotification(true);
            setMessage({
                status: 'error',
                message: res.errors[0],
            });
        }
    }, []);

    const handleSaveGroup = useCallback(() => {
        const payload = { ...group, userIds: selectedUsers };
        if (groupId === 'add') {
            createGroup({ group: payload, onFinish });
        } else {
            updateGroup({ group: payload, onFinish });
        }
    }, [group, groupId, createGroup, selectedUsers, onFinish]);

    if (isLoading && groupId !== 'add') {
        return <Loading />
    }
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {
                    !disabledEdit && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 'bold' }} variant="h4">{groupId === 'add' ? 'Add Group' : 'Group Detail'}</Typography>
                            <Button variant="contained" color="primary" size="small" onClick={handleSaveGroup}>
                                Save
                            </Button>
                        </Box>
                    )
                }
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {
                        disabledEdit ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{group?.name}</Typography>
                                {
                                    group?.description && (
                                        <Typography sx={{ fontStyle: 'italic' }}>{group?.description}</Typography>
                                    )
                                }
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '14px' }}>Group name:</Typography>
                                <TextField
                                    sx={{ width: '50%' }}
                                    size="small"
                                    value={group?.name ?? ''}
                                    onChange={(e) => handleChangeDetail('name', e.target.value)}
                                />
                            </Box>
                        )
                    }
                    {
                        !disabledEdit && (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '14px' }}>Description:</Typography>
                                <TextareaAutosize
                                    minRows={3}
                                    value={group?.description ?? ''}
                                    onChange={(e) => handleChangeDetail('description', e.target.value)}
                                    style={{
                                        fontSize: '16px',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                    }}
                                />
                            </Box>
                        )
                    }
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '14px' }}>{groupId === 'add' ? 'Select students' : 'Students in group'}</Typography>
                            {
                                groupId !== 'add' && !disabledEdit && (
                                    <Button variant="text" color="primary" size="small" onClick={() => setIsOpenEditModal(true)}>
                                        Add Student
                                    </Button>
                                )
                            }
                        </Box>
                        <StudentTable
                            rows={groupId === 'add' ? null : group?.Users}
                            initialColumns={columns(router)}
                            selectedUsers={selectedUsers}
                            onSelect={onChangeSelectedUsers}
                            allowAdd={groupId === 'add'}
                            allowSelect={!disabledEdit}
                        />
                    </Box>
                </Box>
            </Paper>
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
            <Modal open={isOpenEditModal} onClose={() => setIsOpenEditModal(false)}>

                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '900px', width: '100%', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '80vh', overflow: 'auto' }}>
                        <Typography variant="h6">Change student in group</Typography>
                        <StudentTable
                            rows={null}
                            initialColumns={columns(router)}
                            selectedUsers={selectedUsers}
                            onSelect={onChangeSelectedUsers}
                            allowAdd={true}
                        />
                    </Box>
                    <Box sx={{
                        mt: 2,
                        mr: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                    }}>
                        <Button variant="contained" color="secondary" onClick={() => setIsOpenEditModal(false)}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={handleSaveGroup}>Submit</Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
