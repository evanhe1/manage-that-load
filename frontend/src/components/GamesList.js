import React, { useState, useContext } from 'react'
import PlayerContext from '../context/PlayerContext'
import GamesFilter from './GamesFilter'
import 'bootstrap/dist/css/bootstrap.css';
import "./GamesList.modules.css"

function GamesList() {
    const { playerGames } = useContext(PlayerContext)
    const [playedVisible, setPlayedVisible] = useState(true)
    const [missedVisible, setMissedVisible] = useState(true)

    return (
        <div className="games-container">
            <GamesFilter playedVisible={playedVisible} setPlayedVisible={setPlayedVisible} missedVisible={missedVisible} setMissedVisible={setMissedVisible}></GamesFilter>
                {playerGames.map((game, r) => 
                <div className="row" key={game[0]}>
                    {(playedVisible && game[4] || missedVisible && !game[4]) && game.slice(1, 4).map(data =>
                    <div key={data} className=
                        {`col ${r % 2 === 0 && 'grey-cell'} ${game[4] ? 'played' : 'missed'}`}>{data}
                    </div>)}
                </div>)}
            </div>
    )
}

export default GamesList;