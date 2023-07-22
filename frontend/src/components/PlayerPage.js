import React, {Fragment, useContext, useState} from 'react'
import GamesList from './GamesList'
import PlayerInfo from './PlayerInfo'
import GamesCalendar from './GamesCalendar'
import ViewSelect from './ViewSelect'
import PlayerSettings from './PlayerSettings'
import './PlayerPage.modules.css'

import PlayerContext from "../context/PlayerContext";
import GamesFilter from "./GamesFilter";

const start = new Date(2022, 9, 16);
const end = new Date(2023, 3, 9);
function PlayerPage() {
    const [view, setView] = useState("list")
    const [playedVisible, setPlayedVisible] = useState(true)
    const [missedVisible, setMissedVisible] = useState(true)

    return (
        <Fragment>
            <PlayerInfo></PlayerInfo>
            <ViewSelect view={view} setView={setView}></ViewSelect>
            <PlayerSettings playedVisible={playedVisible} setPlayedVisible={setPlayedVisible} missedVisible={missedVisible} setMissedVisible={setMissedVisible}></PlayerSettings>
            {view == "calendar" && <GamesCalendar start={start} end={end}></GamesCalendar>}
            {view == "list" && <GamesList playedVisible={playedVisible} missedVisible={missedVisible}></GamesList>}
        </Fragment>
    )
}
export default PlayerPage;