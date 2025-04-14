import { Box, Paper, Typography } from "@mui/material";

export default function ScheduleDetail({ scheduleId }) {
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4">Schedule Detail</Typography>
            </Paper>
        </Box>
    )
}
