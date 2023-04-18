import React, { Fragment, useState } from 'react'
import PlayerContext from './context/PlayerContext'
import PlayerSearch from './components/PlayerSearch'
import GamesList from './components/GamesList'
import PlayerInfo from './components/PlayerInfo'
import GamesCalendar from './components/GamesCalendar'
import ViewSelect from './components/ViewSelect'
import "./App.modules.css"

const start = new Date(2022, 9, 16);
const end = new Date(2023, 3, 9);

function App() {
  const [playerID, setPlayerID] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [playerGames, setPlayerGames] = useState([]);
  const [teamGP, setTeamGP] = useState(0);
  const [teamAbr, setTeamAbr] = useState("");
  const [dateToGameIdx, setDateToGameIdx] = useState({});
  const [view, setView] = useState("list")
  return (
    <Fragment>
      <PlayerContext.Provider value={{ playerName, setPlayerName, playerID, setPlayerID, displayName, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx }}>
        <PlayerSearch></PlayerSearch>
        {displayName &&
          <Fragment>
            <PlayerInfo></PlayerInfo>
            <ViewSelect view={view} setView={setView}></ViewSelect>
            {view == "calendar" && <GamesCalendar start={start} end={end}></GamesCalendar>}
            {view == "list" && <GamesList></GamesList>}
          </Fragment>
        }
      </PlayerContext.Provider>
    </Fragment>
  )
}

export default App;
