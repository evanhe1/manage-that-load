import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import {players, teams } from '../../data';
import "./PlayerGroup.modules.css"

function PlayerGroup(props) {
    const { startingLetter, filteredPlayers } = props;
    return (
        <div className="player-group-container">
            <h2 className='group-header'>{startingLetter}</h2>
            {filteredPlayers.map(player =>
                <div className='info-container' key={player[0]}>
                    <div className='headshot-container'>
                        <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player[0]}.png`} className={'player-headshot'}></img>
                    </div>
                    <Link to={`/players/${player[0]}`}>
                        {player[2] + " " + player[1]}
                    </Link>
                </div>)}
        </div>)
}

export default PlayerGroup;