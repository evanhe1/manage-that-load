import axios from 'axios';
import React, { useState, useRef, useEffect, useContext } from 'react';
import PlayerContext from "../../context/PlayerContext"
import 'bootstrap/dist/css/bootstrap.css';
import './PlayerSearch.modules.css'
import { useNavigate, useLocation } from "react-router-dom";
import { players, teams, teamToColor, curSeason } from '../../data'

function PlayerSearch() {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const isMountedRef = useRef(0)
    const inputRef = useRef(null)
    const { playerName, setPlayerName, playerID, setPlayerID, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx, gamelogs, setGamelogs, season, setSeason } = useContext(PlayerContext);
    const navigate = useNavigate();
    const loc = useLocation();

    const handleSubmit = function (e) {
        e.preventDefault();
        if (playerName.length > 0 && searchResults.length > 0) {
            const player = searchResults[0];
            setPlayerName(player[3]);
            setDropdownVisible(false)
            // if (players.length === 1) {
            //     setPlayerID(player[0]);
            // }
            setPlayerID(player[0])
            return navigate(`/players/${player[0]}`)
        }
    }

    const handleChange = function (e) {
        setPlayerName(e.target.value)
        setDropdownVisible(e.target.value !== "")
    }

    const handleClick = function (player) {
        setDropdownVisible(false);
        setPlayerName(player[3]);
        setTimeout(() => {
            inputRef.current.focus();
            setDropdownVisible(false);
        }, 0)
    }

    useEffect(() => {
        const curResults = players.filter(player => player[3].toLowerCase().match(new RegExp(playerName.toLowerCase(), "g")) && player[4] === true)
        setSearchResults(curResults);
    }, [playerName])

    useEffect(() => {
        if (isMountedRef.current < 1) {
            isMountedRef.current++
        }
        else {
            setDisplayName(null);
            const endpoints = [`http://127.0.0.1:8001/games?id=${playerID}`, `http://127.0.0.1:8001/gp?id=${playerID}`, `https://mtl-backend-3wnzf7w4ia-uc.a.run.app/games?id=${playerID}`, `https://mtl-backend-3wnzf7w4ia-uc.a.run.app/gp?id=${playerID}`]
            axios.get(endpoints[2], {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                // console.log(res)
                const curGamelogs = {};
                for (const label in res.data) {
                    if (label !== 'player_id' && label !== '_id') {
                        curGamelogs[label] = res.data[label];
                    }

                }
                let season = curSeason;
                while (!(season in res.data)) {
                    const [startYear, ...rest] = season.split('-').map(Number);
                    const previousStartYear = startYear - 1;
                    const previousEndYear = startYear.toString().slice(-2);
                    season =  `${previousStartYear}-${previousEndYear}`;
                }
                const games = res.data[season]["gamelog"]
                const gp = res.data[season]["gp"]
                const abr = res.data[season]["abr"]
                const gamesArr = Object.values(games).map(game => Object.values(game));
                setPlayerGames(gamesArr);
                setTeamGP(gp)
                setGamelogs(curGamelogs)
                setSeason(season)
                const curResults = players.filter(player => player[0] === playerID && player[4] === true)
                //console.log(curResults)
                if (curResults) {
                    setDisplayName(curResults[0][3])
                }
                setTeamAbr(abr)
                setDateToGameIdx(Object.fromEntries(gamesArr.map((game, idx) => [game['GAME_DATE'], idx])))
            }).catch(console.error)
        }
    }, [playerID])

    useEffect(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant"
        });
        const pathnameArr = loc.pathname.split('/');
        if (pathnameArr.length === 3 && pathnameArr[1] === "players") {
            setPlayerID(parseInt(pathnameArr[2]))
        }
    }, [loc])

    return (
        <div className="container search-container">
            <form className="input-group search-input" onSubmit={handleSubmit}>
                <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={playerName}
                    onChange={handleChange}
                    ref={inputRef}
                    onFocus={() => setDropdownVisible(playerName !== "")}
                    onBlur={() => setDropdownVisible(false)}
                />
                <button className="input-group-text">Search</button>
            </form>
            <ul className="list-group dropdown-container">
                {dropdownVisible && searchResults.map(player => <button key={player[0]} className="list-group-item" onMouseDown={() => handleClick(player)}>{player[3]}</button>)}
            </ul>
        </div>)
}

export default PlayerSearch;