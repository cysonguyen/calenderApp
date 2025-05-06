import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import React from 'react';

const JoditEditorNoSSR = dynamic(() => import('jodit-react'), { ssr: false });

const ReportEditor = ({ initialValue, onChange }) => {
    console.log('initialValue', initialValue);

    const handleChange = (newContent) => {
        onChange?.(newContent);
    };

    return (
        <Box>
            <JoditEditorNoSSR
                value={initialValue}
                onChange={handleChange}
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
    );
};

export default React.memo(ReportEditor);