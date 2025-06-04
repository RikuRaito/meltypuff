import { useState, useEffect } from 'react'
import './Top.css'

function Top() {
  const [activeTab, setActiveTab] = useState('nonNicotine')

  return (
    <div className="top-container">
      <section className='hero-section'>
        <video
          className="background-video"
          src='/images/vape.mp4'
          autoPlay
          muted     
          loop
        />
      </section>
      <div className='hero-content'>
        <h1 className='hero-titles'>
          <span>Melty Puffで</span>
          <br />
          <span>ベイプを</span>
          <br />
          <span>はじめよう</span>
        </h1>
        <button
          className='hero-button'
          onClick={() => window.location.href='/shop-non'}
        >
          Shop Now
        </button>
      </div>
      
      <section className='product-intro'>
        <div className='tabs'>
             <button
              className={activeTab == 'nonNicotine' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveTab('nonNicotine')}
              >
                ノンニコチンベイプ
              </button>
              <button
                className={activeTab == 'nicotine' ? 'tab-button active': 'tab-button'}
                onClick={() => setActiveTab('nicotine')}
              >
                ニコチンベイプ
              </button>
        </div>
        <div className='tab-content'>
          {activeTab == 'nonNicotine' && (
            <div className='tab-panel'>
                <div className='product-details'>
                <img
                  src='/images/lm_blueberry.jpg'
                  alt='Lost Mary Image'
                  className='product-image'
                />
                <div className='product-text'>
                  <h3>ノンニコチンベイプ</h3>
                  <p>アメリカのLOST MARYから日本向けに新登場</p>
                  <p>ニコチンを含んでいないので初心者におすすめ</p>
                  <button className='product-button' onClick={() => window.location.href='/shop-non'}>
                    商品を見てみる
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab == 'nicotine' && (
            <div className='tab-panel'>
              <div className='product-details'>
                <img
                  src='/images/PineappleIce.jpg'
                  alt='Naty Image'
                  className='product-image'
                />
                <div className='product-text'>
                  <h3>ニコチンベイプ</h3>
                  <p>Nastyはリッチでクセになるフレーバーが魅力の</p>
                  <p>ニコチンを含んだ世界中で人気のドバイ発のベイプブランドです</p>
                  <button className='product-button' onClick={() => window.location.href='/shop-nic'}>
                    商品を見てみる
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Top
