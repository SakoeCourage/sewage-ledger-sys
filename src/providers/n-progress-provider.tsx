"use client";

import { ProgressProvider } from "@bprogress/next/app";

const Nprogressprovider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProgressProvider
            height="5px"
            color="#f5740aff"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
        </ProgressProvider>
    );
};

export default Nprogressprovider;
