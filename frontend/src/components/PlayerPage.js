import React, {Fragment, useContext, useState} from 'react'
import GamesList from './GamesList'
import PlayerInfo from './PlayerInfo'
import GamesCalendar from './GamesCalendar'
import ViewSelect from './ViewSelect'

import PlayerContext from "../context/PlayerContext";

const start = new Date(2022, 9, 16);
const end = new Date(2023, 3, 9);
function PlayerPage() {
    const [view, setView] = useState("list")
    return (
        <Fragment>
            <PlayerInfo></PlayerInfo>
            <ViewSelect view={view} setView={setView}></ViewSelect>
            {view == "calendar" && <GamesCalendar start={start} end={end}></GamesCalendar>}
            {view == "list" && <GamesList></GamesList>}
        </Fragment>
    )
}
export default PlayerPage;