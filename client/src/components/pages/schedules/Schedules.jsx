'use client';

import { deleteScheduleApi, getSchedulesApi } from "@/app/api/client/schedules";
import { useUser } from "@/hooks/useUser";
import { Box, Paper, Typography, Button, TextField, Snackbar, Alert } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "@mui/material";
import DateTimeRangeSelector from "@/components/resources/date-time/DateRange";
import dayjs from "dayjs";
import Calendar from "./Calender/Calender";
import { ROLES } from "@/utils/const";

const defaultDateRange = {
    startTime: dayjs().startOf('month').toISOString(),
    endTime: dayjs().endOf('month').toISOString()
};
const pageSize = 20;
const viewOptions = {
    calendar: 'calendar',
    list: 'list',
}

export default function Schedules() {
    const queryClient = useQueryClient();
    const [user, _update, isInitialized] = useUser();
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [dateRange, setDateRange] = useState(defaultDateRange);
    const [view, setView] = useState(viewOptions.calendar);
    const [query, setQuery] = useState({
        dateRange: defaultDateRange,
        view: viewOptions.list
    });
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: 'success',
        message: ''
    });
    const { data, isLoading } = useQuery({
        queryKey: ['schedules', query],
        queryFn: () => getSchedulesApi({ ...query, userId: user?.id }),
        enabled: isInitialized,
        onSuccess: (data) => {
            if (!data.errors) {
                setSchedules(data);
                setTotalRows(data?.length || 0);
            }
        }
    })

    const { mutate: deleteSchedule, isLoading: isDeleting } = useMutation({
        mutationFn: (scheduleId) => deleteScheduleApi(scheduleId),
        onSuccess: (res) => {
            if (res?.scheduleId) {
                queryClient.invalidateQueries({ queryKey: ['schedules'] });
                setMessage({
                    type: 'success',
                    message: 'Schedule deleted successfully'
                });
                setOpenNotification(true);
            } else {
                setMessage({
                    type: 'error',
                    message: res?.errors || 'Something went wrong'
                });
                setOpenNotification(true);
            }
        }
    })

    const [totalRows, setTotalRows] = useState(data?.length || 0);
    const [schedules, setSchedules] = useState(data || []);

    const handleChangeDateRange = useCallback((key, value) => {
        if (key === 'month') {
            setDateRange((prev) => ({ ...prev, startTime: dayjs(value).startOf('month').toISOString(), endTime: dayjs(value).endOf('month').toISOString() }));
        } else {
            setDateRange((prev) => ({ ...prev, [key]: value }));
        }
    }, []);

    const handleSearch = useCallback(() => {
        setQuery((prev) => ({ ...prev, dateRange }));
    }, [dateRange]);

    const handleDeleteSchedule = useCallback((scheduleId) => {
        deleteSchedule(scheduleId);
    }, [deleteSchedule]);

    const rows = useMemo(() => {
        return schedules.map((schedule) => ({
            ...schedule,
            id: schedule.id,
            start_time: dayjs(schedule.start_time).format('YYYY-MM-DD HH:mm'),
            end_time: dayjs(schedule.end_time).format('YYYY-MM-DD HH:mm'),
        }));
    }, [schedules]);

    const initialColumns = [
        {
            field: 'id', headerName: 'ID', flex: 1, headerClassName: 'bold-header',
            cellClassName: 'bold-cell'
        },
        { field: 'title', headerName: 'Title', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'start_time', headerName: 'Start Time', flex: 1 },
        { field: 'end_time', headerName: 'End Time', flex: 1 },
        {
            field: 'actions', headerName: 'Actions', flex: 1, align: 'right', headerAlign: 'right',
            sortable: false,
            renderCell: (params) => {
                return (
                    <ButtonGroup>
                        <Button variant="contained" color="primary" onClick={() => router.push(`/schedules/${params.row.id}`)}>
                            View
                        </Button>
                        {
                            user?.role === ROLES.TEACHER && (
                                <Button variant="contained" color="error" onClick={() => handleDeleteSchedule(params.row.id)}>
                                    Delete
                                </Button>
                            )
                        }
                    </ButtonGroup>
                )
            }
        }

    ];


    const meetingCycles = useMemo(() => {
        const cycles = [];
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return cycles;
        }
        schedules.forEach((schedule) => {
            schedule.meetingCycles?.forEach((cycle) => {
                cycles.push({
                    ...cycle,
                    scheduleId: schedule.id,
                    title: schedule.title,
                })
            });
        });
        return cycles;
    }, [schedules]);

    const handleChangeView = useCallback((view) => {
        if (view === viewOptions.calendar) {
            setQuery((prev) => ({
                ...prev,
                view: viewOptions.calendar,
                dateRange: {
                    startTime: dayjs().startOf('month').toISOString(),
                    endTime: dayjs().endOf('month').toISOString()
                }
            }));
        } else {
            setQuery((prev) => ({
                ...prev,
                view: viewOptions.list,
                dateRange: defaultDateRange,
            }));
        }
        setView(view);
    }, []);

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };


    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">Schedules</Typography>
                    {
                        user?.role === ROLES.TEACHER && (
                            <Button variant="contained" color="primary" onClick={() => router.push('/schedules/add')}>Create</Button>
                        )
                    }
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {
                            view !== viewOptions.list && (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField label="Select month" type="month" InputLabelProps={{
                                        shrink: true,
                                    }} value={dateRange.startTime ? dayjs(dateRange.startTime).format('YYYY-MM') : ''} onChange={(e) => handleChangeDateRange('month', e.target.value)} />
                                    <Button variant="contained" color="inherit" size="large" onClick={handleSearch}>Search</Button>
                                </Box>
                            )
                        }
                    </Box>
                    <ButtonGroup>
                        <Button variant="contained" color={view === viewOptions.calendar ? 'primary' : 'inherit'} size="large" onClick={() => handleChangeView(viewOptions.calendar)}>Calendar</Button>
                        <Button variant="contained" color={view === viewOptions.list ? 'primary' : 'inherit'} size="large" onClick={() => handleChangeView(viewOptions.list)}>Table</Button>
                    </ButtonGroup>
                </Box>
                {view === viewOptions.calendar && <Calendar date={query?.dateRange?.startTime} meetingCycles={meetingCycles} />}
                {view === viewOptions.list && <DataGrid
                    paginationMode="server"
                    rowCount={totalRows}
                    rows={rows}
                    columns={initialColumns}
                    checkboxSelection={false}
                    rowSelectionModel={[]}
                    pageSizeOptions={[pageSize]}
                    paginationModel={{
                        page,
                        pageSize
                    }}
                />}
            </Paper>
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000} onClose={handleCloseNotification}>
                <Alert severity={message.type}>{message.message}</Alert>
            </Snackbar>
        </Box>
    )
}
