'use client';

import { getGroupByQueryApi } from '@/app/api/client/account';
import { useUser } from '@/hooks/useUser';
import { AddCircle, PlusOne } from '@mui/icons-material';
import { Box, Paper, Typography, Button, ButtonGroup } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const pageSize = 20;

export default function Groups() {
    const [user, _update, isInitialized] = useUser();
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: () => getGroupByQueryApi(),
        enabled: isInitialized,
        onSuccess: (data) => {
            setGroups(data);
        }
    });
    const [groups, setGroups] = useState(data);
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
                        <Button variant="contained" color="error">
                            Delete
                        </Button>
                    </ButtonGroup>
                )
            }
        }

    ];

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }} >
                    <Typography sx={{ fontWeight: 'bold' }} variant="h4">Groups</Typography>
                    <Button onClick={() => router.push('/groups/add')} variant='contained' startIcon={<AddCircle />}>Add group</Button>
                </Box>
                <DataGrid
                    loading={isLoading || !isInitialized}
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize,
                            },
                        },
                    }}
                    pageSizeOptions={[pageSize]}
                    checkboxSelection={false}
                    disableRowSelectionOnClick
                />
            </Paper>
        </Box>
    )
}
