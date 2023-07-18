import React, { useState } from 'react';
import PlayerGroup from './PlayerGroup';
import "./HomePage.modules.css"

const alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R',  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
function HomePage() {
    return (
        <div className="players-container">
            <div>Visualizing games missed by every NBA player.</div>
            <br/>
            {alphabet.map(letter => <PlayerGroup key={letter} startingLetter={letter}></PlayerGroup>)}
        </div>
    )
}

export default HomePage;
