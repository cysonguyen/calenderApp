import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { getStudentsApi } from "@/app/api/client/account";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { Box, MenuItem, Select, TextField } from "@mui/material";
import { useDebounce } from "@/hooks/useDebounce";
const pageSize = 20;

export default function StudentTable({ isLoading, rows, initialColumns, selectedUsers, onSelect, allowAdd = true, isFetch = false, allowSelect = true }) {
    const [query, setQuery] = useState({});
    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', query],
        queryFn: () => getStudentsApi(query),
        enabled: allowAdd || isFetch,
    });
    const [search, setSearch] = useState('');
    const [type, setType] = useState('full_name');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        if (allowAdd) {
            setQuery({
                [type]: debouncedSearch,
            });
        }
    }, [debouncedSearch]);

    const loading = useMemo(() => {
        if (allowAdd) return isLoadingUsers;
        return isLoading;
    }, [isLoading, isLoadingUsers, allowAdd]);

    const rowsData = useMemo(() => {
        const data = rows ? rows : users;
        return rowTransform(data);
    }, [rows, users]);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    sx={{ width: '200px' }}
                    size="small"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <MenuItem value="full_name">Full Name</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="mssv">MSSV</MenuItem>
                </Select>
            </Box>
            <DataGrid
                loading={loading}
                rows={rowsData}
                columns={initialColumns}
                checkboxSelection={allowSelect}
                disableRowSelectionOnClick
                rowSelectionModel={selectedUsers}
                onRowSelectionModelChange={(newRowSelectionModel) => onSelect?.(newRowSelectionModel)}
                pageSizeOptions={pageSize}

            />
        </Box>
    )
}


function rowTransform(rows) {
    if (!Array.isArray(rows)) return [];
    return rows?.map((row) => {
        return {
            ...row,
            birth_day: dayjs(row.birth_day).format('DD/MM/YYYY'),
        }
    })
}

function filterRows(rows, query) {
    const filteredRows = rows.filter((row) => {
        return Object.keys(query).every((key) => {
            return row[key].toLowerCase().includes(query[key].toLowerCase());
        });
    });
    return filteredRows;
}
