'use client';

import { getGroupByQueryApi } from '@/app/api/client/account';
import { useDebounce } from '@/hooks/useDebounce';
import { useUser } from '@/hooks/useUser';
import { AddCircle, PlusOne } from '@mui/icons-material';
import { Box, Paper, Typography, Button, ButtonGroup, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const pageSize = 20;

export default function Groups() {
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({ page, pageSize });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [user, _update, isInitialized] = useUser();
    const router = useRouter();
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
        </Box>
    )
}
