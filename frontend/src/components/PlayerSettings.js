import React, { useContext } from 'react';
import GamesFilter from './GamesFilter';
import { seasons } from '../data'
import './PlayerSettings.modules.css';
import PlayerContext from "../context/PlayerContext";

function PlayerSettings(props) {
    const { playedVisible, setPlayedVisible, missedVisible, setMissedVisible } = props;
    const { season, setSeason } = useContext(PlayerContext)
    function handleChange(event) {
        setSeason(event.target.value)
    }

    return (
        <div className="settings-container">
            <GamesFilter playedVisible={playedVisible} setPlayedVisible={setPlayedVisible} missedVisible={missedVisible} setMissedVisible={setMissedVisible}></GamesFilter>
            <div>
                <label htmlFor="season">Season:</label>
                <select name="season" id="season" onChange={handleChange} defaultValue={seasons[seasons.length-1]}>
                    {seasons.map(season => <option value={season} key={season}>{season}</option>)}
                </select>
            </div>
        </div>)
}

export default PlayerSettings;