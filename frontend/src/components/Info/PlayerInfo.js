import React, { useContext } from 'react'
import PlayerContext from '../../context/PlayerContext'
import 'bootstrap/dist/css/bootstrap.css';
import "./PlayerInfo.modules.css"
import { teamToColor}  from "../../data"

function PlayerInfo() {
    const { displayName, playerID, playerGames, teamGP, teamAbr, season } = useContext(PlayerContext)
    const totalGames = playerGames.length
    const gamesPlayed = playerGames.filter(game => game['played'] === true).length
    const gamesMissed = totalGames - gamesPlayed;
    const gamesLeft = 82 - teamGP
    const gamesPlayedPace = gamesPlayed + Math.round((teamAbr.length > 0 ? gamesPlayed : 0) / totalGames * gamesLeft);
    let statusString = "";
    if (season === '2023-24') {
        if (gamesPlayed >= 65) {
            statusString = `${displayName} is eligible for postseason awards.`;
        } else if (gamesPlayed + gamesLeft >= 65) {
            statusString = `At this pace, ${displayName} will ${gamesPlayedPace >= 65 ? "" : "not"} be eligible for postseason awards in ${season}.`;
        } else {
            statusString = `${displayName} has missed too many games to be eligible for postseason awards in ${season}.`
        }
    } else {
        statusString = `${displayName} would ${gamesPlayed >= 65 ? "" : "not"} have been eligible for postseason awards under the current system in ${season}.`;
    }

    return (
        <div className="info card mb-3" style={{ backgroundColor: teamAbr.length > 0 ? teamToColor[teamAbr] : teamToColor['ZZZ'] }}>
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerID}.png`}></img>
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h5 className="card-title">{displayName}</h5>
                        <div>{`Games played: ${gamesPlayed}`}</div>
                        <div>{`Games missed: ${gamesMissed}`}</div>
                        {season === '2023-24' && <div>{`Games played pace: ${gamesPlayedPace}`}</div>}
                        <div>{statusString}</div>
                        <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerInfo;