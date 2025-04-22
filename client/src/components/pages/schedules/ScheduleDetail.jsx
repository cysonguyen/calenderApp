'use client';

import { Alert, Box, Button, Checkbox, MenuItem, Modal, Paper, Select, Snackbar, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import StudentTable from "../groups/StudentTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createScheduleApi, getScheduleByIdApi, updateScheduleApi } from "@/app/api/client/schedules";
import { useUser } from "@/hooks/useUser";
import dayjs from "dayjs";
const defaultSchedule = {
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    is_repeat: false,

}

const INTERVAL_OPTIONS = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
]

export default function ScheduleDetail({ scheduleId }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [user, _update, isInitialized] = useUser();
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: 'error',
        message: ''
    });
    const { data, isLoading } = useQuery({
        queryKey: ['schedule', scheduleId],
        queryFn: () => getScheduleByIdApi(scheduleId),
        enabled: scheduleId !== 'add' && isInitialized,
        onSuccess: (data) => {
            setSchedule(data);
            setSelectedUsers(data?.Users?.map((user) => user.id) ?? []);
        },
    })

    const { mutate: createSchedule, isLoading: isCreating } = useMutation({
        mutationFn: async (schedule) => {
            const res = await createScheduleApi({ userId: user.id, schedule });
            console.log(res);

            if (!res.errors) {
                queryClient.invalidateQueries({ queryKey: ['schedules'] });
                setOpenNotification(true);
                setMessage({
                    type: 'success',
                    message: 'Schedule created successfully'
                });
                router.push(`/schedules/${res.id}`);
            } else {
                setOpenNotification(true);
                setMessage({
                    type: 'error',
                    message: res.errors
                });
            }

        },
    })

    const { mutate: updateSchedule, isLoading: isUpdating } = useMutation({
        mutationFn: async (schedule) => {
            const res = await updateScheduleApi({ scheduleId, schedule });
            console.log(res);

            if (!res.errors) {
                queryClient.invalidateQueries({ queryKey: ['schedules'] });
                setOpenNotification(true);
                setMessage({
                    type: 'success',
                    message: 'Schedule updated successfully'
                });
            } else {
                setOpenNotification(true);
                setMessage({
                    type: 'error',
                    message: res.errors
                });
            }
        },
    })

    const initialSchedule = useMemo(() => {
        if (scheduleId === 'add') return defaultSchedule;
        if (!data || isLoading) return defaultSchedule;
        return data;
    }, [data, isLoading, scheduleId])

    const [schedule, setSchedule] = useState(initialSchedule);
    const [selectedUsers, setSelectedUsers] = useState([initialSchedule?.Users ?? []]);
    const handleChangeDetail = useCallback((key, value) => {
        setSchedule((prev) => ({ ...prev, [key]: value }));
    }, [])

    const onChangeSelectedUsers = useCallback((users) => {
        setSelectedUsers(users);
    }, [])

    

    const handleSave = useCallback(() => {
        console.log({ ...schedule, userIds: structuredClone(selectedUsers) });
        const payload = { ...schedule, userIds: structuredClone(selectedUsers) };
        if (scheduleId === 'add') {
            createSchedule(payload);
        } else {
            updateSchedule({ ...payload, scheduleId });
            console.log('payload', { ...payload, scheduleId });
        }
    }, [schedule, selectedUsers])

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 'bold' }} variant="h4">{scheduleId === 'add' ? 'Add Schedule' : 'Schedule Detail'}</Typography>
                    <Button variant="contained" color="primary" size="small" onClick={handleSave}>
                        Save
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <InputField
                        sx={{ width: '50%' }}
                        label="Title"
                        value={schedule?.title ?? ''}
                        onChange={(value) => handleChangeDetail('title', value)}
                        required
                    />
                    <InputField
                        sx={{ width: '50%' }}
                        label="Description"
                        value={schedule?.description ?? ''}
                        onChange={(value) => handleChangeDetail('description', value)}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <InputField
                            label="Start time"
                            value={schedule?.start_time ? dayjs(schedule.start_time).format('YYYY-MM-DDTHH:mm') : ''}
                            onChange={(value) => handleChangeDetail('start_time', value)}
                            type="datetime-local"
                            required
                        />
                        <InputField
                            label="End time"
                            value={schedule?.end_time ? dayjs(schedule.end_time).format('YYYY-MM-DDTHH:mm') : ''}
                            onChange={(value) => handleChangeDetail('end_time', value)}
                            type="datetime-local"
                            required
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={schedule?.is_repeat ?? false}
                            onChange={(value) => handleChangeDetail('is_repeat', !schedule?.is_repeat)}
                        />
                        <Typography sx={{ fontSize: '14px' }}>Repeat schedule</Typography>
                    </Box>
                    {
                        schedule?.is_repeat && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                    <SelectField
                                        label="Interval"
                                        value={schedule?.interval ?? ''}
                                        onChange={(value) => handleChangeDetail('interval', value)}
                                        options={INTERVAL_OPTIONS}
                                        required
                                    />
                                    <InputField
                                        label="Interval count"
                                        value={schedule?.intervalCount ?? ''}
                                        onChange={(value) => handleChangeDetail('intervalCount', value)}
                                        type="number"
                                        required
                                    />
                                </Box>
                                <InputField
                                    label="When expires"
                                    value={schedule?.when_expires ?? ''}
                                    onChange={(value) => handleChangeDetail('when_expires', value)}
                                    type="datetime-local"
                                />
                            </Box>
                        )
                    }

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '14px' }}>{scheduleId === 'add' ? 'Select students' : 'Students in schedule'}</Typography>
                            {
                                scheduleId !== 'add' && (
                                    <Button variant="text" color="primary" size="small" onClick={() => setIsOpenEditModal(true)}>
                                        Add Student
                                    </Button>
                                )
                            }
                        </Box>
                        <StudentTable
                            rows={scheduleId === 'add' ? null : schedule?.Users}
                            initialColumns={columns(router)}
                            selectedUsers={selectedUsers}
                            onSelect={onChangeSelectedUsers}
                            allowAdd={scheduleId === 'add'}
                        />
                    </Box>
                </Box >
                <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openNotification} autoHideDuration={3000} onClose={handleCloseNotification}>
                    <Alert severity={message.type}>{message.message}</Alert>
                </Snackbar>
                <Modal open={isOpenEditModal} onClose={() => setIsOpenEditModal(false)}>

                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '900px', width: '100%', bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '80vh', overflow: 'auto' }}>
                            <Typography variant="h6">Change student in schedule</Typography>
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
                            <Button variant="contained" color="primary" onClick={handleSave}>Submit</Button>
                        </Box>
                    </Box>
                </Modal>
            </Paper >
        </Box >
    )
}

const InputField = memo(({ label, value, onChange, sx, ...props }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ...sx }}>
            <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
            <TextField
                size="small"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            />
        </Box>
    )
})

const SelectField = memo(({ label, value, onChange, sx, options, ...props }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ...sx }}>
            <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
            <Select
                size="small"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    )
})

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

