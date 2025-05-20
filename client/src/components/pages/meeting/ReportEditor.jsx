import dynamic from 'next/dynamic';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';

const JoditEditorNoSSR = dynamic(() => import('jodit-react'), { ssr: false });

const ReportEditor = ({ onSubmit, initialContent, initialTitle, onClose }) => {
    const refContent = useRef(initialContent);
    const [report, setReport] = useState({
        title: initialTitle,
        content: initialContent,
    });
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>Report Title</Typography>
                <TextField
                    size='small'
                    fullWidth
                    value={report.title ?? ""}
                    onChange={(e) => setReport((prev) => ({ ...prev, title: e.target.value }))}
                />
            </Box>
            <Box>
                <Typography>Report Content</Typography>
                <JoditEditorNoSSR
                    value={initialContent ?? ""}
                    onChange={(value) => refContent.current = value}
                    config={{
                        readonly: false,
                        height: 200,
                        toolbarSticky: false,
                        buttons: [
                            'bold',
                            'italic',
                            'underline',
                            '|',
                            'ul',
                            'ol',
                            '|',
                            'undo',
                            'redo',
                        ],
                    }}
                />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                <Button variant="contained" color="primary" onClick={() => onSubmit?.({ ...report, content: refContent.current })}>Save</Button>
                <Button variant="contained" color="secondary" onClick={() => onClose?.(false)}>Cancel</Button>
            </Box>
        </Box>
    );
};

export default React.memo(ReportEditor);