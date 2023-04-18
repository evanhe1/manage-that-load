import React, { createContext } from 'react';

const ViewContext = createContext(
    {
        view: "list",
        setView: () => { }
    })

export default ViewContext;