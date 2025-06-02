import { useState, useEffect } from 'react'
import './Header.css'

function Header() {
    const [cartCount, setCartCount] = useState(0)
    const [isScrolled, setIsScrolled] = useState(false)

    // スクロール時のヘッダー背景変更
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset
            setIsScrolled(scrollTop > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // ページ遷移関数
    const navigateTo = (path) => {
        window.location.href = path
    }

    return (
        <header className={isScrolled ? 'scrolled' : ''}>
            <div className="header-container">
                <div className="logo">
                    <a href="/" className="logo-link">
                        <img 
                            src="/images/logo.png" 
                            alt="Melty Puff logo" 
                            className="logo-img"
                        />
                        <span className="site-name">Melty Puff</span>
                    </a>
                </div>
                <nav className="nav-menu">
                    <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/') }}>
                        HOME
                    </a>
                    <div className="nav-item dropdown">
                        <a 
                            href="/shop-non" 
                            className="dropdown-toggle"
                            onClick={(e) => { e.preventDefault(); navigateTo('/shop-non') }}
                        >
                            SHOP
                        </a>
                        {/* CSSのhoverで制御されるドロップダウンメニュー */}
                        <div className="dropdown-menu">
                            <a 
                                href="/shop-non"
                                onClick={(e) => { e.preventDefault(); navigateTo('/shop-non') }}
                            >
                                ノンニコチン
                            </a>
                            <a 
                                href="/shop-nic"
                                onClick={(e) => { e.preventDefault(); navigateTo('/shop-nic') }}
                            >
                                ニコチンベイプ
                            </a>
                        </div>
                    </div>
                    <a 
                        href="/contact"
                        onClick={(e) => { e.preventDefault(); navigateTo('/contact') }}
                    >
                        SUPPORT
                    </a>
                    <a 
                        href="/articles"
                        onClick={(e) => { e.preventDefault(); navigateTo('/articles') }}
                    >
                        ARTICLES
                    </a>
                    <a 
                        href="/account" 
                        className="account-link" 
                        id="account-link"
                        onClick={(e) => { e.preventDefault(); navigateTo('/account') }}
                    >
                        ACCOUNT
                    </a>
                    <a 
                        href="/cart" 
                        className="cart-button"
                        onClick={(e) => { e.preventDefault(); navigateTo('/cart') }}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="1.5" 
                            stroke="currentColor" 
                            className="cart-icon"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>   
                        <span className="cart-count">{cartCount}</span>                   
                    </a>
                </nav>
            </div>
        </header>
    )
}

export default Header