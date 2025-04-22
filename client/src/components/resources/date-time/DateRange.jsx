import React, { useCallback, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Stack, TextField } from '@mui/material';
import dayjs from 'dayjs';

function DateTimeRangePicker({ onChange, initialValue }) {
    const [start, setStart] = useState(dayjs(initialValue?.startTime));
    const [end, setEnd] = useState(dayjs(initialValue?.endTime));

    const handleStartChange = useCallback((newValue) => {
        setStart(newValue);
        onChange?.('startTime', newValue);
    }, [onChange]);

    const handleEndChange = useCallback((newValue) => {
        setEnd(newValue);
        onChange?.('endTime', newValue);
    }, [onChange]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2} direction="row">
                <DateTimePicker
                    label="Start Time"
                    value={start}
                    onChange={handleStartChange}
                    renderInput={(params) => <TextField {...params} />}
                />
                <DateTimePicker
                    label="End Time"
                    value={end}
                    onChange={handleEndChange}
                    minDateTime={start}
                    renderInput={(params) => <TextField {...params} />}
                />
            </Stack>
        </LocalizationProvider>
    );
}

export default DateTimeRangePicker;