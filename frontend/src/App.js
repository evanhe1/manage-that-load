import React, { Fragment, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlayerContext from './context/PlayerContext'
import NavBar from './components/NavBar'
import PlayerPage from "./components/PlayerPage";
import HomePage from "./components/HomePage";
import NotFound from "./components/NotFound";
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
      <BrowserRouter>
          <PlayerContext.Provider value={{ playerName, setPlayerName, playerID, setPlayerID, displayName, setDisplayName, playerGames, setPlayerGames, teamGP, setTeamGP, teamAbr, setTeamAbr, dateToGameIdx, setDateToGameIdx }}>
              <NavBar/>
              <Routes>
                  {["/", "/home"].map(pathStr => <Route path={pathStr} element={<HomePage/>} />)}
                  <Route path="/players/:id" element={<PlayerPage/>} />
                  <Route path="*" element={<NotFound/>} />
              </Routes>
          </PlayerContext.Provider>
      </BrowserRouter>
  )
}

export default App;
