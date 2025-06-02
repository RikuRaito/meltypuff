import './Footer.css'

function Footer() {
    // ページ遷移関数
    const navigateTo = (path) => {
        window.location.href = path
    }

    // 外部リンクを開く関数
    const openExternalLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <footer className='site-footer'>
            <div className="footer-container">
                <p>&copy; 2025 Melty Puff. All rights reserved.</p>
                <nav className="footer-nav">
                    <a 
                        href="/privacy"
                        onClick={(e) => { e.preventDefault(); navigateTo('/privacy') }}
                    >
                        Privacy Policy
                    </a>
                    <a 
                        href="/terms"
                        onClick={(e) => { e.preventDefault(); navigateTo('/terms') }}
                    >
                        Terms of Service
                    </a>
                    <a 
                        href="/contact"
                        onClick={(e) => { e.preventDefault(); navigateTo('/contact') }}
                    >
                        Contact Us
                    </a>
                    <a 
                        href="/hyouki"
                        onClick={(e) => { e.preventDefault(); navigateTo('/hyouki') }}
                    >
                        特定商法に基づく表記
                    </a>
                    <a 
                        href="https://www.instagram.com/meltypuff1_official1?igsh=cTJyM3IyMW44MTFq&utm_source=qr" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="footer-instagram"
                        onClick={(e) => { 
                            e.preventDefault(); 
                            openExternalLink('https://www.instagram.com/meltypuff1_official1?igsh=cTJyM3IyMW44MTFq&utm_source=qr') 
                        }}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="feather feather-instagram"
                        >
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </nav>
            </div>
        </footer>
    )
}

export default Footer