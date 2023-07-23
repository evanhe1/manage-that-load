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
        teamAbr: "",
        setTeamAbr: () => {},
        dateToGameIdx: {},
        setDateToGameIdx: () => { },
        season: "",
        setSeason: () => {},
        gamelogs: {},
        setGamelogs: () => {}
    })

export default PlayerContext;