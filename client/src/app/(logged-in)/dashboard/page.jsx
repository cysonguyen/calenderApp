'use client';

import * as React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              color: 'white',
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome back!
            </Typography>
            <Typography variant="body1">
              Here&apos;s what&apos;s happening with your calendar today.
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Calendar Overview
            </Typography>
            {/* Calendar component will go here */}
          </Paper>
        </Grid>
        {/* Recent Events */}
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Events
            </Typography>
            {/* Recent events list will go here */}
          </Paper>
        </Grid>
        {/* Upcoming Events */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Upcoming Events
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Statistics
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 