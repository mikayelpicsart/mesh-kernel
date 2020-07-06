import React, { createContext } from 'react';
import { initializeLibrary } from './pi';

export const WasmContext = createContext(null);

export function ReadyWasm({ children }) {
    const wasm = useOnRuntimeInitializedReady();
    return (
        <WasmContext.Provider value={wasm}>
            {children}
        </WasmContext.Provider>
    );
}

const onRuntimeInitialized = { status: 'not-init', promise: null, module: null };

function useOnRuntimeInitializedReady() {
    if (onRuntimeInitialized.status === 'reject') {
        return onRuntimeInitialized.module;
    }
    if (onRuntimeInitialized.status === 'resolve') {
        return onRuntimeInitialized.module;
    }
    if (onRuntimeInitialized.status === 'pending') {
        throw onRuntimeInitialized.promise;
    }
    if (onRuntimeInitialized.status === 'not-init') {
        onRuntimeInitialized.status = 'pending';
        throw onRuntimeInitialized.promise = initializeLibrary().then(wasm => {
            console.log(wasm);
            onRuntimeInitialized.module = wasm;
            onRuntimeInitialized.status = 'resolve';
        }).catch(error => {
            console.error(error);
            onRuntimeInitialized.status = 'reject';
        })
    }
}

export function getWasm() { return onRuntimeInitialized.module; };