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


function App() {
  // 現在のページ状態
  const [currentPage, setCurrentPage] = useState('')
  
  // ログイン状態管理
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  
  // カート状態管理
  const [cartCount, setCartCount] = useState(0)

  // 初期化：ページとログイン状態を確認
  useEffect(() => {
    const path = window.location.pathname
    setCurrentPage(path)
    
    // ローカルストレージまたはトークンからログイン状態を復元
    // checkLoginStatus() // ← 一時的にコメントアウト（バックエンドがないため）
  }, [])


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
            return <div className="page">特定商法に基づく表記 (作成中)</div>
        case '/shop-non':
            return <ShopNon />
        case '/shop-nic':
            return <ShopNic />
        case '/articles':
            return <div className="page">記事一覧 (作成中)</div>
        case '/login':
            return <Login />
        case '/cart':
            return <div className="page">カート (作成中)</div>
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
        // onLogout={handleLogout} // ← コメントアウト
      />
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      <Footer navigateTo={navigateTo} />
    </div>
  )
}

export default App