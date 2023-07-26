import React, { createContext } from 'react';

const ViewContext = createContext(
    {
        view: "list",
        setView: () => {},
        playedVisible: true,
        setPlayedVisible: () => {},
        missedVisible: true,
        setMissedVisible: () => {}
    })

export default ViewContext;