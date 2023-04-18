import React from 'react';
import Calendar from 'react-calendar';
import Week from './Week'
import 'react-calendar/dist/Calendar.css';

function GamesCalendar(props) {
    const { start, end } = props;
    const weeks = getWeekStarts(start, end);

    function getWeekStarts(start, end) {

        const n = (end - start) / 86400000;
        const weeks = [];
        for (let i = 0; i <= n; i+=7)
        {
            let date = new Date(start);
            date.setDate(date.getDate() + i);
            weeks.push(date);
        }
        return weeks;
    }

    return <div className="games-calendar">
        {weeks.map(start => <Week start={start.toString()} key={start.toString()}></Week>)}
    </div>
}

export default GamesCalendar;