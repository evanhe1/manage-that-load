import React, { useState, useContext } from 'react'
import PlayerContext from '../context/PlayerContext'
import GamesFilter from './GamesFilter'
import 'bootstrap/dist/css/bootstrap.css';
import "./GamesList.modules.css"

function GamesList() {
    const { playerGames, teamGP } = useContext(PlayerContext)
    const [playedVisible, setPlayedVisible] = useState(true)
    const [missedVisible, setMissedVisible] = useState(true)
    console.log(playerGames)

    return ( // idx === 3 refers to "miss_cause" column
        <div className="games-container">
            <GamesFilter playedVisible={playedVisible} setPlayedVisible={setPlayedVisible} missedVisible={missedVisible} setMissedVisible={setMissedVisible}></GamesFilter>
                {playerGames.map(([game_id, game_date, matchup, result, played, miss_cause, ...rest], r) =>
                <div className="row" key={game_id}>
                    {(playedVisible && played || missedVisible && !played) && [game_date, matchup, result].map((data, idx) =>
                    <div key={data} className=
                        {`col ${r % 2 === 0 && 'grey-cell'} ${played ? 'played' : 'missed'}`}>{data}
                    </div>)}
                    {!played && miss_cause && <div className="miss-cause-desc">{miss_cause}</div>}
                </div>)}
            </div>
    ) // need additional !played filter because of inconsistency regarding if players play on the day that they are activated from IL
}

export default GamesList;