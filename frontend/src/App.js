import React, { Fragment, useState } from 'react'
import PlayerContext from './context/PlayerContext'
import PlayerSearch from './components/PlayerSearch'
import GamesList from './components/GamesList'
import PlayerInfo from './components/PlayerInfo'


function App() {
    const [playerID, setPlayerID] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [playerGames, setPlayerGames] = useState([]);
    return (
        <Fragment>
            <PlayerContext.Provider value={{playerName, setPlayerName, playerID, setPlayerID, displayName, setDisplayName, playerGames, setPlayerGames}}>
              <PlayerSearch></PlayerSearch>
              {displayName && <PlayerInfo></PlayerInfo>}
              {playerGames.length !== 0 && <GamesList></GamesList>}
            </PlayerContext.Provider>
        </Fragment>    
    )
}

export default App;
