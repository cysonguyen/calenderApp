"use client";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    InputLabel,
    ListItemText,
    MenuItem,
    Modal,
    OutlinedInput,
    Paper,
    Select,
    Snackbar,
    Tab,
    TextField,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StaffTable } from "../staffs/StaffsTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createScheduleApi,
    getScheduleByIdApi,
    updateScheduleApi,
} from "@/app/api/client/schedules";
import { useUser } from "@/hooks/useUser";
import dayjs from "dayjs";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ListMeeting from "../meeting/ListMeeting";
import { ROLES } from "@/utils/const";
import { useDebounce } from "@/hooks/useDebounce";
import { getGroupByQueryApi } from "@/app/api/client/account";
const defaultSchedule = {
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    is_repeat: false,
};

const INTERVAL_OPTIONS = [
    { value: "DAY", label: "Day" },
    { value: "WEEK", label: "Week" },
    { value: "MONTH", label: "Month" },
    { value: "YEAR", label: "Year" },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const PAGE_SIZE = 10;
export default function ScheduleDetail({ scheduleId }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [user, _update, isInitialized] = useUser();
    const [openNotification, setOpenNotification] = useState(false);
    const [tab, setTab] = useState("detail");
    const [searchGroup, setSearchGroup] = useState(undefined);
    const debouncedSearch = useDebounce(searchGroup, 500);

    const [message, setMessage] = useState({
        type: "error",
        message: "",
    });

    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.LEADER;
    }, [user?.role]);

    const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
        queryKey: ['groups', { name: debouncedSearch }],
        queryFn: () => getGroupByQueryApi({ name: debouncedSearch }),
        enabled: isInitialized,
    });

    const groups = useMemo(() => {
        if (!groupsData) return [];
        return groupsData?.groups ?? [];
    }, [groupsData]);

    const { data, isLoading } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: () => getScheduleByIdApi({ scheduleId }),
        enabled: !!scheduleId && scheduleId !== "add" && isInitialized,
        onSuccess: (data) => {
            setSchedule(data);
            setSelectedGroups(data?.Groups?.map((g) => g.id) ?? []);
            setSelectedUsers(data?.Users?.map((user) => user.id)?.filter((id) => id !== null) ?? []);
        },
    });

    const { mutate: createSchedule, isLoading: isCreating } = useMutation({
        mutationFn: async (schedule) => {
            const res = await createScheduleApi({ userId: user.id, schedule });
            if (!res.errors) {
                queryClient.invalidateQueries({ queryKey: ["schedules"] });
                setOpenNotification(true);
                setMessage({
                    type: "success",
                    message: "Schedule created successfully",
                });
                router.push(`/schedules/${res.id}`);
            } else {
                setOpenNotification(true);
                setMessage({
                    type: "error",
                    message: typeof res.errors === "string" ? res.errors : 'Something went wrong',
                });
            }
        },
    });

    const { mutate: updateSchedule, isLoading: isUpdating } = useMutation({
        mutationFn: async (schedule) => {
            const res = await updateScheduleApi({ userId: user.id, scheduleId, schedule });

            if (!res.errors) {
                queryClient.invalidateQueries({ queryKey: ["schedules"] });
                setOpenNotification(true);
                setMessage({
                    type: "success",
                    message: "Schedule updated successfully",
                });
            } else {
                setOpenNotification(true);
                setMessage({
                    type: "error",
                    message: typeof res.errors === "string" ? res.errors : 'Something went wrong',
                });
            }
        },
    });

    const initialSchedule = useMemo(() => {
        if (scheduleId === "add") return defaultSchedule;
        if (!data || isLoading) return defaultSchedule;
        return data;
    }, [data, isLoading, scheduleId]);

    const [selectedGroups, setSelectedGroups] = useState(initialSchedule?.Groups?.map((g) => g.id) ?? []);
    const [schedule, setSchedule] = useState(initialSchedule);
    const [selectedUsers, setSelectedUsers] = useState([
        initialSchedule?.Users ?? [],
    ]);
    const handleChangeDetail = useCallback((key, value) => {
        setSchedule((prev) => ({ ...prev, [key]: value }));

    }, []);


    const onChangeSelectedUsers = useCallback((users) => {
        setSelectedUsers(users);
    }, []);

    const handleSave = useCallback(() => {
        const payload = { ...schedule, userIds: structuredClone(selectedUsers), group_ids: structuredClone(selectedGroups) };
        if (selectedGroups.length === 0) {
            delete payload.group_ids;
        }
        if (selectedUsers.length === 0) {
            delete payload.userIds;
        }

        if (scheduleId === "add") {
            createSchedule(payload);
        } else {
            updateSchedule({ ...payload, scheduleId });
        }
    }, [schedule, selectedUsers, selectedGroups]);

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };

    const handleChangeTab = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            {
                disabledEdit ? (
                    <ScheduleInfo schedule={schedule} />
                ) : (
                    <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                        {
                            scheduleId !== "add" && (
                                <TabContext value={tab}>
                                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                        <TabList
                                            onChange={handleChangeTab}
                                            aria-label="Schedule tabs"
                                        >
                                            <Tab sx={{ width: "200px" }} label="Detail" value="detail" />
                                            <Tab sx={{ width: "200px" }} label="Meeting" value="meeting" />
                                        </TabList>
                                    </Box>
                                </TabContext>
                            )
                        }
                        {
                            tab === "detail" && (
                                <>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: "bold" }} variant="h4">
                                            {scheduleId === "add" ? "Add Schedule" : "Schedule Detail"}
                                        </Typography>
                                        {
                                            !disabledEdit && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </Button>
                                            )
                                        }
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <InputField
                                            sx={{ width: "50%" }}
                                            label="Title"
                                            value={schedule?.title ?? ""}
                                            onChange={(value) => handleChangeDetail("title", value)}
                                            required
                                        />
                                        <InputField
                                            sx={{ width: "50%" }}
                                            label="Description"
                                            value={schedule?.description ?? ""}
                                            onChange={(value) => handleChangeDetail("description", value)}
                                        />
                                        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                            <InputField
                                                label="Start time"
                                                value={
                                                    schedule?.start_time
                                                        ? dayjs(schedule.start_time).format("YYYY-MM-DDTHH:mm")
                                                        : ""
                                                }
                                                onChange={(value) => handleChangeDetail("start_time", value)}
                                                type="datetime-local"
                                                required
                                            />
                                            <InputField
                                                label="End time"
                                                value={
                                                    schedule?.end_time
                                                        ? dayjs(schedule.end_time).format("YYYY-MM-DDTHH:mm")
                                                        : ""
                                                }
                                                onChange={(value) => handleChangeDetail("end_time", value)}
                                                type="datetime-local"
                                                required
                                            />
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Checkbox
                                                checked={schedule?.is_repeat ?? false}
                                                onChange={(value) =>
                                                    handleChangeDetail("is_repeat", !schedule?.is_repeat)
                                                }
                                            />
                                            <Typography sx={{ fontSize: "14px" }}>Repeat schedule</Typography>
                                        </Box>
                                        {schedule?.is_repeat && (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                                    <SelectField
                                                        label="Interval"
                                                        value={schedule?.interval ?? ""}
                                                        onChange={(value) => handleChangeDetail("interval", value)}
                                                        options={INTERVAL_OPTIONS}
                                                        required
                                                    />
                                                    <InputField
                                                        label="Interval count"
                                                        value={schedule?.interval_count ?? ""}
                                                        onChange={(value) =>
                                                            handleChangeDetail("interval_count", value)
                                                        }
                                                        type="number"
                                                        required
                                                    />
                                                </Box>
                                                <InputField
                                                    label="When expires"
                                                    value={
                                                        schedule?.when_expires
                                                            ? dayjs(schedule.when_expires).format("YYYY-MM-DDTHH:mm")
                                                            : ""
                                                    }
                                                    onChange={(value) => handleChangeDetail("when_expires", value)}
                                                    type="datetime-local"
                                                />
                                            </Box>
                                        )}
                                    </Box>


                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Typography>Select by Group</Typography>
                                        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                            <TextField
                                                size="small"
                                                label="Search"
                                                fullWidth
                                                value={searchGroup}
                                                onChange={(e) => setSearchGroup(e.target.value)}
                                            />
                                            <Select
                                                fullWidth
                                                multiple
                                                size="small"
                                                value={selectedGroups}
                                                onChange={(value) => {
                                                    console.log(value.target.value);
                                                    setSelectedGroups(value.target.value);
                                                }}
                                                renderValue={(values) => {
                                                    if (!values || values.length === 0) return "Choose group";
                                                    const groupsData = groups?.filter((g) => values.some((v) => v == g.id));
                                                    return groupsData.map((g) => g.name).join(", ");
                                                }}
                                                MenuProps={MenuProps}
                                            >
                                                {groups?.map((group) => (
                                                    <MenuItem key={group.id} value={group.id}>
                                                        <Checkbox checked={selectedGroups.some((v) => v == group.id)} />
                                                        <ListItemText primary={group.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Box>

                                    </Box>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "14px" }}>
                                                    {scheduleId === "add"
                                                        ? "Select staffs"
                                                        : "Staffs in schedule"}
                                                </Typography>
                                                {scheduleId !== "add" && (
                                                    <Button
                                                        variant="text"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => setIsOpenEditModal(true)}
                                                    >
                                                        Add Staff
                                                    </Button>
                                                )}
                                            </Box>
                                            <StaffTable
                                                rows={scheduleId === "add" ? null : schedule?.Users}
                                                initialColumns={columns(router)}
                                                selectedUsers={selectedUsers}
                                                onSelect={onChangeSelectedUsers}
                                                allowAdd={scheduleId === "add"}
                                            />
                                        </Box>
                                    </Box>
                                </>
                            )
                        }
                        {
                            tab === "meeting" && (
                                <ListMeeting scheduleId={scheduleId} schedule={schedule} />
                            )
                        }

                        <Snackbar
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            open={openNotification}
                            autoHideDuration={3000}
                            onClose={handleCloseNotification}
                        >
                            <Alert severity={message.type}>{message.message}</Alert>
                        </Snackbar>
                        <Modal open={isOpenEditModal} onClose={() => setIsOpenEditModal(false)}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    maxWidth: "900px",
                                    width: "100%",
                                    bgcolor: "background.paper",
                                    boxShadow: 24,
                                    p: 4,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        maxHeight: "80vh",
                                        overflow: "auto",
                                    }}
                                >
                                    <Typography variant="h6">Change staff in schedule</Typography>
                                    <StaffTable
                                        rows={null}
                                        initialColumns={columns(router)}
                                        selectedUsers={selectedUsers}
                                        onSelect={onChangeSelectedUsers}
                                        allowAdd={true}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        mt: 2,
                                        mr: 2,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => setIsOpenEditModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="primary" onClick={handleSave}>
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>
                    </Paper>
                )
            }
        </Box>
    );
}

const InputField = React.memo(({ label, value, onChange, sx, ...props }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, ...sx }}>
            <Typography sx={{ fontSize: "14px" }}>{label}</Typography>
            <TextField
                size="small"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            />
        </Box>
    );
});

const SelectField = React.memo(
    ({ label, value, onChange, sx, options, ...props }) => {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, ...sx }}>
                <Typography sx={{ fontSize: "14px" }}>{label}</Typography>
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
        );
    }
);

const columns = (router) => {
    return [
        { field: "full_name", headerName: "Full name", flex: 1, minWidth: 150 },
        { field: "msnv", headerName: "MSNV", flex: 1, minWidth: 120 },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { field: "birth_day", headerName: "Birth Day", flex: 1, minWidth: 130 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 100,
            align: "right",
            headerAlign: "right",
            renderCell: (params) => {
                return (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => router?.push(`/staffs/${params.id}`)}
                    >
                        View
                    </Button>
                );
            },
        },
    ];
};

function ScheduleInfo({ schedule }) {
    if (!schedule) return null;
    return (
        <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h4">{schedule.title}</Typography>
                {
                    schedule.description && (
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>{schedule.description}</Typography>
                    )
                }
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Time:</Typography>
                    <Typography>{dayjs(schedule.start_time).format("HH:mm")} - {dayjs(schedule.end_time).format("HH:mm")} - {dayjs(schedule.start_time).format("DD/MM/YYYY")}</Typography>
                    {
                        schedule.is_repeat && (
                            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                <Typography sx={{ fontWeight: "bold" }}>Repeat:</Typography>
                                <Typography> {getIntervalText(schedule.interval, schedule.interval_count)} </Typography>
                            </Box>
                        )
                    }
                </Box>

            </Box>
            <Divider />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontWeight: "bold" }}>Meetings:</Typography>
                <ListMeeting scheduleId={schedule.id} schedule={schedule} />
            </Box>
        </Paper >
    );
}

function getIntervalText(interval, intervalCount) {
    if (Number(intervalCount) === 1) {
        return `${intervalCount} ${interval.toLowerCase()}`;
    }
    return `${intervalCount} ${interval.toLowerCase()}s`;
}
