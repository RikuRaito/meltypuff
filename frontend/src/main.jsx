import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Top from './pages/Top.jsx'
// import Contact from './pages/Contact.jsx'  // 必要に応じて

// 簡単なルーティング機能
function App() {
  // URLパスでページを判定
  const path = window.location.pathname
  
  const renderPage = () => {
    switch(path) {
      case '/about':
        return <About />
      case '/contact':
        // return <Contact />
        return <div className="page">Contact Page (作成中)</div>
      default:
        return <Top />
    }
  }

  return (
    <div className="app">
      {/* 全ページ共通のHeader */}
      <Header />
      {/* ページコンテンツ */}
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)