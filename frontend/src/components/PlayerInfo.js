import React, { useContext } from 'react' 
import PlayerContext from '../context/PlayerContext'
import 'bootstrap/dist/css/bootstrap.css';
import "./PlayerInfo.modules.css"

const teamToColor = {
    ATL: "#e03a3e",
    BKN: "#000",
    BOS: "#008348",
    CHA: "#00788c",
    CHI: "#ce1141",
    CLE: "#6f263d",
    DAL: "#0053bc",
    DEN: "#0e2240",
    DET: "#1d428a",
    GSW: "#006bb6",
    HOU: "#ce1141",
    IND: "#002d62",
    LAC: "#c8102e",
    LAL: "#552583",
    MEM: "#5d76a9",
    MIA: "#98002e",
    MIL: "#00471b",
    MIN: "#0c2340",
    NOP: "#002b5c",
    NYK: "#006bb6",
    OKC: "#007ac1",
    ORL: "#0077c0",
    PHI: "#006bb6",
    PHX: "#1d1160",
    POR: "#e03a3e",
    SAC: "#5a2d81",
    SAS: "#000",
    TOR: "#000",
    UTA: "#002b5c",
    WAS: "#002b5c",
    ZZZ: "#1a1a1a",
}

function PlayerInfo() {
    const { displayName, playerID, playerGames, teamGP, teamAbr } = useContext(PlayerContext)
    const totalGames = playerGames.length
    const gamesPlayed = playerGames.filter(game => game[4] === true).length
    const gamesMissed = totalGames - gamesPlayed;
    const gamesPlayedPace = gamesPlayed + (teamAbr.length > 0 ? gamesPlayed : 0) / totalGames * (82 - teamGP);
    console.log(teamAbr)
    console.log(teamGP);

    return (
        <div className="info card mb-3" style={{backgroundColor: teamAbr.length > 0 ? teamToColor[teamAbr] : teamToColor['ZZZ']}}>
            <div className="row g-0">
                <div className="col-md-4">
                <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${playerID}.png`}></img>
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h5 className="card-title">{displayName}</h5>
                        <div>{`Games played: ${gamesPlayed}`}</div>
                        <div>{`Games missed: ${gamesMissed}`}</div>
                        <div>{`Games played pace: ${gamesPlayedPace}`}</div>
                        <div>{`At this pace, ${displayName} will ${gamesPlayedPace >= 65 ? "" : "not"} be elligible for postseason awards.`}</div>
                        <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerInfo;