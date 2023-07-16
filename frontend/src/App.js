import React, { Fragment, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlayerContext from './context/PlayerContext'
import PlayerSearch from './components/PlayerSearch'
import PlayerPage from "./components/PlayerPage";
import "./App.modules.css"

function App() {
  const [playerID, setPlayerID] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [playerGames, setPlayerGames] = useState([]);
  const [teamGP, setTeamGP] = useState(0);
  const [teamAbr, setTeamAbr] = useState("");
  const [dateToGameIdx, setDateToGameIdx] = useState({});
  return (
      <PlayerContext.Provider value={{ playerName, setPlayerName, playerID, setPlayerID, displayName, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx }}>
          <PlayerSearch></PlayerSearch>
          {displayName && <PlayerPage/>}
      </PlayerContext.Provider>
  )
}

export default App;
