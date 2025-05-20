'use client';

import { useQuery } from "@tanstack/react-query";
import { Box, Button, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import { getUser } from "@/app/api/client/account";
import { ROLES } from "@/utils/const";
export default function StaffDetail({ staffId }) {
    const { data: user, isLoading } = useQuery({
        queryKey: ['staff', staffId],
        queryFn: () => getUser(staffId),
        enabled: !!staffId && !staffId?.includes('add'),
    });

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4">Staff Detail</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Typography variant="body2">Full name: {user?.full_name ?? 'N/A'}</Typography>
                        <Typography variant="body2">Email: {user?.email ?? 'N/A'}</Typography>
                        <Typography variant="body2">Date of birth: {user?.birth_day ? dayjs(user?.birth_day).format('DD/MM/YYYY') : 'N/A'}</Typography>
                        <Typography variant="body2">Level: {user?.level ?? 'N/A'}</Typography>
                        <Typography variant="body2">Work place: {user?.work_place ?? 'N/A'}</Typography>
                        <Typography variant="body2">MSNV: {user?.msnv ?? 'N/A'}</Typography>
                    </Box>
                </Box>
            </Paper>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4">Meeting report</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                </Box>
            </Paper>
        </Box>
    )
}
