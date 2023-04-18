import React, { useRef, useContext } from 'react';
import PlayerContext from '../context/PlayerContext';
import './Day.modules.css';

function Day(props) {
    const { playerGames, dateToGameIdx } = useContext(PlayerContext);
    const { date } = props;

    function getDayNum(fullDate) {
        date = new Date(fullDate);
        return date.getDate();
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
        </div>)

}

export default Day;