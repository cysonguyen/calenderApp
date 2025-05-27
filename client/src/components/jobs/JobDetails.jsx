import { Alert, Box, Button, Card, CardContent, Checkbox, Chip, List, ListItem, ListItemText, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createJobApi, getJobsByScheduleId, updateJobApi } from "@/app/api/client/jobs";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useUser } from "@/hooks/useUser";

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

export function JobDetail({ scheduleId, indexCycle, listStaffs, disabledEdit }) {
    const [jobType, setJobType] = useState("IN_PROGRESS");
    const { data, isLoading } = useQuery({
        queryKey: ["jobs", scheduleId, indexCycle, jobType],
        queryFn: () => getJobsByScheduleId(scheduleId, indexCycle, jobType),
        enabled: !!scheduleId && !!indexCycle,
    });
    const [isAddJobOpen, setIsAddJobOpen] = useState(false);

    const { jobs } = useMemo(() => {
        if (!data || isLoading) return { jobs: [] };
        const { jobs } = data;
        return { jobs };
    }, [data, isLoading])

    console.log('disabledEdit', disabledEdit);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography fontWeight="bold">Jobs</Typography>
                    {
                        !jobs?.length && !isAddJobOpen && (
                            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                                No job
                            </Typography>
                        )
                    }
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                        <Typography>Job Type:</Typography>
                        <Select
                            size="small"
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                        >
                            <MenuItem value="IN_PROGRESS">In progress</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>
                        </Select>
                    </Box>
                    {!disabledEdit && <Button size="small" variant="outlined" color="primary" onClick={() => setIsAddJobOpen(true)}>New Job</Button>}
                </Box>
            </Box>
            {
                isAddJobOpen && (
                    <JobDialog onClose={() => setIsAddJobOpen(false)} listStaffs={listStaffs} scheduleId={scheduleId} indexCycle={indexCycle} disabledEdit={disabledEdit} />
                )
            }
            {
                jobs?.map((job) => (
                    <JobItemInfo key={job.id} job={job} listStaffs={listStaffs} scheduleId={scheduleId} indexCycle={indexCycle} disabledEdit={disabledEdit} />
                ))
            }
        </Box>
    )
}

function JobItemInfo({ job, listStaffs, scheduleId, indexCycle, disabledEdit }) {
    const [isUpdateJobOpen, setIsUpdateJobOpen] = useState(false);
    const [user, _update, isInitialized] = useUser();
    const [isShowMoreTasks, setIsShowMoreTasks] = useState(false);

    const allowEdit = useMemo(() => {
        if (!disabledEdit) return true;
        if (!Array.isArray(job?.Users) || job?.Users?.length === 0) return false;
        return job?.Users?.some((e) => e.id == user?.id);
    }, [disabledEdit, job.Users, user?.id]);

    console.log('allowEdit', allowEdit, disabledEdit);

    if (isUpdateJobOpen) {
        return (
            <JobDialog
                onClose={() => setIsUpdateJobOpen(false)}
                initialJob={{
                    ...job,
                    tasks: job.Tasks?.map((task) => task)
                }}
                listStaffs={listStaffs}
                scheduleId={scheduleId}
                indexCycle={indexCycle}
                disabledEdit={disabledEdit} />
        )
    }

    return (
        <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                        <Typography fontWeight="bold">{job.title} - {job.closed}/{job.total} tasks</Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                            <Chip label={job.status === "IN_PROGRESS" ? "In Progress" : "Closed"}
                                color={job.status === "IN_PROGRESS" ? "primary" : ""} />
                            {
                                allowEdit && (
                                    <Button size="small" variant="outlined" color="secondary" onClick={() => setIsUpdateJobOpen(true)}>Update</Button>
                                )
                            }
                        </Box>
                    </Box>
                    {
                        job.description && (
                            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>{job.description}</Typography>
                        )
                    }
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box>
                        <Typography>Deadline: {dayjs(job.deadline).format("HH:mm, DD/MM/YYYY")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                            <Typography>Assign to:</Typography>
                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                                {job.Users?.map((user) => (
                                    <Chip key={user.id} label={user.full_name} />
                                ))}
                            </Box>
                        </Box>
                        {
                            !isShowMoreTasks && (
                                <Button size="small" variant="text" color="primary" onClick={() => setIsShowMoreTasks(true)}>Show more</Button>
                            )
                        }
                    </Box>
                    {
                        isShowMoreTasks && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>

                                    <Typography fontWeight="bold">Tasks:</Typography>
                                    {
                                        isShowMoreTasks && (
                                            <Button size="small" variant="text" color="primary" onClick={() => setIsShowMoreTasks(false)}>Show less</Button>
                                        )
                                    }
                                </Box>
                                {
                                    !job.Tasks?.length && (
                                        <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                                            No task
                                        </Typography>
                                    )
                                }
                                {
                                    job.Tasks?.map((task) => (
                                        <Card key={task.id}>
                                            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                                                        <Typography>{task.title}</Typography>
                                                        <Chip label={task.status === "IN_PROGRESS" ? "In Progress" : "Closed"}
                                                            color={task.status === "IN_PROGRESS" ? "primary" : ""} />
                                                    </Box>

                                                    {
                                                        task.description && (
                                                            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>{task.description}</Typography>
                                                        )
                                                    }
                                                </Box>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, }}>
                                                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                                                        <Typography>Assign to:</Typography>
                                                        <Chip label={job.Users?.find((user) => user.id == task.assignee_id)?.full_name} />
                                                    </Box>
                                                    <Typography>Deadline: {dayjs(task.deadline).format("HH:mm, DD/MM/YYYY")}</Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))
                                }
                            </Box>
                        )
                    }

                </Box>
            </CardContent>
        </Card>
    )
}

const initialTask = {
    title: "New Task",
    description: "",
}

function JobDialog({ onClose, initialJob, listStaffs, scheduleId, indexCycle, disabledEdit }) {
    const queryClient = useQueryClient();
    const [job, setJob] = useState(initialJob);
    const [selectedStaffs, setSelectedStaffs] = useState(initialJob?.Users?.map((user) => user.id) ?? []);
    const handleChange = useCallback((value, key) => {
        console.log(value, key);
        setJob({ ...job, [key]: value });
    }, [job]);
    const [searchStaff, setSearchStaff] = useState("");
    const [openNotification, setOpenNotification] = useState(false);
    const [message, setMessage] = useState({
        type: "error",
        message: "",
    });

    console.log(job);


    const handleCloseNotification = () => {
        setOpenNotification(false);
    };


    const staffsOptions = useMemo(() => {
        if (!listStaffs) return [];
        if (!searchStaff) return listStaffs?.map((staff) => ({
            label: staff.full_name,
            value: staff.id
        }));
        return listStaffs?.filter((staff) => staff.full_name.toLowerCase().includes(searchStaff.toLowerCase())).map((staff) => ({
            label: staff.full_name,
            value: staff.id
        }));
    }, [listStaffs, searchStaff]);

    const handleAddTask = useCallback(() => {
        setJob((prev) => {
            const existingTasks = structuredClone(prev?.tasks ?? []);
            const newTasks = [initialTask, ...existingTasks];
            return { ...prev, tasks: newTasks };
        });
    }, [job]);

    const handleDeleteTask = useCallback((index) => {
        setJob((prev) => {
            const existingTasks = structuredClone(prev?.tasks ?? []);
            const newTasks = existingTasks.filter((task, i) => i !== index);
            return { ...prev, tasks: newTasks };
        });
    }, [job]);

    const handleClose = useCallback(() => {
        setJob(initialJob);
        onClose?.();
    }, [onClose, initialJob]);

    const handleSave = useCallback(async () => {
        const payload = {
            ...job,
            schedule_id: scheduleId,
            cycle_start: indexCycle,
            user_ids: selectedStaffs,
        }
        try {
            let res;
            if (initialJob?.id) {
                res = await updateJobApi({ payload: { ...payload, jobId: initialJob?.id } });
            } else {
                res = await createJobApi({ payload });
            }
            if (!res?.errors) {
                queryClient.invalidateQueries({ queryKey: ["jobs", scheduleId, indexCycle] });
                setOpenNotification(true);
                setMessage({
                    type: "success",
                    message: "Updated successfully",
                });
                setTimeout(() => {
                    handleClose();
                }, 1000);
            } else {
                setOpenNotification(true);
                setMessage({
                    type: "error",
                    message: res?.errors?.message ?? "Something went wrong",
                });
            }
        } catch (error) {
            console.error(error);
        }
    }, [job, selectedStaffs]);

    const handleUpdateTask = useCallback((index, key, value) => {
        setJob((prev) => {
            const existingTasks = structuredClone(prev?.tasks ?? []);
            const newTasks = existingTasks.map((t, i) => i === index ? { ...t, [key]: value } : t);
            return { ...prev, tasks: newTasks };
        });
    }, [job]);

    console.log('disabledEdit', disabledEdit);

    return (
        <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField size="small" label="Title" value={job?.title ?? ""} onChange={(e) => handleChange(e.target.value, "title")} />
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                        <TextField size="small" fullWidth label="Description" value={job?.description ?? ""} onChange={(e) => handleChange(e.target.value, "description")} />
                        <TextField size="small" fullWidth label="Deadline" disabled={disabledEdit} type="date" InputLabelProps={{
                            shrink: true,
                        }} value={dayjs(job?.deadline).format("YYYY-MM-DD") ?? ""} onChange={(e) => handleChange(e.target.value, "deadline")} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography>Assign to</Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                            <TextField
                                size="small"
                                label="Search"
                                fullWidth
                                value={searchStaff}
                                onChange={(e) => setSearchStaff(e.target.value)}
                                disabled={disabledEdit}
                            />
                            <Select
                                fullWidth
                                multiple
                                size="small"
                                value={selectedStaffs}
                                onChange={(value) => {
                                    setSelectedStaffs(value.target.value);
                                }}
                                disabled={disabledEdit}
                                renderValue={(values) => {
                                    if (!values || values.length === 0) return "Choose staff";
                                    const staffsData = staffsOptions?.filter((g) => values.some((v) => v == g.value));
                                    return staffsData.map((g) => g.label).join(", ");
                                }}
                                MenuProps={MenuProps}
                            >
                                {staffsOptions?.map((staff) => (
                                    <MenuItem key={staff.id} value={staff.value}>
                                        <Checkbox checked={selectedStaffs.some((v) => v == staff.value)} />
                                        <ListItemText primary={staff.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                                <Typography>Tasks</Typography>
                                <Chip label={job?.status === "IN_PROGRESS" ? "In Progress" : "Closed"}
                                    color={job?.status === "IN_PROGRESS" ? "primary" : ""} />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                                {
                                    job?.status !== "CLOSED" ? (
                                        <Button size="small" variant="outlined" color="secondary" onClick={() => handleChange("CLOSED", "status")}>Mark as done all</Button>
                                    ) : (
                                        <Button size="small" variant="outlined" color="primary" onClick={() => handleChange("IN_PROGRESS", "status")}>Mark as in progress</Button>
                                    )
                                }
                                <Button size="small" variant="outlined" color="primary" onClick={handleAddTask}>New Task</Button>
                            </Box>
                        </Box>
                        {
                            !job?.tasks?.length && (
                                <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                                    No task
                                </Typography>
                            )
                        }
                        {
                            job?.tasks?.map((task, index) => (
                                <TaskItemDetail key={`task-${index}`}
                                    task={task}
                                    index={index}
                                    onDelete={() => handleDeleteTask(index)}
                                    listStaffs={listStaffs}
                                    selectedStaffs={selectedStaffs}
                                    onUpdateTask={handleUpdateTask}
                                    disabledEdit={disabledEdit} />
                            ))
                        }
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                        <Button size="small" variant="contained" color="primary" onClick={handleSave}>Save</Button>
                        <Button size="small" variant="contained" color="secondary" onClick={handleClose}>Cancel</Button>
                    </Box>
                </Box>
            </CardContent>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={openNotification}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
            >
                <Alert severity={message.type}>{message.message}</Alert>
            </Snackbar>
        </Card>
    )
}

function TaskItemDetail({ task, onDelete, index, listStaffs, selectedStaffs, onUpdateTask, disabledEdit }) {
    const [searchStaff, setSearchStaff] = useState("");

    console.log('disabledEdit', disabledEdit);

    const staffsOptions = useMemo(() => {
        if (!listStaffs) return [];
        let filteredStaffs = listStaffs;
        if (searchStaff) {
            filteredStaffs = listStaffs?.filter((staff) => staff.full_name.toLowerCase().includes(searchStaff.toLowerCase()));
        }
        return filteredStaffs?.filter((staff) => selectedStaffs?.some((v) => v == staff.id)).map((staff) => ({
            label: staff.full_name,
            value: staff.id
        }));
    }, [listStaffs, searchStaff, selectedStaffs]);


    return (
        <Card >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
                <TextField size="small" label="Title" value={task?.title ?? ""} onChange={(e) => onUpdateTask?.(index, "title", e.target.value)} />
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <TextField size="small" fullWidth label="Description" value={task?.description ?? ""} onChange={(e) => onUpdateTask?.(index, "description", e.target.value)} />
                    <TextField size="small" fullWidth label="Deadline" disabled={disabledEdit} type="date" InputLabelProps={{
                        shrink: true,
                    }} value={dayjs(task?.deadline).format("YYYY-MM-DD") ?? ""} onChange={(e) => onUpdateTask?.(index, "deadline", e.target.value)} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography>Assign to</Typography>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                        <TextField
                            size="small"
                            label="Search"
                            fullWidth
                            value={searchStaff}
                            onChange={(e) => setSearchStaff(e.target.value)}
                        />
                        <Select
                            fullWidth
                            size="small"
                            value={task?.assignee_id ?? ""}
                            onChange={(value) => {
                                onUpdateTask?.(index, "assignee_id", value.target.value);
                            }}
                            renderValue={(value) => {
                                if (!value) return "Choose staff";
                                const staffsData = staffsOptions?.find((g) => value == g.value);
                                return staffsData?.label;
                            }}
                            MenuProps={MenuProps}
                            disabled={disabledEdit}
                        >
                            {staffsOptions?.map((staff) => (
                                <MenuItem key={staff.id} value={staff.value ?? ""}>
                                    <Checkbox checked={task?.assignee_id == staff.value} />
                                    <ListItemText primary={staff.label ?? ""} />
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    {
                        task?.status !== "CLOSED" ? (
                            <Button size="small" variant="outlined" color="success" onClick={() => onUpdateTask?.(index, "status", "CLOSED")}>Mark as done</Button>
                        ) : (
                            <Button size="small" variant="outlined" color="secondary" onClick={() => onUpdateTask?.(index, "status", "IN_PROGRESS")}>Mark as in progress</Button>
                        )
                    }
                    <Button size="small" variant="outlined" color="warning" onClick={() => onDelete?.(index)}>Delete</Button>
                </Box>
            </CardContent>
        </Card>
    )
}