import axios from 'axios';
import React, { useState, useEffect, useContext} from 'react';
import PlayerContext from "../context/PlayerContext"
import 'bootstrap/dist/css/bootstrap.css';
import './PlayerSearch.modules.css'

function PlayerSearch() {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [players, setPlayers] = useState([]);
    const {playerName, setPlayerName, playerID, setPlayerID, setDisplayName, playerGames, setPlayerGames} = useContext(PlayerContext);

    const handleSubmit = function(e) {
        e.preventDefault();
        if (players.length > 0)
        {
            const player = players[0]
            setPlayerID(player[0]); 
            setPlayerName(player[1]);
            setDisplayName(player[1]);
            setDropdownVisible(false)
        }
    }

    const handleChange = function(e) {
        setPlayerName(e.target.value)
        setDropdownVisible(e.target.value !== "")
    }

    const handleClick = function(player) {
        setDropdownVisible(false); 
        console.log(player[1])
        setPlayerName(player[1]);
    }

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/players?name=${playerName}`, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
                setPlayers(res.data)
            }).catch(console.error)
    }, [playerName]) 

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/search?id=${playerID}`, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
                setPlayerGames(Object.values(res.data).map(game => Object.values(game)))
            }).catch(console.error)
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
                    required
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