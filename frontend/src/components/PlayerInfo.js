import React, { useContext } from 'react' 
import PlayerContext from '../context/PlayerContext'
import "./PlayerInfo.modules.css"

function PlayerInfo() {
    const { displayName, playerGames } = useContext(PlayerContext)

    return (
        <h1 className="info">
            {`Games played: ${playerGames.filter(game => game[4] === true).length}`}<br/>
            {`Games missed: ${playerGames.filter(game => game[4] === false).length}`}<br/>
            {`Games played pace: ${playerGames.filter(game => game[4] === true).length}`}
        </h1>
    )
}

export default PlayerInfo;