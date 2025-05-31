import {useState} from 'react'
import './Header.css'

function Header(){
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <header>
            <div className='header-container'>
                <a href='/' className='logo-link'> 
                    <img 
                        src='./public/images/logo.png'
                        alt='LOGO'
                        className='LOGO'
                    />
                    <span className='site-name'>Melty Puff</span>
                </a>
            </div>
            <nav className='nav-menu'>
                <a href="/">HOME</a>
            </nav>
        </header>
    )
}