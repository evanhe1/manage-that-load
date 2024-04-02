import React, { useState, useContext } from 'react'
import PlayerContext from '../../context/PlayerContext'
import 'bootstrap/dist/css/bootstrap.css';
import "./GamesList.modules.css"

function GamesList(props) {
    const { playerGames, teamGP, playedVisible, missedVisible } = useContext(PlayerContext)

    return ( // idx === 3 refers to "miss_cause" column
        <div className="games-container">
                {[...playerGames].reverse().map(({'Game_ID':game_id, 'GAME_DATE':game_date, 'MATCHUP':matchup, 'WL':result, played, 'miss_cause':missCause, ...rest}, r) =>
                <div className="row" key={game_id}>
                    {(playedVisible && played || missedVisible && !played) && [game_date, matchup, result].map((data, idx) =>
                    <div key={data} className=
                        {`col ${r % 2 === 0 && 'grey-cell'} ${played ? 'played' : 'missed'}`}>{data}
                    </div>)}
                    {missedVisible && !played && missCause && <div className="miss-cause-desc">{missCause}</div>}
                </div>)}
            </div>
    ) // need additional !played filter because of inconsistency regarding if players play on the day that they are activated from IL
}

export default GamesList;