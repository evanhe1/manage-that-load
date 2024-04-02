import React, { Fragment, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlayerContext from './context/PlayerContext'
import NavBar from './components/Nav/NavBar'
import PlayerPage from "./components/Nav/PlayerPage";
import HomePage from "./components/Home/HomePage";
import NotFound from "./components/Nav/NotFound";
import "./App.modules.css"

function App() {
    const [playerID, setPlayerID] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [playerGames, setPlayerGames] = useState([]);
    const [teamGP, setTeamGP] = useState(0);
    const [teamAbr, setTeamAbr] = useState("ZZZ");
    const [dateToGameIdx, setDateToGameIdx] = useState({});
    const [season, setSeason] = useState("2022-23");
    const [gamelogs, setGamelogs] = useState({})
    const [playedVisible, setPlayedVisible] = useState(true)
    const [missedVisible, setMissedVisible] = useState(true)
    const [playerObj, setPlayerObj] = useState([])

    return (
      <BrowserRouter>
          <PlayerContext.Provider value={{ playerName, setPlayerName, playerID, setPlayerID, displayName, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx, season, setSeason, gamelogs, setGamelogs, playedVisible, setPlayedVisible, missedVisible, setMissedVisible, playerObj, setPlayerObj }}>
              <NavBar/>
              <Routes>
                  {["/", "/home"].map(pathStr => <Route path={pathStr} key={pathStr} element={<HomePage/>} />)}
                  <Route path="/players/:id" element={<PlayerPage/>} />
                  <Route path="*" element={<NotFound/>} />
              </Routes>
          </PlayerContext.Provider>
      </BrowserRouter>
    )
}

export default App;
