'use client';

import { getGroupByQueryApi } from '@/app/api/client/account';
import { useDebounce } from '@/hooks/useDebounce';
import { useUser } from '@/hooks/useUser';
import { ROLES } from '@/utils/const';
import { AddCircle, PlusOne } from '@mui/icons-material';
import { Box, Paper, Typography, Button, ButtonGroup, TextField, Modal, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGroupController } from './comon/group.controller';

const pageSize = 20;

export default function Groups() {
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({ page, pageSize });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [user, _update, isInitialized] = useUser();
    const router = useRouter();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isOpenConfirm, setIsOpenConfirm] = useState(false)
    const queryClient = useQueryClient();
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        status: '',
        message: '',
    });

    const { deleteGroupManual, isLoadingDelete } = useGroupController()

    const { data, isLoading } = useQuery({
        queryKey: ['groups', query],
        queryFn: () => getGroupByQueryApi(query),
        enabled: isInitialized,
        onSuccess: (data) => {
            if (!data.errors) {
                setGroups(data.groups);
                setTotalRows(data.total);
            }
        }
    });

    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.LEADER;
    }, [user?.role]);

    useEffect(() => {
        setQuery({
            page,
            pageSize,
            search: debouncedSearch
        });
    }, [debouncedSearch]);
    const [groups, setGroups] = useState(data?.groups);
    const [totalRows, setTotalRows] = useState(data?.total);
    const rows = useMemo(() => {
        if (!groups) return [];
        return groups?.map((row) => ({
            ...row,
            id: `#${row.id}`,
            updatedAt: dayjs(row.updatedAt).format('DD/MM/YYYY'),
            rawId: row.id,
        }))
    }, [groups])

    const columns = [
        {
            field: 'id', headerName: 'ID', flex: 1, headerClassName: 'bold-header',
            cellClassName: 'bold-cell'
        },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1, sortable: false },
        { field: 'updatedAt', headerName: 'Updated At', flex: 1, sortable: false },
        {
            field: 'actions', headerName: 'Actions', flex: 1, align: 'right', headerAlign: 'right',
            sortable: false,
            renderCell: (params) => {
                return (
                    <ButtonGroup>
                        <Button variant="contained" color="primary" onClick={() => router.push(`/groups/${params.row.rawId}`)}>
                            View
                        </Button>
                        {
                            !disabledEdit && (
                                <Button variant="contained" color="error">
                                    Delete
                                </Button>
                            )
                        }
                    </ButtonGroup>
                )
            }
        }

    ];

    const onFinish = useCallback((res) => {
        console.log('res', res);

        if (!res.errors) {
            setOpenNotification(true);
            setMessage({
                status: 'success',
                message: 'Updated success',
            });
            setIsOpenConfirm(false);
            queryClient.invalidateQueries({ queryKey: ['groups', query] });

        } else {
            setOpenNotification(true);
            setMessage({
                status: 'error',
                message: res.errors[0],
            });
        }
    }, [query]);

    const onDeleGroup = useCallback(() => {
        deleteGroupManual({ groupId: selectedGroup, onFinish })
    }, [selectedGroup, onFinish])


    const handleDeleteGroup = useCallback((groupId) => {
        setSelectedGroup(groupId);
        setIsOpenConfirm(true)
    }, [])

    const handleClose = useCallback(() => {
        setSelectedGroup(null);
        setIsOpenConfirm(false)
    }, [])

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }} >
                    <Typography sx={{ fontWeight: 'bold' }} variant="h4">Groups</Typography>
                    {
                        !disabledEdit && (
                            <Button onClick={() => router.push('/groups/add')} variant='contained' startIcon={<AddCircle />}>Add group</Button>
                        )
                    }
                </Box>

                <TextField
                    fullWidth
                    size="small"
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <DataGrid
                    paginationMode="server"
                    loading={isLoading || !isInitialized}
                    rows={rows}
                    columns={columns}
                    rowCount={totalRows}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize,
                                page
                            },
                        },
                    }}
                    pageSizeOptions={[pageSize]}
                    checkboxSelection={false}
                    disableRowSelectionOnClick
                    paginationModel={{
                        page,
                        pageSize
                    }}
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                    }}
                />

            </Paper>
            <Modal open={isOpenConfirm} onClose={handleClose}>
                <Paper sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50%',
                    padding: 2,
                }}>
                    <Box>
                        <Typography variant="h5" sx={{
                            fontWeight: 'bold',
                            mb: 2,
                        }}>Delete Group</Typography>
                        <Typography>
                            This action will be undone. Are you sure to delete group?
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                            mt: 2,
                        }}>
                            <Button variant="contained" color="secondary" onClick={handleClose}>Cancel</Button>
                            <Button variant="contained" color="error" onClick={onDeleGroup}>Delete</Button>
                        </Box>
                    </Box>
                </Paper>
            </Modal>
            <Snackbar onClose={() => setOpenNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000}>
                <Alert severity={message.status}>{message.message}</Alert>
            </Snackbar>
        </Box>
    )
}
