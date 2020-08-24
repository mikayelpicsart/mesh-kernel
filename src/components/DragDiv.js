import React, { useRef } from 'react';

export default function DragDiv() {
    const refDiv = useRef(null);
    

    return <div ref={refDiv} />
}