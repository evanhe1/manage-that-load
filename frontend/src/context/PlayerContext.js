import React, { createContext } from 'react';

const PlayerContext = createContext(
    {
        playerName: "",
        setPlayerName: () => { },
        playerID: "",
        setPlayerID: () => { },
        displayName: "",
        setDisplayName: () => { },
        playerGames: [],
        setPlayerGames: () => { },
        teamGP: 0,
        setTeamGP: () => { },
        dateToGameIdx: {},
        setDateToGameIdx: () => { },
        season: "",
        setSeason: () => {}
    })

export default PlayerContext;