import axios from 'axios';
import React, { useState, useRef, useEffect, useContext } from 'react';
import PlayerContext from "../context/PlayerContext"
import 'bootstrap/dist/css/bootstrap.css';
import './PlayerSearch.modules.css'

function PlayerSearch() {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [players, setPlayers] = useState([]);
    const isMountedRef = useRef(0)
    const {playerName, setPlayerName, playerID, setPlayerID, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx} = useContext(PlayerContext);

    const handleSubmit = function(e) {
        e.preventDefault();
        if (players.length > 0)
        {
            const player = players[0]
            setPlayerID(player[0]); 
            setPlayerName(player[1]);
            setDropdownVisible(false)
        }
    }

    const handleChange = function(e) {
        setPlayerName(e.target.value)
        setDropdownVisible(e.target.value !== "")
    }

    const handleClick = function(player) {
        setDropdownVisible(false); 
        setPlayerName(player[1]);
    }

    useEffect(() => {
        if (isMountedRef.current < 4) {
            isMountedRef.current++;
        }
        else {
        axios.get(`http://127.0.0.1:5000/search?name=${playerName}`, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
                setPlayers(res.data)
            }).catch(console.error)
        }
    }, [playerName]) 

    useEffect(() => {
        if (isMountedRef.current < 4) {
            isMountedRef.current++
        }
        else {
            setDisplayName(null);
            const endpoints = [`http://127.0.0.1:5000/games?id=${playerID}`, `http://127.0.0.1:5000/gp?id=${playerID}`]
            axios.get(`http://127.0.0.1:5000/games?id=${playerID}`, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                    const games = res.data["gamelog"]
                    const gp = res.data["gp"][0]
                    const abr = res.data["abr"][0]
                    const gamesArr = Object.values(games).map(game => Object.values(game));
                    setPlayerGames(gamesArr);
                    setTeamGP(gp)
                    setDisplayName(playerName)
                    setTeamAbr(abr)
                    setDateToGameIdx(Object.fromEntries(gamesArr.map((game, idx) => [game[1], idx])))
                }).catch(console.error)
        }
    }, [playerID]) 

    return (
        <div className="container player-search">
            <form className="input-group" onSubmit={handleSubmit}>
                <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={playerName}
                    onChange={handleChange}
                    onFocus={() => setDropdownVisible(playerName !== "")}
                    onBlur={() => setDropdownVisible(false)}
                />
                <button className="input-group-text">Search</button>
            </form>
            <ul className="list-group dropdown-container">
                {dropdownVisible && players.map(player => <button key={player[0]} className="list-group-item" onMouseDown={() => handleClick(player)}>{player[1]}</button>)}
            </ul>
        </div>)
}

export default PlayerSearch;