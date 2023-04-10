import React, { createContext } from 'react';

const PlayerContext = createContext(
    {
        playerName: "", 
        setPlayerName: () => {},
        playerID: "",
        setPlayerID: () => {},
        displayName: "",
        setDisplayName: () => {},
        playerGames: [],
        setPlayerGames: () => {}
    })

export default PlayerContext;