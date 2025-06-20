import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Top from './pages/Top'
import Support from './pages/Support'
import ShopNon from './pages/ShopNon'
import ShopNic from './pages/ShopNic'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Hyoki from './components/Hyoki'
import Account from './pages/Account'
import Cart from './pages/Cart'
import Redirect from './pages/Redirect'

function App() {
  // 現在のページ状態
  const [currentPage, setCurrentPage] = useState('')
  
  // ログイン状態管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  
  // カート状態管理
  const [cartCount, setCartCount] = useState(0)

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('user', JSON.stringify(userData))
    navigateTo('/')
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('user', '');
    navigateTo('/');
  }

  // 初期化：ページとログイン状態を確認
  useEffect(() => {
    const path = window.location.pathname
    setCurrentPage(path)

    const loggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInFlag)
    
  }, [])

  // currentPage が変わるたびに localStorage のログイン状態を再検証
  useEffect(() => {
    const stored = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(stored);
  }, [currentPage]);



  // ページ遷移関数（認証チェック付き）
  const navigateTo = (path) => {
    // 認証が必要なページのチェック
    const protectedPages = ['/account', '/orders', '/wishlist']
    const guestOnlyPages = ['/login', '/register']

    if (protectedPages.includes(path) && !isLoggedIn) {
      // 未ログインで保護されたページにアクセス → ログインページへ
      setCurrentPage('/login')
      window.history.pushState(null, '', '/login')
      return
    }

    if (guestOnlyPages.includes(path) && isLoggedIn) {
      // ログイン済みでゲスト専用ページにアクセス → アカウントページへ
      setCurrentPage('/account')
      window.history.pushState(null, '', '/account')
      return
    }

    setCurrentPage(path)
    window.history.pushState(null, '', path)
  }

  // ブラウザの戻る・進むボタン対応
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      navigateTo(path)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isLoggedIn])

  // ページコンポーネントのレンダリング（未実装のページはコメントアウト）
  const renderPage = () => {
    switch(currentPage) {
        case '/contact':
          return <Support />
        case '/privacy':
          return <div className="page">Privacy Policy (作成中)</div>
        case '/terms':
          return <div className="page">Terms of Service (作成中)</div>
        case '/hyouki':
          return <Hyoki />
        case '/shop-non':
          return <ShopNon />
        case '/shop-nic':
          return <ShopNic />
        case '/articles':
          return <div className="page">記事一覧 (作成中)</div>
        case '/login':
          return <Login navigateTo={navigateTo} onLogin={handleLogin}/>
        case '/account':
          return <Account user={user} onLogout={handleLogout}/>
        case '/cart':
          return <Cart isLoggedIn={isLoggedIn}/>
        case '/signup':
          return <Signup />
        case '/comfirmation_payment':
          return <Redirect />
        default:
            return <Top /> 
    }
  }

  return (
    <div className="app">
      {/* Headerに認証情報とナビゲーション関数を渡す */}
      <Header 
        navigateTo={navigateTo}
        isLoggedIn={isLoggedIn}
        user={user}
        cartCount={cartCount}
        currentPage={currentPage}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      {currentPage !== '/cart' && <Footer navigateTo={navigateTo} />}
    </div>
  )
}

export default App