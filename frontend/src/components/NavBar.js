import React from 'react';
import PlayerSearch from './PlayerSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import './NavBar.modules.css'

function NavBar() {
    return (
        <div className='nav-container'>
            <PlayerSearch></PlayerSearch>
            <Link to={`/`}>
                <FontAwesomeIcon icon={faHome} className={'home-button'}/>
            </Link>
        </div>
    )
}

export default NavBar;