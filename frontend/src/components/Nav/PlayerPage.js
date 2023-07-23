import React, {Fragment, useContext, useEffect, useState} from 'react'
import { useSearchParams } from "react-router-dom";
import GamesList from '../List/GamesList'
import PlayerInfo from '../Info/PlayerInfo'
import GamesCalendar from '../Calendar/GamesCalendar'
import ViewSelect from '../Settings/ViewSelect'
import PlayerSettings from '../Settings/PlayerSettings'
import {curSeason, seasonDates} from '../../data'
import './PlayerPage.modules.css'

import PlayerContext from "../../context/PlayerContext";
import GamesFilter from "../Settings/GamesFilter";


function PlayerPage() {
    const { season, gamelogs } = useContext(PlayerContext)
    const [view, setView] = useState("list")
    const [playedVisible, setPlayedVisible] = useState(true)
    const [missedVisible, setMissedVisible] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams();

    function getSundayBound(dateStr, boundDirection) {
        let date = new Date(dateStr)
        console.log(date)
        const dayOfWeek = date.getDay();
        date.setDate(date.getDate() - dayOfWeek + (boundDirection === "next" ? 7 : 0));
        console.log(date)
        return date
    }

    const [start, setStart] = useState(getSundayBound(seasonDates[season]["start"], "prev"));
    const [end, setEnd] = useState(getSundayBound(seasonDates[season]["end"], "next"));

    useEffect(() => {
        const seasonParam = searchParams.get("season")
        if (seasonParam) {
            setStart(getSundayBound(seasonDates[seasonParam]["start"], "prev"))
            setEnd(getSundayBound(seasonDates[seasonParam]["end"], "next"))
        } else {
            setStart(getSundayBound(seasonDates[curSeason]["start"], "prev"))
            setEnd(getSundayBound(seasonDates[curSeason]["end"], "next"))
        }
    }, [gamelogs, season])
    // gamelogs are reloaded on every refresh/input change,
    // giving the intended behavior of persisting current season in params

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