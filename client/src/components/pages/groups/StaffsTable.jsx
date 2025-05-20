'use client'

import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { getStaffsApi } from "@/app/api/client/account";
import { useMemo, useState, useEffect, useCallback, memo } from "react";
import dayjs from "dayjs";
import { Box, MenuItem, Select, TextField } from "@mui/material";
import { useDebounce } from "@/hooks/useDebounce";
const pageSize = 20;

export function StaffTable({ isLoading, rows, initialColumns, selectedUsers, onSelect, allowAdd = true, isFetch = false, allowSelect = true }) {
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({ page, pageSize });
    const { data, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users', query],
        queryFn: () => getStaffsApi(query),
        keepPreviousData: true,
        enabled: allowAdd || isFetch,
    });

    const [search, setSearch] = useState('');
    const [type, setType] = useState('full_name');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        if (allowAdd) {
            setQuery({
                page,
                pageSize,
                [type]: debouncedSearch,
            });
        }
    }, [debouncedSearch]);

    const loading = useMemo(() => {
        if (allowAdd) return isLoadingUsers;
        return isLoading;
    }, [isLoading, isLoadingUsers, allowAdd]);

    const { rowsData, totalRows } = useMemo(() => {
        if (rows) return {
            rowsData: rowTransform(rows),
            totalRows: rows.length ?? 0
        };
        const users = data?.users;
        return {
            rowsData: rowTransform(users),
            totalRows: data?.total ?? 0
        };
    }, [rows, data]);

    const onPageChange = useCallback((newPage) => {
        setPage(newPage.page);
        setQuery((prev) => ({
            ...prev,
            page: newPage.page,
            pageSize: newPage.pageSize
        }));
    }, []);

    console.log('selectedUsers', selectedUsers);
    


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
                    <MenuItem value="msnv">MSNV</MenuItem>
                </Select>
            </Box>
            <DataGrid
                paginationMode="server"
                rowCount={totalRows}
                loading={loading}
                rows={rowsData}
                columns={initialColumns}
                checkboxSelection={allowSelect}
                disableRowSelectionOnClick
                rowSelectionModel={selectedUsers}
                onRowSelectionModelChange={(newRowSelectionModel) => onSelect?.(newRowSelectionModel)}
                pageSizeOptions={[pageSize]}
                paginationModel={{
                    page,
                    pageSize
                }}
                onPaginationModelChange={onPageChange}
            />
        </Box>
    )
}

function rowTransform(rows) {
    if (!Array.isArray(rows)) return [];
    return rows?.map((row) => {
        return {
            ...row,
            birth_day: row.birth_day ? dayjs(row.birth_day).format('DD/MM/YYYY') : 'N/A',
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
