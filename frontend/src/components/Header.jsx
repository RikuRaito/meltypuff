import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css'

function Header({ navigateTo, isLoggedIn, user, cartCount, onLogout, currentPage }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [localCartCount, setLocalCartCount] = useState(0)
    const location = useLocation();
    const isRoot = currentPage === '/';

    // スクロール時のヘッダー背景変更
    useEffect(() => {
    if(isRoot){
        const handleScroll = () => {
            const hero = document.querySelector('.hero-section')
            if (!hero) return
            const heroBottom = hero.getBoundingClientRect().bottom
            setIsScrolled(heroBottom <= 0)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    } else {
        setIsScrolled(false)
    }
    }, [isRoot])

    // ページ遷移関数
    const handleNavigate = (path) => {
        if (navigateTo) {
            navigateTo(path)
        } else {
            window.location.href = path
        }
    }

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + item.qty, 0);
            setLocalCartCount(count);
        };
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        return () => removeEventListener('storage', updateCartCount);
    })


    return (
        <header className={`${isRoot && !isScrolled ? 'home' : ''} ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo">
                    <a href="/" className="logo-link" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
                        <img 
                            src="/images/logo.png" 
                            alt="Melty Puff logo" 
                            className="logo-img"
                        />
                        <span className="site-name">Melty Puff</span>
                    </a>
                </div>
                <nav className="nav-menu">
                    <a href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/') }}>
                        HOME
                    </a>
                    <div className="nav-item dropdown">
                        <a 
                            href="/shop-non" 
                            className="dropdown-toggle"
                            onClick={(e) => { e.preventDefault(); handleNavigate('/shop-non') }}
                        >
                            SHOP
                        </a>
                        <div className="dropdown-menu">
                            <a 
                                href="/shop-non"
                                onClick={(e) => { e.preventDefault(); handleNavigate('/shop-non') }}
                            >
                                ノンニコチン
                            </a>
                            <a 
                                href="/shop-nic"
                                onClick={(e) => { e.preventDefault(); handleNavigate('/shop-nic') }}
                            >
                                ニコチンベイプ
                            </a>
                        </div>
                    </div>
                    <a 
                        href="/contact"
                        onClick={(e) => { e.preventDefault(); handleNavigate('/contact') }}
                    >
                        SUPPORT
                    </a>
                    <a 
                        href="/articles"
                        onClick={(e) => { e.preventDefault(); handleNavigate('/articles') }}
                    >
                        ARTICLES
                    </a>
                    
                    {/* ログイン状態に応じてACCOUNTリンクを変更 */}
                    {isLoggedIn ? (
                        <div className="nav-item dropdown user-menu">
                            <a 
                                href="#" 
                                className="user-name-link"
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    setShowUserMenu(!showUserMenu) 
                                }}
                            >
                                {user?.name || 'USER'}
                            </a>
                            {showUserMenu && (
                                <div className="dropdown-menu user-dropdown">
                                    <a 
                                        href="/account"
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            handleNavigate('/account');
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        マイページ
                                    </a>
                                    <a 
                                        href="/orders"
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            handleNavigate('/orders');
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        注文履歴
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a 
                            href="/account" 
                            className="account-link" 
                            onClick={(e) => { e.preventDefault(); handleNavigate('/login') }}
                        >
                            LOGIN
                        </a>
                    )}
                    
                    <a 
                        href="/cart" 
                        className="cart-button"
                        onClick={(e) => { e.preventDefault(); handleNavigate('/cart') }}
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
                        <span className="cart-count">{localCartCount}</span>                   
                    </a>
                </nav>
            </div>
        </header>
    )
}

export default Header