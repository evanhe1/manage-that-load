import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './ViewSelect.modules.css'

function ViewSelect(props) {
    const { view, setView } = props;

    function handleClickList() {
        setView('list');
    }

    function handleClickCalendar() {
        setView('calendar');
    }

    return (
        <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={view === "list"} onChange={handleClickList} />
            <label className="btn btn-outline-primary" htmlFor="btnradio1">List View</label>

            <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={view === "calendar"} onChange={handleClickCalendar} />
            <label className="btn btn-outline-primary" htmlFor="btnradio2">Calendar View</label>
        </div>
    )
}

export default ViewSelect;