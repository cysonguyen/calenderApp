"use client";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ReactQueryProvider = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;