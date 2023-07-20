import React, { useState } from 'react';
import PlayerGroup from './PlayerGroup';
import { players } from '../data'
import "./HomePage.modules.css"

const alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R',  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
function HomePage() {
    return (
        <div className="players-container">
            <div>Visualizing games missed by every NBA player. Search or select any player to get started!</div>
            {alphabet.map(letter => {
                const filteredPlayers = players.filter(player => player[1][0] === letter && player[4] === true)
                return filteredPlayers.length > 0 && <PlayerGroup key={letter} startingLetter={letter} filteredPlayers={filteredPlayers}></PlayerGroup>
            })}
        </div>
    )
}

export default HomePage;
