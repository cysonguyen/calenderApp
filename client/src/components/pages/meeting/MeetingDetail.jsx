'use client'

import { createMeetingApi, getMeetingByIdApi, updateMeetingApi } from "@/app/api/client/meeting";
import { Box, Paper, Typography, Button, TextField, Modal, Snackbar, Alert } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReportEditor from "./ReportEditor";
import React, { useState, useCallback, useRef, useMemo } from "react";
import StudentTable from "../groups/StudentTable";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useUser } from "@/hooks/useUser";
import { getScheduleByIdApi } from "@/app/api/client/schedules";
import { ROLES } from "@/utils/const";
export default function MeetingDetail({ id, scheduleId, indexCycle }) {
    const queryClient = useQueryClient();
    const [user, _update, isInitialized] = useUser();

    const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: () => getScheduleByIdApi({ scheduleId }),
        placeholderData: (placeholderData) => placeholderData,
        enabled: !!scheduleId && isInitialized && id === "add",
        onSuccess: (data) => {
            setSelectedUsers(data?.Users?.map((user) => user.id) ?? []);
        }
    });

    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.TEACHER;
    }, [user?.role]);

    const { data, isLoading } = useQuery({
        queryKey: ["meeting", id],
        queryFn: () => getMeetingByIdApi(id),
        placeholderData: (placeholderData) => placeholderData,
        enabled: !!id && id !== "add" && isInitialized,
        onSuccess: (data) => {
            setMeeting(data);
            setSelectedUsers(JSON.parse(data?.list_partner_ids ?? "[]"));
            reportRef.current = data?.report ?? "";
        }
    });
    const router = useRouter();
    const [meeting, setMeeting] = useState(data);
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: "error",
        message: "",
    });
    const reportRef = useRef(data?.report ?? "");
    const [selectedUsers, setSelectedUsers] = useState(JSON.parse(data?.list_partner_ids ?? "[]"));
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const handleChangeReport = useCallback((newContent) => {
        console.log('newContent', newContent);
        setMeeting((prev) => ({ ...prev, report: newContent }));
    }, []);

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };


    const handleSave = useCallback(async () => {
        const payLoad = {
            ...meeting,
            list_partner_ids: selectedUsers,
            cycle_index: indexCycle,
            schedule_id: scheduleId,
        }
        let res = null;
        if (id === "add") {
            res = await createMeetingApi({ meeting: payLoad });
        } else {
            res = await updateMeetingApi({ meetingId: id, meeting: payLoad });
        }
        if (!res?.errors) {
            setOpenNotification(true);
            setMessage({
                type: "success",
                message: "Meeting saved successfully",
            });
            if (id === "add") {
                router.push(`/meeting?id=${res.id}&scheduleId=${scheduleId}&indexCycle=${indexCycle}`);
            } else {
                queryClient.invalidateQueries({ queryKey: ["meeting", id] });
            }
        } else {
            setOpenNotification(true);
            setMessage({
                type: "error",
                message: "Meeting saved failed",
            });
        }
    }, [meeting, selectedUsers]);

    const handleChangeDetail = useCallback((key, value) => {
        setMeeting((prev) => ({ ...prev, [key]: value }));
    }, []);

    const onChangeSelectedUsers = useCallback((selectedUsers) => {
        setSelectedUsers(selectedUsers);
    }, []);

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
                    <MeetingInfo meeting={meeting} />
                ) : (
                    <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="h4">{id === "add" ? "New Meeting" : "Meeting Detail"}</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={handleSave}
                                >
                                    Save
                                </Button>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <InputField
                                    sx={{ width: "50%" }}
                                    label="Title"
                                    value={meeting?.title ?? ""}
                                    onChange={(value) => handleChangeDetail("title", value)}
                                    required
                                />
                                <InputField
                                    sx={{ width: "50%" }}
                                    label="Description"
                                    value={meeting?.description ?? ""}
                                    onChange={(value) => handleChangeDetail("description", value)}
                                />
                                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                    <InputField
                                        label="Start time"
                                        value={
                                            meeting?.start_time
                                                ? dayjs(meeting.start_time).format("YYYY-MM-DDTHH:mm")
                                                : ""
                                        }
                                        onChange={(value) => handleChangeDetail("start_time", value)}
                                        type="datetime-local"
                                        required
                                    />
                                    <InputField
                                        label="End time"
                                        value={
                                            meeting?.end_time
                                                ? dayjs(meeting.end_time).format("YYYY-MM-DDTHH:mm")
                                                : ""
                                        }
                                        onChange={(value) => handleChangeDetail("end_time", value)}
                                        type="datetime-local"
                                        required
                                    />
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
                                            {id === "add"
                                                ? "Select students"
                                                : "Students in meeting"}
                                        </Typography>
                                        {id !== "add" && (
                                            <Button
                                                variant="text"
                                                color="primary"
                                                size="small"
                                                onClick={() => setIsOpenEditModal(true)}
                                            >
                                                Add Student
                                            </Button>
                                        )}
                                    </Box>
                                    <StudentTable
                                        rows={schedule?.Users}
                                        initialColumns={columns(router)}
                                        selectedUsers={selectedUsers}
                                        onSelect={onChangeSelectedUsers}
                                        allowAdd={id === "add"}
                                        isFetch={id !== "add"}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Typography >Report:</Typography>
                                <ReportEditor initialValue={reportRef.current} onChange={handleChangeReport} />
                            </Box>
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
                                        <Typography variant="h6">Change student in schedule</Typography>
                                        <StudentTable
                                            rows={schedule?.Users}
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
                            <Snackbar
                                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                open={openNotification}
                                autoHideDuration={3000}
                                onClose={handleCloseNotification}
                            >
                                <Alert severity={message.type}>{message.message}</Alert>
                            </Snackbar>
                        </Box>
                    </Paper>
                )
            }
        </Box>
    )
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

const columns = (router) => {
    return [
        { field: "full_name", headerName: "Full name", flex: 1, minWidth: 150 },
        { field: "mssv", headerName: "MSSV", flex: 1, minWidth: 120 },
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
                        onClick={() => router?.push(`/students/${params.id}`)}
                    >
                        View
                    </Button>
                );
            },
        },
    ];
};

const MeetingInfo = ({ meeting }) => {
    if (!meeting) return null;
    return (
        <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h4">{meeting.title}</Typography>
                {
                    meeting.description && (
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>{meeting.description}</Typography>
                    )
                }
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Time:</Typography>
                    <Typography>{dayjs(meeting.start_time).format("HH:mm")} - {dayjs(meeting.end_time).format("HH:mm")} - {dayjs(meeting.start_time).format("DD/MM/YYYY")}</Typography>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: "bold" }}>Report:</Typography>
                <Box dangerouslySetInnerHTML={{ __html: meeting.report ?? "No report" }} />
            </Box>
        </Paper >
    )
}
