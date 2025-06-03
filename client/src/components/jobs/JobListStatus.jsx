import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Box, Typography, LinearProgress } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";

export function JobListStatus({ jobs, cycleIndex }) {
    const [expandedJob, setExpandedJob] = useState({});

    const jobsData = useMemo(() => {
        return jobs?.map((job) => {
            const tasks = job.Tasks.map((task) => {
                return {
                    ...task,
                    status: task.status === "CLOSED" && task.done_at <= Number(cycleIndex)
                }
            });
            const closedTasks = tasks?.filter((task) => {
                return task.status
            });
            const totalTasks = job.Tasks?.length;

            return {
                ...job,
                Tasks: tasks?.sort((a, b) => (Number(a.id) - Number(b.id))),
                progress: {
                    in_progress: totalTasks - closedTasks?.length,
                    total: totalTasks,
                    closed: closedTasks?.length
                },
                isDone: job.status === "CLOSED" && job.cycle_end <= cycleIndex
            }
        });
    }, [jobs]);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {jobsData?.map((job) => (
                <Box key={job.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{job.title}</Typography>
                            {
                                job.deadline && (
                                    <Typography sx={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Deadline: {dayjs(job.deadline).format('DD/MM/YYYY HH:mm')}</Typography>
                                )
                            }
                        </Box>
                        {
                            !expandedJob[`job_${job.id}`] ? (
                                <ArrowDropUp sx={{ cursor: 'pointer' }} onClick={() => setExpandedJob((prev) => ({ ...prev, [`job_${job.id}`]: !prev[`job_${job.id}`] }))} />
                            ) : (
                                <ArrowDropDown sx={{ cursor: 'pointer' }} onClick={() => setExpandedJob((prev) => ({ ...prev, [`job_${job.id}`]: !prev[`job_${job.id}`] }))} />
                            )
                        }
                    </Box>
                    {
                        expandedJob[`job_${job.id}`] && (
                            <Typography sx={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{job.description}</Typography>
                        )
                    }
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate"
                                color={job.isDone ? "primary" : "warning"}
                                value={job.isDone ? 100 : job.progress.closed / job.progress.total * 100} />
                        </Box>
                        {
                            !job.isDone && (
                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}> {job.progress.closed} / {job.progress.total} {job.progress.total > 1 ? "Tasks" : "Task"}</Typography>
                            )
                        }
                    </Box>
                    {
                        expandedJob[`job_${job.id}`] && (
                            <Box sx={{ paddingLeft: 2, fontSize: '0.9rem', fontStyle: 'italic' }}>
                                <Typography>Tasks</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {job.Tasks?.map((task) => (
                                        <Box key={`task_${task.id}`} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', textDecoration: task.status || job.isDone ? 'line-through' : 'none' }}>
                                            <Typography sx={{ fontSize: '0.9rem' }}>- {task.title} {task.deadline && `Deadline: ${dayjs(task.deadline).format('DD/MM/YYYY HH:mm')}`}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )
                    }
                </Box>
            ))}
        </Box>
    )
}
