'use client'

import { createMeetingApi, getMeetingByIdApi, updateMeetingApi } from "@/app/api/client/meeting";
import { Box, Paper, Typography, Button, TextField, Modal, Snackbar, Alert, Card, CardContent } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReportEditor from "./ReportEditor";
import React, { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useUser } from "@/hooks/useUser";
import { getScheduleByIdApi } from "@/app/api/client/schedules";
import { ROLES } from "@/utils/const";
import { StaffTable } from "../groups/StaffsTable";
import { createReportApi, deleteReportApi, updateReportApi } from "@/app/api/client/report";
import { Delete, Edit } from "@mui/icons-material";
import { JobDetail } from "@/components/jobs/JobDetails";

export default function MeetingDetail({ id, scheduleId, indexCycle }) {
    const queryClient = useQueryClient();
    const [user, _update, isInitialized] = useUser();
    const [isOpenReportModal, setIsOpenReportModal] = useState(false);

    const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
        queryKey: ["schedule", scheduleId],
        queryFn: () => getScheduleByIdApi({ scheduleId }),
        placeholderData: (placeholderData) => placeholderData,
        enabled: !!scheduleId && isInitialized,
        onSuccess: (data) => {
            setSelectedUsers(data?.accepted_ids ? JSON.parse(data?.accepted_ids) : []);
        }
    });

    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.LEADER;
    }, [user?.role]);

    const { data, isLoading } = useQuery({
        queryKey: ["meeting", id],
        queryFn: () => getMeetingByIdApi(id),
        placeholderData: (placeholderData) => placeholderData,
        enabled: !!id && id !== "add" && isInitialized,
        onSuccess: (data) => {
            setMeeting(data);
            setSelectedUsers(JSON.parse(data?.list_partner_ids ?? "[]"));
        }
    });
    const router = useRouter();
    const [meeting, setMeeting] = useState(data);
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: "error",
        message: "",
    });
    const [selectedUsers, setSelectedUsers] = useState(JSON.parse(data?.list_partner_ids ?? "[]"));
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);

    const handleCloseNotification = () => {
        setOpenNotification(false);
    };

    const handleSave = useCallback(async () => {
        const start_time = dayjs(schedule?.start_time).add((Number(indexCycle) - 1) * Number(schedule?.interval_count), schedule?.interval).toISOString();
        const end_time = dayjs(schedule?.end_time).add((Number(indexCycle) - 1) * Number(schedule?.interval_count), schedule?.interval).toISOString();
        const payLoad = {
            ...meeting,
            start_time: start_time,
            end_time: end_time,
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
                    <MeetingInfo meeting={meeting} scheduleId={scheduleId} indexCycle={indexCycle} schedule={schedule} />
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
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Typography variant="h4">{id === "add" ? "New Meeting" : "Meeting Detail"}</Typography>
                                    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                        <Typography sx={{ fontWeight: "bold" }}>Time:</Typography>
                                        <Typography>{dayjs(schedule?.start_time).format("HH:mm")} - {dayjs(schedule?.end_time).format("HH:mm")}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                </Box>
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
                                                ? "Select staffs"
                                                : "Staffs in meeting"}
                                        </Typography>

                                    </Box>
                                    <StaffTable
                                        rows={schedule?.Users}
                                        initialColumns={columns(router)}
                                        selectedUsers={selectedUsers}
                                        onSelect={onChangeSelectedUsers}
                                        allowAdd={id === "add"}
                                        isFetch={id !== "add"}
                                    />
                                </Box>
                            </Box>
                            {
                                id !== "add" && (
                                    <JobDetail scheduleId={scheduleId} indexCycle={indexCycle} listStaffs={schedule?.Users ?? []} disabledEdit={disabledEdit} />
                                )
                            }
                            {
                                id !== "add" && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography sx={{ fontWeight: "bold" }}>Report:</Typography>
                                            <Button variant="outlined" color="primary" size="small" onClick={() => setIsOpenReportModal(true)}>Add Report</Button>
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            {
                                                isOpenReportModal ? (
                                                    <ReportModalDialog open={isOpenReportModal} onClose={() => setIsOpenReportModal(false)} meetingId={id} />
                                                ) : (
                                                    meeting?.Reports?.length === 0 ? (
                                                        <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>No report</Typography>
                                                    ) : (
                                                        meeting?.Reports?.map((report) => (
                                                            <ReportInfo key={`report-${report.id}`} report={report} meetingId={id} />
                                                        ))
                                                    )
                                                )
                                            }
                                        </Box>
                                    </Box>
                                )
                            }
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

const MeetingInfo = ({ meeting, scheduleId, indexCycle, schedule }) => {
    if (!meeting) return null;
    const [user, _update, isInitialized] = useUser();
    const disabledEdit = useMemo(() => {
        return user?.role !== ROLES.LEADER;
    }, [user?.role]);
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
            <JobDetail scheduleId={scheduleId} indexCycle={indexCycle} listStaffs={schedule?.Users ?? []} disabledEdit={disabledEdit} />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: "bold" }}>Report</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {
                        meeting?.Reports?.length === 0 ? (
                            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>No report</Typography>
                        ) : (
                            meeting?.Reports?.map((report) => (
                                <ReportInfo key={`report-${report.id}`} report={report} meetingId={meeting.id} disabledEdit={disabledEdit} />
                            ))
                        )
                    }
                </Box>
            </Box>
        </Paper >
    )
}

export function ReportInfo({ report, meetingId, disabledEdit }) {
    const queryClient = useQueryClient();
    const [isOpenReportModal, setIsOpenReportModal] = useState(false);
    const handleDeleteReport = useCallback(async () => {
        const res = await deleteReportApi({ reportId: report.id });
        if (!res?.errors) {
            queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
        }
    }, [report.id, meetingId]);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card>
                {
                    isOpenReportModal ? <CardContent>
                        <ReportModalDialog open={isOpenReportModal} onClose={() => setIsOpenReportModal(false)} meetingId={meetingId} initialReport={report} />
                    </CardContent> :
                        <CardContent>
                            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <Typography sx={{ fontWeight: "bold" }}>{report?.title ?? "No Title"}</Typography>
                                {
                                    !disabledEdit &&
                                    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                                        <Button variant="outlined" color="primary" size="small" onClick={() => setIsOpenReportModal(true)}><Edit fontSize="small" /></Button>
                                        <Button variant="outlined" color="error" size="small" onClick={handleDeleteReport}><Delete fontSize="small" /></Button>
                                    </Box>
                                }
                            </Box>
                            <Box dangerouslySetInnerHTML={{ __html: report?.content ?? "No Content" }} />
                        </CardContent>
                }
            </Card>
        </Box>
    )
}

export function ReportModalDialog({ open, onClose, initialReport, meetingId }) {
    const queryClient = useQueryClient();
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: "error",
        message: "",
    });

    const handleSave = useCallback(async (value) => {
        const payLoad = {
            meeting_id: meetingId,
            ...value,
        }
        try {
            let res = null;
            if (initialReport) {
                res = await updateReportApi({ reportId: initialReport.id, report: payLoad });
            } else {
                res = await createReportApi({ report: payLoad });
            }
            if (!res?.errors) {
                setOpenNotification(true);
                setMessage({
                    type: "success",
                    message: "Report saved successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
                onClose?.(value);
            } else {
                setOpenNotification(true);
                setMessage({
                    type: "error",
                    message: "Report saved failed",
                });
            }
        } catch (error) {
            setOpenNotification(true);
            setMessage({
                type: "error",
                message: "Report saved failed",
            });
        }
    }, [onClose, meetingId]);
    const handleCloseNotification = () => {
        setOpenNotification(false);
    };
    if (!open) return null;
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {
                initialReport && (
                    <Typography variant="h6">{initialReport.title}</Typography>
                )
            }
            <ReportEditor initialContent={initialReport?.content} initialTitle={initialReport?.title} onSubmit={(value) => handleSave(value)} onClose={onClose} />
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
