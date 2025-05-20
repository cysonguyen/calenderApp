import { getScheduleByIdApi } from "@/app/api/client/schedules";
import DateTimeRangePicker from "@/components/resources/date-time/DateRange";
import { Alert, Box, Button, ButtonGroup, Card, Divider, Popover, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Delete, Edit, Menu } from '@mui/icons-material';
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMeetingApi } from "@/app/api/client/meeting";
import { useUser } from "@/hooks/useUser";
import { ROLES } from "@/utils/const";

const defaultDateRange = {
    startTime: dayjs().toISOString(),
    endTime: dayjs().add(30, 'day').toISOString()
};

export default function ListMeeting({ scheduleId }) {
    const queryClient = useQueryClient();
    const [user] = useUser();
    const router = useRouter();
    const [dateRange, setDateRange] = useState(defaultDateRange);
    const [dateRangeFilter, setDateRangeFilter] = useState(defaultDateRange);
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: 'success',
        message: ''
    });
    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.LEADER;
    }, [user?.role]);

    const { data, isLoading } = useQuery({
        queryKey: ["listMeeting", scheduleId, dateRange],
        queryFn: () => getScheduleByIdApi({ scheduleId, dateRange }),
        placeholderData: (placeholderData) => placeholderData,
        enabled: !!scheduleId && scheduleId !== "add",
    });

    const handleClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleChangeDateRange = useCallback((key, value) => {
        setDateRangeFilter((prev) => ({ ...prev, [key]: dayjs(value).toISOString() }));
    }, []);

    console.log('dateRangeFilter', dateRangeFilter);

    const handleCloseNotification = useCallback(() => {
        setOpenNotification(false);
    }, []);

    const handleDeleteMeeting = useCallback(async (meetingId) => {
        const res = await deleteMeetingApi(meetingId);
        if (!res?.error) {
            setMessage({
                type: 'success',
                message: 'Meeting deleted successfully'
            });
            setOpenNotification(true);
            queryClient.invalidateQueries({ queryKey: ["listMeeting", scheduleId, dateRange] });
        } else {
            setMessage({
                type: 'error',
                message: 'Meeting deleted failed'
            });
            setOpenNotification(true);
        }
    }, [scheduleId, dateRange, queryClient]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                    <DateTimeRangePicker initialValue={dateRangeFilter} onChange={handleChangeDateRange} />
                    <Button variant="contained" color="inherit" size="large"
                        onClick={() => setDateRange(dateRangeFilter)}
                    >Search</Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data?.meetingCycles?.map((cycle) => {
                        const sortMeetings = cycle.Meetings?.sort((a, b) => dayjs(a.start_time).isAfter(dayjs(b.start_time)) ? -1 : 1);
                        return <Card key={cycle.cycle_index} sx={{ padding: 2, gap: 2, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ marginTop: 0 }}>Session {cycle.cycle_index} ({dayjs(cycle.start_time).format('DD/MM/YYYY HH:mm')} - {dayjs(cycle.end_time).format('DD/MM/YYYY HH:mm')})</Typography>
                                {
                                    !disabledEdit && (
                                        <Button
                                            onClick={() => router.push(`/meeting?id=add&scheduleId=${scheduleId}&indexCycle=${cycle.cycle_index}`)}
                                            variant="text" color="primary" sx={{ textDecoration: 'underline' }} size="small">Add Meeting</Button>
                                    )
                                }
                            </Box>
                            <Divider />
                            {
                                sortMeetings?.length > 0 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingInlineStart: 1 }}>
                                        {sortMeetings?.map((meeting) => (
                                            <Box key={meeting.id} sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <Typography
                                                        onClick={() => router.push(`/meeting?id=${meeting.id}&scheduleId=${scheduleId}&indexCycle=${cycle.cycle_index}`)}
                                                        variant="body1" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                                        {meeting.title}: {dayjs(meeting.start_time).format('HH:mm')} - {dayjs(meeting.end_time).format('HH:mm')}
                                                    </Typography>
                                                    {
                                                        meeting.description && (
                                                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{meeting.description}</Typography>
                                                        )
                                                    }
                                                </Box>
                                                {
                                                    !disabledEdit && (
                                                        <Box>
                                                            <Button aria-describedby={`popover-${meeting.id}`} variant="outlined" onClick={handleClick}>
                                                                <Menu />
                                                            </Button>
                                                            <Popover
                                                                id={`popover-${meeting.id}`}
                                                                open={open}
                                                                onClose={handleClose}
                                                                anchorEl={anchorEl}
                                                                anchorOrigin={{
                                                                    vertical: 'bottom',
                                                                    horizontal: 'left',
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 1, alignItems: 'flex-start' }}>
                                                                    <Button
                                                                        onClick={() => handleDeleteMeeting(meeting.id)}
                                                                        variant="text" color="error" sx={{ textAlign: 'left' }}><Delete sx={{ marginRight: 1 }} /> Delete</Button>
                                                                    <Button
                                                                        onClick={() => router.push(`/meeting?id=${meeting.id}&scheduleId=${scheduleId}&indexCycle=${cycle.cycle_index}`)}
                                                                        variant="text" color="primary" sx={{ textAlign: 'left' }}>
                                                                        <Edit sx={{ marginRight: 1 }} /> Edit
                                                                    </Button>
                                                                </Box>
                                                            </Popover>
                                                        </Box>
                                                    )
                                                }
                                            </Box>
                                        ))}
                                    </Box>
                                )
                            }
                        </Card>
                    })}
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={openNotification}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
            >
                <Alert severity={message.type}>{message.message}</Alert>
            </Snackbar>
        </Box>
    )
}


