import React, { useRef, useContext } from 'react';
import PlayerContext from '../../context/PlayerContext';
import './Day.modules.css';

function Day(props) {
    const { playerGames, dateToGameIdx } = useContext(PlayerContext);
    const { date } = props;

    function getDayNum(fullDate) {
        const curDate = new Date(fullDate);
        return curDate.getDate();
    }

    function getStyle(date) {
        if (date in dateToGameIdx)
        {
            const idx = dateToGameIdx[date];
            if (playerGames[idx][4])
                return 'played';
            else
                return 'missed';
        }
        else
            return '';
    }
    
    return (<div className={`day ${getStyle(date)}`}>{(() => {
            const dateObj = new Date(date);
            return dateObj.getDate();
        })()}
        <div className="game-info">
            {playerGames[dateToGameIdx[date]] && playerGames[dateToGameIdx[date]][3] + " " + playerGames[dateToGameIdx[date]][2].slice(4)}
        </div>
        <div className="game-info">
            {playerGames[dateToGameIdx[date]] && playerGames[dateToGameIdx[date]][5]}
        </div>
    </div>)
}

export default Day;