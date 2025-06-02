import { useState, useEffect } from 'react'
import './Top.css'

function Top() {

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
      
    </div>
  )
}

export default Top