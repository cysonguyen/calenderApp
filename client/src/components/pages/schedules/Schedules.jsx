'use client';

import { getSchedules } from "@/app/api/client/schedules";
import { useUser } from "@/hooks/useUser";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "@mui/material";

const pageSize = 20;

export default function Schedules() {
    const [user, _update, isInitialized] = useUser();
    const router = useRouter();
    const [page, setPage] = useState(0);
    const { data, isLoading } = useQuery({
        queryKey: ['schedules'],
        queryFn: () => getSchedules(user.id),
        enabled: isInitialized,
        onSuccess: (data) => {
            if (!data.errors) {
                setSchedules(data.schedules);
                setTotalRows(data.total);
            }
        }
    })

    const [totalRows, setTotalRows] = useState(data?.total || 0);
    const [schedules, setSchedules] = useState(data?.schedules || []);

    const initialColumns = [
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
                        <Button variant="contained" color="primary" onClick={() => router.push(`/schedules/${params.row.rawId}`)}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">Schedules</Typography>
                    <Button variant="contained" color="primary" onClick={() => router.push('/schedules/add')}>Create</Button>
                </Box>
                <DataGrid
                    paginationMode="server"
                    rowCount={totalRows}
                    rows={schedules}
                    columns={initialColumns}
                    checkboxSelection={false}
                    rowSelectionModel={[]}
                    pageSizeOptions={[pageSize]}
                    paginationModel={{
                        page,
                        pageSize
                    }}
                />
            </Paper>
        </Box>
    )
}
