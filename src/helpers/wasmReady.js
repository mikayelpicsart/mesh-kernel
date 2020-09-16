import React, { createContext } from 'react';
import { initializeLibrary } from './pi';

export const WasmContext = createContext(null);

export function ReadyWasm({ children }) {
    useOnRuntimeInitializedReady();
    return (
        <WasmContext.Provider>
            {children}
        </WasmContext.Provider>
    );
}

const onRuntimeInitialized = { status: 'not-init', promise: null, module: null };

function useOnRuntimeInitializedReady() {
    if (onRuntimeInitialized.status === 'reject') {
        return;
    }
    if (onRuntimeInitialized.status === 'resolve') {
        return;
    }
    if (onRuntimeInitialized.status === 'pending') {
        throw onRuntimeInitialized.promise;
    }
    if (onRuntimeInitialized.status === 'not-init') {
        onRuntimeInitialized.status = 'pending';
        throw onRuntimeInitialized.promise = initializeLibrary().then(_ => {
            onRuntimeInitialized.status = 'resolve';
        }).catch(error => {
            console.error(error);
            onRuntimeInitialized.status = 'reject';
        })
    }
}