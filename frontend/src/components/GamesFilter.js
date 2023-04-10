import React, { useState } from 'react'
import PlayerContext from '../context/PlayerContext'
import 'bootstrap/dist/css/bootstrap.css';
import './GamesFilter.modules.css'

function GamesFilter(props) {
    const {playedVisible, setPlayedVisible, missedVisible, setMissedVisible} = props
    
    return (
        <div className="container games-filter">
            <div className="form-check">
                <input type="checkbox" className="form-check-input" id="check1" name="games-played" value="played" checked={playedVisible} onChange={() => setPlayedVisible(visible => !visible)}/>
                <label className="form-check-label" htmlFor="check1">Games Played</label>
            </div>
            <div className="form-check">
                <input type="checkbox" className="form-check-input" id="check2" name="games-missed" value="missed" checked={missedVisible} onChange={() => setMissedVisible(visible => !visible)} />
                <label className="form-check-label" htmlFor="check2">Games Missed</label>
            </div>
        </div>
    )
}

export default GamesFilter