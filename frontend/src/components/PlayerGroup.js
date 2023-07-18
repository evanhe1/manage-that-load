import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import {players, teams } from '../data';
import "./PlayerGroup.modules.css"

function PlayerGroup(props) {
    const { startingLetter } = props;
    return (
        <div className="player-group-container">
            {startingLetter}
            {players.filter(player => player[1][0] === startingLetter && player[4] === true).map(player =>
                <Link to={`/players/${player[0]}`}>
                    {player[1] + ', ' + player[2]}
                </Link>)}
                <br/>
        </div>)
}

export default PlayerGroup;