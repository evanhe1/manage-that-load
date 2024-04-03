import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GamesFilter from './GamesFilter';
import {players, curSeason} from '../../data'
import './PlayerSettings.modules.css';
import PlayerContext from "../../context/PlayerContext";

function PlayerSettings() {
    const { playerID, playerGames, setPlayerGames, setTeamGP, setTeamAbr, season, setSeason, dateToGameIdx, setDateToGameIdx, gamelogs, setGamelogs, playedVisible, setPlayedVisible, missedVisible, setMissedVisible } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isMountedRef = useRef(0)
    // console.log(searchParams.get("season"))

    function updateDisplay(season) {
        setSeason(season)

        if (Object.keys(gamelogs).length > 0) {
            const curPlayerGames = Object.values(gamelogs[season]["gamelog"])
            setPlayerGames(curPlayerGames)
            setTeamGP(gamelogs[season]["gp"])
            setTeamAbr(gamelogs[season]["abr"])
            setDateToGameIdx(Object.fromEntries(curPlayerGames.map((game, idx) => [game['GAME_DATE'], idx])))
        }
    }
    function handleChange(event) {
        updateDisplay(event.target.value)
        return navigate(`/players/${playerID}?season=${event.target.value}`)
    }

    useEffect(() => {
        const seasonParam = searchParams.get("season")
        if (seasonParam) {
            updateDisplay(seasonParam)
        } else {
            let season = curSeason;
            if (Object.keys(gamelogs).length > 0) {
                while (season in gamelogs === false) {
                    const [startYear, ...rest] = season.split('-').map(Number);
                    const previousStartYear = startYear - 1;
                    const previousEndYear = startYear.toString().slice(-2);
                    season = `${previousStartYear}-${previousEndYear}`;
                }
                updateDisplay(season)
            }
        }
    }, [gamelogs])
    // gamelogs are reloaded on every refresh/input change,
    // giving the intended behavior of persisting current season in params

    return (
        <div className="settings-container">
            <GamesFilter playedVisible={playedVisible} setPlayedVisible={setPlayedVisible} missedVisible={missedVisible} setMissedVisible={setMissedVisible}></GamesFilter>
            <div>
                <label htmlFor="season">Season:</label>
                <select name="season" id="season" onChange={handleChange} value={season}>
                    {Object.keys(gamelogs).map(season => <option value={season} key={season}>{season}</option>)}
                </select>
            </div>
        </div>)
}

export default PlayerSettings;