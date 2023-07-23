import React, { useState, useRef } from 'react';
import Day from './Day';
import "./Week.modules.css"

function Week(props) {
    const {start} = props;
    const days = getDays(start)

    function getDays(start) {
        const days = [];
        for (let i = 0; i < 7; i++)
        {
            let date = new Date(start);
            console.log(date)
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    }

    function formatDate(dateStr) {
        return dateStr.slice(4,7).toUpperCase() + " " + dateStr.slice(8, 10) + ", " + dateStr.slice(11,15);
    }

    return <>
        <div className="week">
            {days.map(date => <Day date={formatDate(date.toString())} key={formatDate(date.toString())}></Day>)}
            {days.map(date => date.getDate()).includes(1) && <div className="month-label">{days[6].toLocaleString('default', {month: 'long', year: 'numeric'})}</div>}
        </div>
    </>
}

export default Week;