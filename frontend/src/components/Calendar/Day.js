import React, { useRef, useContext } from 'react';
import PlayerContext from '../../context/PlayerContext';
import './Day.modules.css';

function Day(props) {
    const { playerGames, dateToGameIdx, playedVisible, missedVisible} = useContext(PlayerContext);
    const { date } = props;

    const curGame = playerGames[dateToGameIdx[date]]
    const played = curGame && curGame['played']
    const missCause = curGame && curGame['miss_cause']

    function getDayNum(fullDate) {
        const curDate = new Date(fullDate);
        return curDate.getDate();
    }

    function getStyle(date) {
        if (date in dateToGameIdx)
        {
            const idx = dateToGameIdx[date];
            if (playerGames[idx]['played'])
                return 'played';
            else
                return 'missed';
        }
        else
            return '';
    }
    
    
    return (<div className={`day ${(playedVisible && played || missedVisible && !played) && getStyle(date)}`}>{(() => {
            const dateObj = new Date(date);
            return dateObj.getDate();
        })()}
        {(playedVisible && played || missedVisible && !played) &&
        <div>
            <div className="game-info">
                {curGame && curGame['WL'] + " " + curGame['MATCHUP'].slice(4)}
            </div>
            {missedVisible && !played && missCause && <div className="game-info">
                {playerGames[dateToGameIdx[date]] && playerGames[dateToGameIdx[date]]['miss_cause']}
            </div>}
        </div>}
    </div>)
}

export default Day;